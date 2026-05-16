from __future__ import annotations

from orca.core.skill_router import SkillRouter


def test_skill_router_returns_bugfix_skill() -> None:
    router = SkillRouter()

    skill = router.select("bugfix")

    assert skill.name == "bugfix_skill"
    assert "bugfix" in skill.intents


def test_skill_router_falls_back_to_scrum_skill() -> None:
    router = SkillRouter()

    skill = router.select("unknown-intent")

    assert skill.name == "scrum_skill"
