import { createHash } from "node:crypto";

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

export function hashContent(value: unknown): string {
  const content = typeof value === "string" ? value : stableStringify(value);
  return createHash("sha256").update(content).digest("hex");
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\w\s.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function termCodeFor(value: string): string {
  const normalized = normalizeText(value);
  return normalized.replace(/[\s_-]+/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "") || "unknown";
}

export function hexEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("hex");
}

export function makePointerUri(
  pointerType: string,
  workspaceId: string,
  targetTable: string,
  targetId: string,
): string {
  const scheme = pointerType.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "mem";
  return `${scheme}://ws/${workspaceId}/${targetTable}/${targetId}`;
}

export function computeExpiry(ttlSeconds?: number | null): string | null {
  if (!ttlSeconds || ttlSeconds <= 0) return null;
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

export function vectorForText(value: string, dimensions = 16): number[] {
  const digest = createHash("sha256").update(normalizeText(value)).digest();
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    const byte = digest[i % digest.length] ?? 0;
    vector.push(Number((byte / 255).toFixed(6)));
  }
  return vector;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  const size = Math.min(left.length, right.length);
  if (size === 0) return 0;

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < size; i++) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }

  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
