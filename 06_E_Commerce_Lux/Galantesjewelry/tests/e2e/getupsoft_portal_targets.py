from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PortalTarget:
    key: str
    url: str
    expected_title: str
    expected_root_selector: str = "#root"
    expected_text: str | None = None
    fallback_url: str | None = None


DEFAULT_PORTAL_TARGETS: tuple[PortalTarget, ...] = (
    PortalTarget(
        key="corporate_rd",
        url="https://getupsoft.com.do",
        expected_title="Certia | Plataforma Corporativa",
        expected_text="Gestion fiscal, contable y operativa desde una sola plataforma.",
    ),
    PortalTarget(
        key="admin_rd",
        url="https://admin.getupsoft.com.do",
        expected_title="Certia | Portal de Administración",
        expected_text="Portal de Administración",
    ),
    PortalTarget(
        key="client_rd",
        url="https://easycount.getupsoft.com.do",
        expected_title="Certia | Portal de Clientes",
        expected_text="Portal de Clientes",
        fallback_url="https://cliente.getupsoft.com.do",
    ),
)
