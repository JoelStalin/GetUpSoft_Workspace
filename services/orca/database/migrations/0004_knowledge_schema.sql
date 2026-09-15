-- K01: esquema de conocimiento y prompts (seccion 3.3 del diseno). Requiere
-- 0001_iam_schema.sql + 0003_row_level_security.sql ya aplicados.

CREATE SCHEMA IF NOT EXISTS knowledge;

CREATE TABLE knowledge.sources (
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    canonical_uri text NOT NULL,
    classification text NOT NULL,
    verification_status text NOT NULL DEFAULT 'unverified',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id) REFERENCES iam.projects (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, canonical_uri),
    CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
    CHECK (verification_status IN ('unverified', 'verified', 'flagged', 'revoked'))
);

-- Inmutable por diseno (regla 3.3): una nueva version nunca sobreescribe la anterior. Sin
-- UPDATE/DELETE para el rol de aplicacion normal (ver GRANTs abajo) -- append-only real,
-- no solo una convencion documentada.
CREATE TABLE knowledge.source_versions (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    source_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content_hash text NOT NULL,
    git_revision text,
    observed_at timestamptz NOT NULL DEFAULT now(),
    verified_at timestamptz,

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, source_id) REFERENCES knowledge.sources (organization_id, project_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, source_id, content_hash)
);

CREATE TABLE knowledge.chunks (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    source_version_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ordinal integer NOT NULL,
    text text NOT NULL,
    content_hash text NOT NULL,

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, source_version_id) REFERENCES knowledge.source_versions (organization_id, project_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, source_version_id, ordinal)
);

-- Los embeddings son derivados (regla 3.3): se pueden borrar y reconstruir sin perder
-- conocimiento -- por eso viven en tabla aparte con ON DELETE CASCADE desde chunks, y no
-- llevan su propio content_hash (serian redundantes con el del chunk).
CREATE TABLE knowledge.embeddings (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    chunk_id uuid NOT NULL,
    model_digest text NOT NULL,
    dimension integer NOT NULL,

    PRIMARY KEY (organization_id, project_id, chunk_id, model_digest),
    FOREIGN KEY (organization_id, project_id, chunk_id) REFERENCES knowledge.chunks (organization_id, project_id, id) ON DELETE CASCADE,
    CHECK (dimension > 0)
);

CREATE TABLE knowledge.prompt_templates (
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id) REFERENCES iam.projects (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, slug)
);

CREATE TABLE knowledge.prompt_versions (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    template_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    version integer NOT NULL,
    content_hash text NOT NULL,
    status text NOT NULL DEFAULT 'draft',

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, template_id) REFERENCES knowledge.prompt_templates (organization_id, project_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, template_id, version),
    CHECK (status IN ('draft', 'published', 'deprecated'))
);

-- RLS: mismo patron que 0003, aplicado a todo el esquema nuevo.
ALTER TABLE knowledge.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.sources FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.sources USING (organization_id = iam.current_organization_id());

ALTER TABLE knowledge.source_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.source_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.source_versions USING (organization_id = iam.current_organization_id());

ALTER TABLE knowledge.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.chunks FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.chunks USING (organization_id = iam.current_organization_id());

ALTER TABLE knowledge.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.embeddings FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.embeddings USING (organization_id = iam.current_organization_id());

ALTER TABLE knowledge.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.prompt_templates FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.prompt_templates USING (organization_id = iam.current_organization_id());

ALTER TABLE knowledge.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.prompt_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON knowledge.prompt_versions USING (organization_id = iam.current_organization_id());

GRANT USAGE ON SCHEMA knowledge TO orca_api;
-- sources/source_versions/chunks/embeddings: orca_indexer escribe, orca_api solo lee (el
-- indexado es un proceso separado, no una escritura arbitraria desde una request HTTP).
GRANT SELECT ON ALL TABLES IN SCHEMA knowledge TO orca_api;
GRANT SELECT, INSERT ON knowledge.sources, knowledge.source_versions, knowledge.chunks, knowledge.embeddings TO orca_indexer;
GRANT USAGE ON SCHEMA knowledge TO orca_indexer;
GRANT INSERT, UPDATE ON knowledge.prompt_templates, knowledge.prompt_versions TO orca_api;
