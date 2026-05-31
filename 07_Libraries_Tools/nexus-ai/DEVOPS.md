# DevOps & Sandbox Setup (Pre-production)

This project (Agent Continuity Hub) is now configured for a **Pre-production** environment, incorporating continuous integration and a local Sandbox for workflow automation testing using **n8n**.

## 1. Continuous Integration (CI)

A GitHub Actions workflow is located at `.github/workflows/ci.yml`. It runs automatically on push and pull requests to the `main` branch. The pipeline:
- Installs dependencies (`npm ci`).
- Compiles the extension (`npm run compile`).
- Runs the comprehensive test suite (`npm run test`).
- Validates the Docker Compose configuration.

## 2. Docker & n8n Sandbox

To test AIHUB worker orchestration with external automation tools, a Sandbox environment using **n8n** is provided.

### Prerequisites
- Docker and Docker Compose installed.

### Starting the Sandbox
From the root directory, start the n8n container in the background:
```bash
docker-compose up -d
```

Access the n8n interface at: `http://localhost:5678`

### Loading Test Workflows
We have provided a sample testing workflow in `workflows/n8n/translator_worker_test.json`.
1. Open n8n in your browser.
2. Go to **Workflows**.
3. Click **Add Workflow** -> **Import from File**.
4. Select `workflows/n8n/translator_worker_test.json`.
5. This workflow mimics an HTTP request calling the Translator Worker and uses an `If` node to validate that the output contains expected corrected values (e.g. converting typos into "worker").

*(Note: Since AIHUB operates as a VS Code extension, the workflow points to a mock internal endpoint `http://host.docker.internal:3000/worker/translator`. To make this fully end-to-end, you would start a mock express server in Node mapping to `agentWorker.ts`'s HANDLERS, or adapt the n8n `Execute Command` node to run the `node` CLI testing script directly).*

## 3. Test Suite

The project includes unit tests and worker functional tests. The worker tests are located in `tests/worker_functional.test.mjs`.

Run the entire suite locally before committing:
```bash
npm run test
```

## System Status
- Unit tests: Passing.
- Functional worker tests: Passing.
- CI/CD pipeline: Configured.
- Orchestration Sandbox: Provided via n8n (Docker).

The system is stable and ready for pre-production.
