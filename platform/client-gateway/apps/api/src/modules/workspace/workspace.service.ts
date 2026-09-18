import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import {
  CommandExecuteRequestDto,
  FileDeleteRequestDto,
  FileReadRequestDto,
  FileWriteRequestDto,
  GitCommitRequestDto,
  GitPullRequestDto,
  GitPushRequestDto,
} from './dto/workspace.dto';

const execFileAsync = promisify(execFile);

export interface OperationLog {
  timestamp: string;
  type: 'file' | 'git' | 'command';
  operation: string;
  path: string;
  success: boolean;
  message: string;
}

@Injectable()
export class WorkspaceService {
  private readonly operations: OperationLog[] = [];
  private readonly workspaceRoot: string;

  constructor(private readonly config: ConfigService) {
    this.workspaceRoot = path.resolve(
      this.config.get<string>('WORKSPACE_ROOT') ?? path.resolve(process.cwd(), '../..'),
    );
  }

  async status() {
    return {
      workspace_root: this.workspaceRoot,
      initialized: true,
      git: await this.gitStatus(),
    };
  }

  async listFiles(relativePath = '.') {
    const dirPath = this.resolveSafePath(relativePath);
    const stat = await this.statOr404(dirPath, `Directory not found: ${relativePath}`);
    if (!stat.isDirectory()) {
      throw new BadRequestException(`Not a directory: ${relativePath}`);
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = await Promise.all(
      entries.sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const itemStat = await fs.stat(fullPath);
        return {
          name: entry.name,
          path: path.relative(this.workspaceRoot, fullPath).replace(/\\/g, '/'),
          type: entry.isDirectory() ? 'dir' : 'file',
          size: entry.isFile() ? itemStat.size : null,
        };
      }),
    );

