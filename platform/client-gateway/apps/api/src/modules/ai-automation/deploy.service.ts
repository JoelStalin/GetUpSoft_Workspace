import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

export interface DeployProject {
  id: string;
  name: string;
  path: string;
  deploy_script: string;
  health_url: string;
  version_file: string;
}

export interface DeployRecord {
  project_id: string;
  project_name: string;
  version: string;
  target: string;
  timestamp: string;
  status: 'in_progress' | 'success' | 'failed';
  logs: string;
  duration_seconds: number;
}

@Injectable()
export class DeployService {
  private readonly workspaceRoot = resolve(process.cwd(), '..', '..');
  private readonly historyFile = resolve(this.workspaceRoot, '.deploy_history.json');

  private readonly projects: Record<string, DeployProject> = {
    orca: {
      id: 'orca',
      name: 'ORCA AI Orchestrator',
      path: '03_AI_Automation/orca',
      deploy_script: 'deploy/deploy.sh',
      health_url: 'http://localhost:8015/health',
      version_file: '03_AI_Automation/orca/pyproject.toml',
    },
    'getupsoft-site': {
      id: 'getupsoft-site',
      name: 'GetUpSoft Website',
      path: '01_Core_Platform/getupsoft-site',
      deploy_script: 'deploy/deploy.sh',
      health_url: 'http://localhost:3120/health',
      version_file: '01_Core_Platform/getupsoft-site/package.json',
    },
    miniverse: {
      id: 'miniverse',
      name: 'Miniverse Image Processing',
      path: 'miniverse',
      deploy_script: 'deploy/deploy.sh',
      health_url: 'http://localhost:3000/health',
      version_file: 'miniverse/package.json',
    },
  };

  listProjects() {
    return Object.values(this.projects).map((project) => ({
      id: project.id,
      name: project.name,
      version: this.getVersion(project.id),
      status: 'unreachable',
      health_url: project.health_url,
    }));
  }

  projectStatus(projectId: string) {
    const project = this.projects[projectId];
    if (!project) throw new NotFoundException(`Project not found: ${projectId}`);
    return {
      id: project.id,
      name: project.name,
      version: this.getVersion(project.id),
      status: 'unreachable',
      health_url: project.health_url,
    };
  }

  deploy(projectId: string, target = 'dev') {
    return this.executeDeploy(projectId, target);
  }

  rollback(projectId: string) {
    const history = this.readHistory().filter((record) => record.project_id === projectId && record.status === 'success');
    if (history.length === 0) throw new NotFoundException(`No successful deployment found for ${projectId}`);
    return this.executeDeploy(projectId, history[history.length - 1].target);
  }

  async health(projectId: string) {
    const project = this.projects[projectId];
    if (!project) throw new NotFoundException(`Project not found: ${projectId}`);
    try {
      const response = await fetch(project.health_url);
      return { project_id: projectId, status: response.ok ? 'healthy' : 'unhealthy' };
    } catch {
      return { project_id: projectId, status: 'unreachable' };
    }
  }

  bumpVersion(projectId: string, bumpType: 'major' | 'minor' | 'patch' = 'patch') {
    const project = this.projects[projectId];
    if (!project) throw new NotFoundException(`Project not found: ${projectId}`);
    const versionPath = resolve(this.workspaceRoot, project.version_file);
    if (!existsSync(versionPath)) throw new NotFoundException(`Version file not found for ${projectId}`);
    const currentVersion = this.getVersion(projectId);
    const [major, minor, patch] = currentVersion.split('.').map((part) => Number(part));
    if ([major, minor, patch].some((value) => Number.isNaN(value))) {
      throw new NotFoundException(`Invalid version format: ${currentVersion}`);
    }
    const next = { major, minor, patch };
    if (bumpType === 'major') {
      next.major += 1;
      next.minor = 0;
      next.patch = 0;
    } else if (bumpType === 'minor') {
      next.minor += 1;
      next.patch = 0;
    } else {
      next.patch += 1;
    }
    const newVersion = `${next.major}.${next.minor}.${next.patch}`;
    const raw = readFileSync(versionPath, 'utf8');
    const updated =
      versionPath.endsWith('pyproject.toml')
        ? raw.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`)
        : raw.replace(/"version"\s*:\s*"[^"]+"/, `"version": "${newVersion}"`);
    writeFileSync(versionPath, updated, 'utf8');
    return { project_id: projectId, new_version: newVersion };
  }

  history(projectId?: string, limit = 50) {
    const records = this.readHistory();
    const filtered = projectId ? records.filter((record) => record.project_id === projectId) : records;
    return filtered.slice(-limit);
  }

  private getVersion(projectId: string) {
    const project = this.projects[projectId];
    if (!project) return 'unknown';
    const file = resolve(this.workspaceRoot, project.version_file);
    if (!existsSync(file)) return 'unknown';
    const content = readFileSync(file, 'utf8');
    if (file.endsWith('pyproject.toml')) {
      const match = content.match(/version\s*=\s*"([^"]+)"/);
      return match?.[1] ?? 'unknown';
    }
    if (file.endsWith('package.json')) {
      try {
        return (JSON.parse(content) as { version?: string }).version ?? 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  private executeDeploy(projectId: string, target: string): DeployRecord {
    const project = this.projects[projectId];
    if (!project) throw new NotFoundException(`Project not found: ${projectId}`);
    const startedAt = Date.now();
    const scriptPath = resolve(this.workspaceRoot, project.path, project.deploy_script);
    let status: DeployRecord['status'] = 'failed';
    let logs = '';

    if (!existsSync(scriptPath)) {
      logs = `Deploy script not found: ${scriptPath}`;
    } else {
      try {
        const stdout = execFileSync('bash', [scriptPath, target], {
          cwd: resolve(this.workspaceRoot, project.path),
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 600_000,
        });
        logs = stdout;
        status = 'success';
      } catch (error) {
        const err = error as { stdout?: string; stderr?: string; message?: string };
        logs = [err.stdout, err.stderr, err.message].filter(Boolean).join('\n');
        status = 'failed';
      }
    }

    const record: DeployRecord = {
      project_id: project.id,
      project_name: project.name,
      version: this.getVersion(project.id),
      target,
      timestamp: new Date().toISOString(),
      status,
      logs,
      duration_seconds: Number(((Date.now() - startedAt) / 1000).toFixed(3)),
    };
    const history = this.readHistory();
    history.push(record);
    this.writeHistory(history);
    return record;
  }

  private readHistory(): DeployRecord[] {
    if (!existsSync(this.historyFile)) return [];
    try {
      const content = readFileSync(this.historyFile, 'utf8');
      return JSON.parse(content) as DeployRecord[];
    } catch {
      return [];
    }
  }

  private writeHistory(history: DeployRecord[]) {
    if (!existsSync(dirname(this.historyFile))) {
      mkdirSync(dirname(this.historyFile), { recursive: true });
    }
    writeFileSync(this.historyFile, JSON.stringify(history, null, 2), 'utf8');
  }
}
