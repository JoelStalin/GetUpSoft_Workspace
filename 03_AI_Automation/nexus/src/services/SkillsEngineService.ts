import type { Database } from "../storage/Database.ts";
import { SkillRepository, type NewSkill } from "../storage/repositories/SkillRepository.ts";
import type { Skill, Agent } from "../storage/entities.ts";

export type SkillSuggestionInput = {
  workspaceId: string;
  agent?: Agent;
  stack?: string;
  framework?: string;
  recentContext?: string[];
};

export class SkillsEngineService {
  private repo: SkillRepository;

  constructor(db: Database) {
    this.repo = new SkillRepository(db);
  }

  register(input: NewSkill): Skill {
    return this.repo.upsert(input);
  }

  bind(skillId: string, agentId: string, workspaceId?: string, bindingContext?: string) {
    return this.repo.bind(skillId, agentId, workspaceId, bindingContext);
  }

  suggest(input: SkillSuggestionInput): Skill[] {
    const pool = this.repo.findApplicable(["global", "workspace", "stack", "agent"], input.workspaceId);
    return pool
      .map((skill) => ({ skill, score: this.score(skill, input) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.skill);
  }

  private score(skill: Skill, input: SkillSuggestionInput): number {
    let score = 0.1;
    if (skill.scope === "global") score += 0.1;
    if (skill.scope === "workspace") score += 0.3;
    if (skill.scope === "stack" && skill.stack && input.stack && skill.stack === input.stack) score += 0.35;
    if (skill.framework && input.framework && skill.framework === input.framework) score += 0.25;
    if (input.agent && skill.scope === "agent") {
      const context = `${skill.description ?? ""} ${skill.skillBody ?? ""}`.toLowerCase();
      if (context.includes(input.agent.adapterType.toLowerCase()) || context.includes(input.agent.name.toLowerCase())) {
        score += 0.35;
      }
    }
    const recentContext = (input.recentContext ?? []).join(" ").toLowerCase();
    if (recentContext && skill.tagsJson !== "[]") {
      const tags = JSON.parse(skill.tagsJson) as string[];
      if (tags.some((tag) => recentContext.includes(tag.toLowerCase()))) {
        score += 0.15;
      }
    }
    return score;
  }
}