    return { path: relativePath, files };
  }

  async readFile(request: FileReadRequestDto) {
    const filePath = this.resolveSafePath(request.path);
    const stat = await this.statOr404(filePath, `File not found: ${request.path}`);
    if (!stat.isFile()) throw new BadRequestException(`Not a file: ${request.path}`);

    const content = await fs.readFile(filePath, 'utf8');
    this.log('file', 'read', request.path, true, '');
    return { path: request.path, content };
  }

  async writeFile(request: FileWriteRequestDto) {
    this.requireMutationsEnabled();
    const filePath = this.resolveSafePath(request.path);
    if (request.create_dirs ?? true) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
    }
    await fs.writeFile(filePath, request.content, 'utf8');
    this.log('file', 'write', request.path, true, '');
    return { success: true, path: request.path };
  }

  async deleteFile(request: FileDeleteRequestDto) {
    this.requireMutationsEnabled();
    const filePath = this.resolveSafePath(request.path);
    const stat = await this.statOr404(filePath, `File not found: ${request.path}`);
    if (!stat.isFile()) throw new BadRequestException(`Not a file: ${request.path}`);
    await fs.unlink(filePath);
    this.log('file', 'delete', request.path, true, '');
    return { success: true, path: request.path };
  }

  async gitCommit(request: GitCommitRequestDto) {
    this.requireMutationsEnabled();
    if (request.files?.length) {
      for (const file of request.files) {
        this.resolveSafePath(file);
        await this.runGit(['add', file], 30);
      }
    } else {
      await this.runGit(['add', '-A'], 30);
    }
    const result = await this.runGit(['commit', '-m', request.message], 30, false);
    this.log('git', 'commit', await this.currentBranch(), result.success, result.message || result.error || '');
    if (!result.success) throw new BadRequestException(result.error);
    return result;
  }

  async gitPush(request: GitPushRequestDto) {
    this.requireMutationsEnabled();
    const args = ['push', 'origin', request.branch ?? 'main'];
    if (request.force) args.splice(1, 0, '--force-with-lease');
    const result = await this.runGit(args, 60, false);
    this.log('git', 'push', request.branch ?? 'main', result.success, result.message || result.error || '');
    if (!result.success) throw new BadRequestException(result.error);
    return result;
  }

  async gitPull(request: GitPullRequestDto) {
    this.requireMutationsEnabled();
    const result = await this.runGit(['pull', 'origin', request.branch ?? 'main'], 60, false);
    this.log('git', 'pull', request.branch ?? 'main', result.success, result.message || result.error || '');
    if (!result.success) throw new BadRequestException(result.error);
    return result;
  }

  async execute(request: CommandExecuteRequestDto) {
    this.requireMutationsEnabled();
    const parts = this.parseCommand(request.command);
    const command = parts[0]?.toLowerCase();
    const allowed = ['npm', 'pnpm', 'yarn', 'python', 'pip', 'git', 'docker', 'make', 'bash', 'sh'];
    if (!command || !allowed.includes(command)) {
      throw new ForbiddenException(`Command '${command ?? ''}' not in whitelist. Allowed: ${allowed.join(', ')}`);
    }
    const cwd = request.cwd ? this.resolveSafePath(request.cwd) : this.workspaceRoot;
    const result = await this.exec(parts[0], parts.slice(1), cwd, request.timeout ?? 300, false);
    this.log('command', command, request.cwd ?? '.', result.success, result.message || result.error || '');
    if (!result.success) throw new BadRequestException(result.error);
    return result;
  }

  getOperationsLog() {
    return this.operations;
  }

  private async gitStatus() {
    try {
      const branch = (await this.runGit(['rev-parse', '--abbrev-ref', 'HEAD'], 10)).message.trim() || 'unknown';
      const status = await this.runGit(['status', '--porcelain', '--untracked-files=no'], 5, false);
      const unpushed = await this.runGit(['log', 'origin/main..HEAD', '--oneline', '-n', '20'], 5, false);
      const changes = status.message.split(/\r?\n/).filter(Boolean);
      return {
        branch,
        changes: status.success ? changes : [],
        unpushed_commits: unpushed.success ? unpushed.message.split(/\r?\n/).filter(Boolean) : [],
        has_changes: changes.length > 0,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        branch: 'unknown',
        changes: [],
        has_changes: false,
      };
    }
  }

  private async currentBranch() {
    const result = await this.runGit(['rev-parse', '--abbrev-ref', 'HEAD'], 10, false);
    return result.success ? result.message.trim() : 'unknown';
  }

  private async runGit(args: string[], timeout: number, throwOnFailure = true) {
    return this.exec('git', args, this.workspaceRoot, timeout, throwOnFailure);
  }

  private async exec(command: string, args: string[], cwd: string, timeoutSeconds: number, throwOnFailure = true) {
    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        cwd,
        timeout: timeoutSeconds * 1000,
        maxBuffer: 1024 * 1024 * 5,
        windowsHide: true,
      });
      return { success: true, message: stdout, error: stderr || null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (throwOnFailure) throw new InternalServerErrorException(message);
      return { success: false, message: '', error: message };
    }
  }

  private resolveSafePath(relativePath: string) {
    const resolved = path.resolve(this.workspaceRoot, relativePath);
    if (resolved !== this.workspaceRoot && !resolved.startsWith(this.workspaceRoot + path.sep)) {
      throw new ForbiddenException('Path traversal blocked');
    }
    return resolved;
  }

  private async statOr404(resolvedPath: string, message: string) {
    try {
      return await fs.stat(resolvedPath);
    } catch {
      throw new NotFoundException(message);
    }
  }

  private requireMutationsEnabled() {
    if (this.config.get<string>('ORCA_WORKSPACE_MUTATIONS_ENABLED') !== 'true') {
      throw new ForbiddenException('Workspace mutations are disabled. Set ORCA_WORKSPACE_MUTATIONS_ENABLED=true to enable this endpoint.');
    }
  }

  private parseCommand(command: string) {
    const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
    return parts.map((part) => part.replace(/^"|"$/g, ''));
  }

  private log(type: OperationLog['type'], operation: string, targetPath: string, success: boolean, message: string) {
    this.operations.push({
      timestamp: new Date().toISOString(),
      type,
      operation,
      path: targetPath,
      success,
      message,
    });
  }
}
