import { createHash } from "node:crypto";

export type ToolOffloadResult = {
  contentHash: string;
  preview: string;
  bytes: number;
};

export class CompactionEngine {
  private readonly previewChars: number;

  constructor(previewChars: number = 280) {
    this.previewChars = previewChars;
  }

  microcompact(messages: string[], maxItems: number): string[] {
    if (maxItems <= 0) {
      return [];
    }

    if (messages.length <= maxItems) {
      return messages;
    }

    const head = messages.slice(0, Math.max(maxItems - 1, 0)).join(" ");
    const summary = this.summarize(head);
    const last = messages[messages.length - 1];
    return [summary, last].filter(Boolean);
  }

  offloadToolOutput(rawOutput: string): ToolOffloadResult {
    const contentHash = createHash("sha256").update(rawOutput).digest("hex");
    return {
      contentHash,
      preview: rawOutput.slice(0, this.previewChars),
      bytes: Buffer.byteLength(rawOutput, "utf8"),
    };
  }

  private summarize(content: string): string {
    const normalized = content.replace(/\s+/g, " ").trim();
    if (normalized.length <= this.previewChars) {
      return normalized;
    }
    return `${normalized.slice(0, this.previewChars - 3)}...`;
  }
}
