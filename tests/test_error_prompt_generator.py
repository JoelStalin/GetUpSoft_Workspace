from __future__ import annotations

from orca.core.error_prompt_generator import ErrorPromptGenerator


def test_error_prompt_generator_builds_all_recovery_prompts() -> None:
    generator = ErrorPromptGenerator()

    prompts = generator.generate(
        normalized_prompt="arreglar bug del login",
        detected_intent="bugfix",
        affected_file="orca/core/prompt_interpreter.py",
        probable_cause="missing validation",
    )

    assert "diagnostic_prompt" in prompts
    assert "implementation_prompt" in prompts
    assert "test_prompt" in prompts
    assert "refactor_prompt" in prompts
    assert "documentation_prompt" in prompts
    assert "missing validation" in prompts["diagnostic_prompt"]
