// apps/orca/src/careerai/language-detector.mjs
// Nodo language-analyzer: detecta automaticamente si la oferta esta en ingles o espanol
// para gobernar el idioma de salida de CVs, Cartas y screening answers.

const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
  'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le',
  'ya', 'o', 'este', 'si', 'porque', 'esta', 'son', 'entre', 'esta', 'cuando', 'muy',
  'sin', 'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo',
  'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso',
  'requisitos', 'funciones', 'experiencia', 'ofrecemos', 'beneficios', 'conocimientos'
]);

const ENGLISH_STOPWORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not',
  'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from',
  'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
  'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'requirements', 'responsibilities', 'qualifications', 'experience', 'benefits', 'stack'
]);

export function detectLanguage(text = '') {
  try {
    const cleanText = String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    const tokens = cleanText.split(/\s+/).filter((t) => t.length > 1);
    if (!tokens.length) return { language: 'en', confidence: 0.5, reason: 'empty_text_default_en' };

    let esScore = 0;
    let enScore = 0;

    for (const token of tokens) {
      if (SPANISH_STOPWORDS.has(token)) esScore += 1;
      if (ENGLISH_STOPWORDS.has(token)) enScore += 1;
    }

    const total = esScore + enScore;
    if (total === 0) return { language: 'en', confidence: 0.6, es_score: 0, en_score: 0, reason: 'low_signal_default_en' };

    const esRatio = esScore / total;
    const isSpanish = esRatio > 0.55;
    const detected = isSpanish ? 'es' : 'en';
    const confidence = Number((Math.max(esScore, enScore) / total).toFixed(2));

    return {
      ok: true,
      language: detected,
      locale: detected === 'es' ? 'es-ES' : 'en-US',
      confidence,
      stats: { es_matches: esScore, en_matches: enScore, total_evaluated: total }
    };
  } catch (error) {
    return {
      ok: false,
      language: 'en',
      locale: 'en-US',
      confidence: 0.5,
      error: error.message
    };
  }
}
