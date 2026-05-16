/**
 * Linguistic, translation, and NLP helpers.
 * Used by: translator-worker, linguistic-qa
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Language = "en" | "es" | "fr" | "de" | "pt" | "it" | "zh" | "ja" | "mixed" | "unknown";

export interface TranslationUnit {
  source: string;
  target: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  confidence: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TRANSLATOR-WORKER helpers ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect language from text using signal tokens. */
export function detectLanguage(text: string): Language {
  const t = ` ${text.toLowerCase()} `;
  const signals: Array<[Language, RegExp]> = [
    ["es", /\b(el|la|de|que|para|con|por|una|los|las|del|este|esta|como|más)\b/],
    ["fr", /\b(le|la|de|que|pour|avec|dans|est|les|des|une|pas|sont)\b/],
    ["de", /\b(der|die|das|und|ist|von|mit|auf|nicht|sich|sind|auch)\b/],
    ["pt", /\b(de|que|para|com|uma|por|não|como|mais|isso|este)\b/],
    ["en", /\b(the|and|for|with|this|that|from|are|have|not|will)\b/],
    ["zh", /[\u4e00-\u9fff]/],
    ["ja", /[\u3040-\u309f\u30a0-\u30ff]/],
  ];
  const scores: Partial<Record<Language, number>> = {};
  for (const [lang, re] of signals) {
    const matches = t.match(new RegExp(re.source, "g")) ?? [];
    scores[lang] = matches.length;
  }
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  if (!sorted[0] || sorted[0][1] === 0) return "unknown";
  if (sorted[1] && sorted[1][1] > 0 && sorted[0][1] / (sorted[1][1] || 1) < 2) return "mixed";
  return sorted[0][0] as Language;
}

/** Detect text encoding issues (mojibake indicators). */
export function detectEncodingIssues(text: string): boolean {
  return /Ã©|Ã¡|Ã±|Ã³|Ã¼|â€™|â€œ/.test(text);
}

/** Normalize whitespace and punctuation. */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/([.!?])\s*([A-Z])/g, "$1 $2").trim();
}

/** Correct common Spanish typos. */
export function correctSpanishTypos(text: string): string {
  const corrections: Array<[RegExp, string]> = [
    [/\bidetificar\b/gi, "identificar"],
    [/\bgramticos\b/gi, "gramaticales"],
    [/\bcomprecion\b/gi, "comprensión"],
    [/\btraducion\b/gi, "traducción"],
    [/\btraductor\b/gi, "traductor"],
    [/\benriquesimiento\b/gi, "enriquecimiento"],
    [/\basecures\b/gi, "asegures"],
    [/\blavor\b/gi, "labor"],
  ];
  let result = text;
  for (const [pattern, replacement] of corrections) result = result.replace(pattern, replacement);
  return result;
}

/** Correct common English typos. */
export function correctEnglishTypos(text: string): string {
  const corrections: Array<[RegExp, string]> = [
    [/\bteh\b/gi, "the"],
    [/\brecieve\b/gi, "receive"],
    [/\boccured\b/gi, "occurred"],
    [/\bneccessary\b/gi, "necessary"],
    [/\bseperate\b/gi, "separate"],
    [/\bdefinately\b/gi, "definitely"],
    [/\baccommodate\b/gi, "accommodate"],
  ];
  let result = text;
  for (const [pattern, replacement] of corrections) result = result.replace(pattern, replacement);
  return result;
}

/** Apply corrections based on detected language. */
export function autocorrectText(text: string, lang?: Language): string {
  const detected = lang ?? detectLanguage(text);
  if (detected === "es") return correctSpanishTypos(normalizeText(text));
  if (detected === "en") return correctEnglishTypos(normalizeText(text));
  return normalizeText(text);
}

/** Score translation confidence (0–1). */
export function scoreTranslationConfidence(unit: TranslationUnit): number {
  let score = unit.confidence;
  if (unit.source.length < 5) score *= 0.7; // very short source
  if (unit.source === unit.target) score *= 0.5; // unchanged
  return Math.min(1, Math.round(score * 100) / 100);
}

/** Build a multilingual worker prompt. */
export function buildMultilingualPrompt(workerName: string, task: string, lang: Language): string {
  const templates: Partial<Record<Language, string>> = {
    en: `Worker: ${workerName}. Task: ${task}. Please provide a structured response in English.`,
    es: `Worker: ${workerName}. Tarea: ${task}. Por favor, proporcione una respuesta estructurada en español.`,
    fr: `Worker: ${workerName}. Tâche: ${task}. Veuillez fournir une réponse structurée en français.`,
    de: `Worker: ${workerName}. Aufgabe: ${task}. Bitte geben Sie eine strukturierte Antwort auf Deutsch.`,
  };
  return templates[lang] ?? templates["en"] ?? `Worker: ${workerName}. Task: ${task}.`;
}

/** Extract action items from a multilingual text. */
export function extractActionItems(text: string): string[] {
  const patterns = [
    /(?:debe|should|must|hay que|need to|it is required)\s+(.+?)(?:\.|$)/gi,
    /[-•]\s+(.+?)(?:\n|$)/g,
    /\d+\.\s+(.+?)(?:\n|$)/g,
  ];
  const results: string[] = [];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      results.push(match[1].trim());
    }
    pattern.lastIndex = 0;
  }
  return [...new Set(results)].slice(0, 10);
}

