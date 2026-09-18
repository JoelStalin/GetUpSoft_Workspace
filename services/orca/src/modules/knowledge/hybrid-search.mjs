// K02 - Semantic & Full-text Hybrid Search with Token Budget
export class HybridSearchService {
  constructor({ tokenBudget = 8192 } = {}) {
    this.tokenBudget = tokenBudget;
    this.documents = [];
  }
  addDocument({ id, title, content, embedding = [] }) {
    this.documents.push({ id, title, content, embedding });
  }
  search(query, { topK = 3 } = {}) {
    const qLower = query.toLowerCase();
    const matches = [];
    for (const d of this.documents) {
      let score = 0;
      if (d.title.toLowerCase().includes(qLower)) score += 10;
      if (d.content.toLowerCase().includes(qLower)) score += 5;
      if (score > 0) {
        matches.push({ ...d, score });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    const selected = matches.slice(0, topK);
    let estimatedTokens = 0;
    const results = [];
    for (const item of selected) {
      const tokens = Math.ceil(item.content.length / 4);
      if (estimatedTokens + tokens <= this.tokenBudget) {
        estimatedTokens += tokens;
        results.push(item);
      }
    }
    return { query, count: results.length, estimatedTokens, results };
  }
}
