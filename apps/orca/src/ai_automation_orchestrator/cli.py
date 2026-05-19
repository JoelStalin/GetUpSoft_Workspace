from __future__ import annotations

import argparse
from pathlib import Path

from ai_automation_orchestrator.config import load_config
from ai_automation_orchestrator.generators.automation_flows import build_automation_flow_messages
from ai_automation_orchestrator.generators.interaction_scripts import build_interaction_script_messages
from ai_automation_orchestrator.generators.test_flows import build_test_flow_messages
from ai_automation_orchestrator.nvidia_catalog import write_nvidia_snapshot_and_catalog
from ai_automation_orchestrator.rowboat import RowboatClient, extract_output_text, load_rowboat_settings
from ai_automation_orchestrator.service import OrchestratorService
from ai_automation_orchestrator.webapp import create_app


def write_output(content: str, output: str | None) -> None:
    if not output:
        print(content)
        return

    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"Generated file: {output_path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AI Automation Orchestrator")
    parser.add_argument("--config", help="Ruta al catalogo de modelos.", default=None)
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_models = subparsers.add_parser("list-models", help="Lista modelos disponibles.")
    list_models.add_argument("--model", default=None, help=argparse.SUPPRESS)

    test_flow = subparsers.add_parser("generate-test-flow", help="Genera un flujo de pruebas.")
    test_flow.add_argument("--project", required=True)
    test_flow.add_argument("--context", required=True)
    test_flow.add_argument("--model", default=None)
    test_flow.add_argument("--output", default=None)

    automation_flow = subparsers.add_parser("generate-automation-flow", help="Genera un workflow de automatizacion.")
    automation_flow.add_argument("--goal", required=True)
    automation_flow.add_argument("--systems", required=True)
    automation_flow.add_argument("--context", required=True)
    automation_flow.add_argument("--model", default=None)
    automation_flow.add_argument("--output", default=None)

    interaction_script = subparsers.add_parser("generate-interaction-script", help="Genera un script de interaccion.")
    interaction_script.add_argument("--audience", required=True)
    interaction_script.add_argument("--objective", required=True)
    interaction_script.add_argument("--tone", required=True)
    interaction_script.add_argument("--context", required=True)
    interaction_script.add_argument("--model", default=None)
    interaction_script.add_argument("--output", default=None)

    subparsers.add_parser("rowboat-status", help="Muestra la configuracion de Rowboat.")

    rowboat_chat = subparsers.add_parser("rowboat-chat", help="Envia un mensaje a Rowboat.")
    rowboat_chat.add_argument("--message", required=True)
    rowboat_chat.add_argument("--conversation-id", default=None)
    rowboat_chat.add_argument("--output", default=None)

    nvidia_sync = subparsers.add_parser("sync-nvidia-build-free-models", help="Sincroniza el catalogo gratuito de NVIDIA Build.")
    nvidia_sync.add_argument("--snapshot-output", default=None)
    nvidia_sync.add_argument("--catalog-output", default=None)
    nvidia_sync.add_argument("--headed", action="store_true", help="Abre Chrome visible en lugar de headless.")

    serve = subparsers.add_parser("serve", help="Inicia la API HTTP con dashboard de monitoreo.")
    serve.add_argument("--host", default="0.0.0.0")
    serve.add_argument("--port", type=int, default=8015)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    config = load_config(args.config)
    service = OrchestratorService(config)

    if args.command == "list-models":
        for model in service.list_models():
            default_marker = " (default)" if model.id == config.default_model else ""
            print(f"{model.id} -> {model.provider} :: {model.model}{default_marker}")
        return

    if args.command == "generate-test-flow":
        messages = build_test_flow_messages(args.project, args.context)
        content = service.generate(messages=messages, model_id=args.model)
        write_output(content, args.output)
        return

    if args.command == "generate-automation-flow":
        messages = build_automation_flow_messages(args.goal, args.systems, args.context)
        content = service.generate(messages=messages, model_id=args.model)
        write_output(content, args.output)
        return

    if args.command == "generate-interaction-script":
        messages = build_interaction_script_messages(args.audience, args.objective, args.tone, args.context)
        content = service.generate(messages=messages, model_id=args.model)
        write_output(content, args.output)
        return

    if args.command == "rowboat-status":
        settings = load_rowboat_settings()
        print(f"configured: {settings.configured}")
        print(f"host: {settings.host or ''}")
        print(f"project_id: {settings.project_id or ''}")
        if settings.missing:
            print(f"missing: {', '.join(settings.missing)}")
        return

    if args.command == "rowboat-chat":
        client = RowboatClient(load_rowboat_settings())
        response = client.chat(args.message, conversation_id=args.conversation_id)
        content = extract_output_text(response) or str(response)
        write_output(content, args.output)
        conversation_id = response.get("conversationId")
        if conversation_id:
            print(f"Conversation ID: {conversation_id}")
        return

    if args.command == "sync-nvidia-build-free-models":
        snapshot_path, catalog_path = write_nvidia_snapshot_and_catalog(
            snapshot_output=args.snapshot_output,
            catalog_output=args.catalog_output,
            headless=not args.headed,
        )
        print(f"Snapshot written: {snapshot_path}")
        print(f"Catalog written: {catalog_path}")
        return

    if args.command == "serve":
        import uvicorn

        uvicorn.run(create_app(args.config), host=args.host, port=args.port)
        return

    parser.error(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    main()

