# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --upgrade pip uv && \
    uv pip install --system -e . && \
    pip cache purge

# Stage 2: Runtime
FROM python:3.11-slim

LABEL maintainer="GetUpSoft DevOps Team"
LABEL description="ORCA: AI Automation Orchestrator for GetUpSoft Workspace"
LABEL version="0.2.0"

# Non-root user
RUN useradd -m -u 1000 -s /sbin/nologin orca

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=orca:orca src/ ./src/
COPY --chown=orca:orca config/ ./config/
COPY --chown=orca:orca README.md .

# Create artifacts directory with proper permissions
RUN mkdir -p /app/.artifacts && \
    chown -R orca:orca /app

USER orca

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -m httpx GET http://localhost:8787/health || exit 1

EXPOSE 8787

# Uvicorn: factory pattern with host 0.0.0.0 for Kubernetes
ENTRYPOINT ["uvicorn"]
CMD ["--factory", "ai_automation_orchestrator.webapp:create_app", \
     "--host", "0.0.0.0", "--port", "8787"]
