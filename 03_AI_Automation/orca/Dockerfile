FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY src ./src
COPY config ./config
COPY libs ./libs

RUN pip install --no-cache-dir .
RUN pip install -e ./libs/hermes-agent[all]

EXPOSE 8015

CMD ["uvicorn", "ai_automation_orchestrator.webapp:create_app", "--factory", "--host", "0.0.0.0", "--port", "8015"]