/** Compute text similarity using Jaccard on word sets. */
export function computeTextSimilarity(textA: string, textB: string): number {
  const setA = new Set(textA.toLowerCase().split(/\s+/));
  const setB = new Set(textB.toLowerCase().split(/\s+/));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : Math.round((intersection / union) * 100) / 100;
}

/** Segment text into sentences. */
export function segmentSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** Detect mixed-language sentences. */
export function detectMixedLanguageSentences(sentences: string[]): number[] {
  return sentences.reduce<number[]>((acc, s, i) => {
    if (detectLanguage(s) === "mixed") acc.push(i);
    return acc;
  }, []);
}

/** Build translation memory key from source text. */
export function buildTranslationMemoryKey(source: string, sourceLang: Language, targetLang: Language): string {
  const normalized = source.toLowerCase().trim().replace(/\s+/g, " ").slice(0, 100);
  return `${sourceLang}→${targetLang}::${normalized}`;
}

/** Score multilingual content readiness. */
export function scoreI18nReadiness(params: { hasLocaleFiles: boolean; hasICUFormat: boolean; hardcodedStrings: number; totalStrings: number }): number {
  let score = 0;
  if (params.hasLocaleFiles) score += 40;
  if (params.hasICUFormat) score += 30;
  const ratio = params.totalStrings > 0 ? 1 - params.hardcodedStrings / params.totalStrings : 1;
  score += Math.round(ratio * 30);
  return Math.min(100, score);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── LINGUISTIC-QA helpers ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect passive voice constructions (English). */
export function detectPassiveVoice(sentences: string[]): number[] {
  const passiveRe =
    /\b(?:is|are|was|were|be|been|being)\s+(?:\w+ed|\w+en|written|built|made|seen|known|given|taken|shown)\b/i;
  return sentences.reduce<number[]>((acc, s, i) => { if (passiveRe.test(s)) acc.push(i); return acc; }, []);
}

/** Detect overly long sentences. */
export function detectLongSentences(sentences: string[], maxWords = 30): number[] {
  return sentences.reduce<number[]>((acc, s, i) => {
    if (s.split(/\s+/).length > maxWords) acc.push(i);
    return acc;
  }, []);
}

/** Score grammatical consistency (heuristic). */
export function scoreGrammarConsistency(text: string): number {
  let score = 100;
  if (/\bi\s+[a-z]/g.test(text)) score -= 10; // lowercase "i"
  if (/\s{2,}/.test(text)) score -= 5; // extra spaces
  if (/[.!?]{2,}/.test(text)) score -= 5; // multiple punctuation
  if (/,\s*,/.test(text)) score -= 10; // double comma
  return Math.max(0, score);
}

/** Detect terminology inconsistencies. */
export function detectTerminologyInconsistency(text: string, termMap: Record<string, string>): Array<{ found: string; preferred: string }> {
  const results: Array<{ found: string; preferred: string }> = [];
  for (const [preferred, variants] of Object.entries(termMap)) {
    for (const variant of variants.split(",").map((v) => v.trim())) {
      if (new RegExp(`\\b${variant}\\b`, "i").test(text) && !new RegExp(`\\b${preferred}\\b`, "i").test(text)) {
        results.push({ found: variant, preferred });
      }
    }
  }
  return results;
}

/** Compute Flesch-Kincaid Grade Level. */
export function computeFleschKincaidGrade(text: string): number {
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const words = (text.match(/\b\w+\b/g) ?? []).length || 1;
  const syllables = text.replace(/[^aeiou]/gi, "").length || 1;
  return Math.round((0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59) * 10) / 10;
}

/** Detect placeholder text not replaced. */
export function detectUnreplacedPlaceholders(text: string): string[] {
  const placeholderRe = /\[(TODO|PLACEHOLDER|TBD|INSERT|EXAMPLE|LOREM)\b[^\]]*\]/gi;
  return [...text.matchAll(placeholderRe)].map((m) => m[0]);
}

/** Score linguistic quality overall. */
export function scoreLinguisticQuality(params: {
  grammarScore: number;
  readabilityScore: number;
  passiveCount: number;
  longSentenceCount: number;
  placeholderCount: number;
}): number {
  let score = (params.grammarScore + params.readabilityScore) / 2;
  score -= params.passiveCount * 3;
  score -= params.longSentenceCount * 5;
  score -= params.placeholderCount * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Build localization string map from source text. */
export function extractLocalizableStrings(lines: string[]): Array<{ key: string; value: string }> {
  const results: Array<{ key: string; value: string }> = [];
  const re = /(?:t|i18n|translate)\s*\(\s*['"]([^'"]+)['"]/g;
  for (const line of lines) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(line)) !== null) results.push({ key: match[1], value: match[1] });
    re.lastIndex = 0;
  }
  return results;
}

/** Detect translatable strings not wrapped in i18n function. */
export function detectHardcodedUIStrings(lines: string[]): Array<{ line: number; text: string }> {
  const results: Array<{ line: number; text: string }> = [];
  const uiContextRe = /(?:label|placeholder|title|aria-label|alt)\s*=\s*['"]([A-Z][^'"]{3,})['"]/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(uiContextRe);
    if (match) results.push({ line: i + 1, text: match[1] });
  }
  return results;
}
