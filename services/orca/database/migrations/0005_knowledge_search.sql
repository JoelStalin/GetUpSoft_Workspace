-- K02: full-text + recuperacion semantica (seccion 3.8 del diseno). Requiere pgvector
-- (imagen pgvector/pgvector:pg17, no la imagen postgres:17-alpine estandar).

CREATE EXTENSION IF NOT EXISTS vector;

-- Full-text: columna generada, nunca se escribe a mano -- se deriva siempre de chunks.text,
-- imposible que quede desincronizada.
ALTER TABLE knowledge.chunks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', text)) STORED;
CREATE INDEX chunks_search_vector_idx ON knowledge.chunks USING GIN (search_vector);

-- Semantico: pgvector requiere declarar la dimension del vector en la columna. 1536 es
-- la dimension mas comun (OpenAI text-embedding-3-small, muchos modelos locales via
-- Ollama) -- documentado explicitamente como una eleccion, no un valor magico sin razon.
ALTER TABLE knowledge.embeddings ADD COLUMN value vector(1536);
CREATE INDEX embeddings_value_idx ON knowledge.embeddings USING hnsw (value vector_cosine_ops);

-- Recuperacion combinada: full-text (peso alto si hay match exacto de termino) + semantico
-- (similitud coseno) sobre los chunks de fuentes YA verificadas (nunca busca en fuentes no
-- verificadas o revocadas -- la busqueda respeta la misma politica de K01, no una nueva).
CREATE OR REPLACE FUNCTION knowledge.search_chunks(
  p_organization_id uuid,
  p_project_id uuid,
  p_query_text text,
  p_query_embedding vector(1536),
  p_limit integer DEFAULT 10
) RETURNS TABLE (
  chunk_id uuid,
  source_version_id uuid,
  source_id uuid,
  text text,
  full_text_rank real,
  semantic_similarity real
) AS $$
  SELECT
    c.id,
    c.source_version_id,
    sv.source_id,
    c.text,
    ts_rank(c.search_vector, plainto_tsquery('spanish', p_query_text)) AS full_text_rank,
    1 - (e.value <=> p_query_embedding) AS semantic_similarity
  FROM knowledge.chunks c
  JOIN knowledge.source_versions sv
    ON sv.organization_id = c.organization_id AND sv.project_id = c.project_id AND sv.id = c.source_version_id
  JOIN knowledge.sources s
    ON s.organization_id = sv.organization_id AND s.project_id = sv.project_id AND s.id = sv.source_id
  LEFT JOIN knowledge.embeddings e
    ON e.organization_id = c.organization_id AND e.project_id = c.project_id AND e.chunk_id = c.id
  WHERE c.organization_id = p_organization_id
    AND c.project_id = p_project_id
    AND s.verification_status = 'verified'
  ORDER BY (
    COALESCE(ts_rank(c.search_vector, plainto_tsquery('spanish', p_query_text)), 0) * 0.4
    + COALESCE(1 - (e.value <=> p_query_embedding), 0) * 0.6
  ) DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
