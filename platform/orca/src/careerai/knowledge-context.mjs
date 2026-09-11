import fs from 'node:fs';

const repositoryMemoryPath = new URL('../../../../_Knowledge_Center/Memory/REPOSITORY_MEMORY.md', import.meta.url);

export function getCareerKnowledgeContext() {
  const fallback = {
    ok: false,
    source: 'GetUpSoft Knowledge Center',
    topics: [],
    public_course_links: 0,
    source_policy: 'public metadata only; no cookies or credentials',
  };
  if (!fs.existsSync(repositoryMemoryPath)) return fallback;

  const text = fs.readFileSync(repositoryMemoryPath, 'utf8');
  const queries = text.match(/^- Queries:\s*(.+)$/m)?.[1] || '';
  const links = Number(text.match(/^- Public course links captured:\s*(\d+)$/m)?.[1] || 0);
  const policy = text.match(/^- Source policy:\s*(.+)$/m)?.[1] || fallback.source_policy;
  return {
    ok: true,
    source: 'GetUpSoft Knowledge Center',
    module: 'edX course enrichment',
    topics: queries.split(',').map((item) => item.trim()).filter(Boolean),
    public_course_links: links,
    source_policy: policy,
  };
}
