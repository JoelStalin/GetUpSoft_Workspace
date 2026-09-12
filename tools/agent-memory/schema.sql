-- agent-memory.db schema
-- Base unica local (SQLite) para: diccionario+hex de prompts, coordinacion de
-- agentes, timeline de cambios y validaciones con evidencia real.
-- Ver plan: C:\Users\yoeli\.claude\plans\breezy-inventing-conway.md

PRAGMA journal_mode = WAL;   -- permite lectura concurrente (ORCA) mientras se escribe
PRAGMA foreign_keys = ON;

-- 1. Captura de prompts -----------------------------------------------------

CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- el "codigo hex" es hex(id)
    word TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    agent_id TEXT,
    raw_text TEXT NOT NULL,          -- texto completo, nunca se pierde nada
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS prompt_tokens (
    prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    word_id INTEGER NOT NULL REFERENCES dictionary(id),
    PRIMARY KEY (prompt_id, position)
);
CREATE INDEX IF NOT EXISTS idx_prompt_tokens_word ON prompt_tokens(word_id);

-- Embeddings guardados como BLOB de float32 (formato struct 'f' * dim).
-- Busqueda de similitud se hace en Python (coseno) -- volumen de prompts es
-- bajo (miles, no millones), no justifica la dependencia de sqlite-vec.
CREATE TABLE IF NOT EXISTS embeddings (
    prompt_id INTEGER PRIMARY KEY REFERENCES prompts(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    dim INTEGER NOT NULL,
    vector BLOB NOT NULL
);

-- 2. Coordinacion de agentes --------------------------------------------------

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,             -- ej. 'antigravity-main', 'codex-worker-01'
    agent_type TEXT NOT NULL,
    is_paid INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_active TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    project TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    claimed_by TEXT REFERENCES agents(id),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Lock por directorio: un agente lo adquiere antes de tocar una ruta; otro
-- agente que la necesite debe esperar (polling con backoff), no fallar.
CREATE TABLE IF NOT EXISTS agent_locks (
    directory TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    agent_id TEXT NOT NULL REFERENCES agents(id),
    acquired_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 3. Timeline ligado a tareas -------------------------------------------------

CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(id),
    stage TEXT NOT NULL CHECK (stage IN (
        'planned', 'in_progress', 'implemented', 'tested', 'validated', 'reverted'
    )),
    commit_hash TEXT,
    description TEXT NOT NULL,
    created_by_agent TEXT REFERENCES agents(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_timeline_task ON timeline_events(task_id);

-- 4. Validaciones con evidencia real ------------------------------------------

CREATE TABLE IF NOT EXISTS validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    validator_agent_id TEXT NOT NULL REFERENCES agents(id),
    validator_is_paid INTEGER NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'test_output', 'log_file', 'screenshot', 'build_result'
    )),
    evidence_path TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'fail')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 5. Hallazgos de logs (errores/advertencias sin resolver) -------------------

CREATE TABLE IF NOT EXISTS log_findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file TEXT NOT NULL,
    line INTEGER NOT NULL,
    level TEXT NOT NULL,             -- ERROR | WARN | FAIL | EXCEPTION
    message TEXT NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0,
    first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (file, line, message)
);
CREATE INDEX IF NOT EXISTS idx_log_findings_unresolved ON log_findings(resolved);
