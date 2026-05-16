# Integrate OpenTypeless-Inspired Jarvis

## Goal

Strengthen ORCA Jarvis with a contract-driven voice pipeline inspired by OpenTypeless, without importing Tauri/Rust/React into the Python core and without introducing remote-token dependency for local interpretation.

## Required constraints

- Keep the ORCA core offline-first.
- Do not add paid provider dependencies.
- Do not send audio to the cloud by default.
- Do not store secrets in the repository.
- Use Python contracts, adapters, tests, and docs first.
- Keep existing tests green.

## MVP scope

- STT provider interface
- mock STT provider
- custom dictionary
- voice command router
- transcript history with redaction
- Jarvis listener event model
- ORCA prompt interpreter adapter
- CLI commands for transcript and mock audio
- JSON output adapter

## Expected output

- ADR updated
- backlog updated
- tests passing
- docs explaining what is intentionally deferred
