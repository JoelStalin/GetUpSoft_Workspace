from __future__ import annotations

from pathlib import Path

from orca.config import OrcaSettings
from orca.core.prompt_interpreter import PromptInterpreter
from orca.memory.obsidian_vault import ObsidianVault


def test_obsidian_vault_writes_markdown_note(tmp_path: Path) -> None:
    payload = PromptInterpreter().interpret_text(
        "arregla el error del login y agrega pruebas de regresion"
    )
    settings = OrcaSettings(project_root=tmp_path)

    vault = ObsidianVault(settings)
    note_path = vault.write_interpretation("login-bugfix", payload)

    content = note_path.read_text(encoding="utf-8")
    assert note_path.exists()
    assert "# " in content
    assert "Acceptance Criteria" in content
    assert payload.normalized_prompt in content
