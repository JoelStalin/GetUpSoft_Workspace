from __future__ import annotations

from typer.testing import CliRunner

import orca.cli

runner = CliRunner()


def test_doctor_command_reports_runtime_payload() -> None:
    result = runner.invoke(orca.cli.app, ["doctor"])

    assert result.exit_code == 0
    assert "canonical_language" in result.stdout
    assert "service_port" in result.stdout


def test_backlog_status_command_reports_story_counts() -> None:
    result = runner.invoke(orca.cli.app, ["backlog", "status"])

    assert result.exit_code == 0
    assert "stories_done" in result.stdout
    assert "stories_in_progress" in result.stdout


def test_skills_list_command_reports_skill_inventory() -> None:
    result = runner.invoke(orca.cli.app, ["skills", "list"])

    assert result.exit_code == 0
    assert "implementation_skill" in result.stdout
    assert "scrum_skill" in result.stdout


def test_service_health_command_reports_health_payload() -> None:
    result = runner.invoke(orca.cli.app, ["service", "health"])

    assert result.exit_code == 0
    assert '"status": "ok"' in result.stdout


def test_prompt_text_command_keeps_prompt_pipeline_available() -> None:
    result = runner.invoke(orca.cli.app, ["prompt", "text", "arregla el bug del login"])

    assert result.exit_code == 0
    assert '"detected_intent": "bugfix"' in result.stdout
