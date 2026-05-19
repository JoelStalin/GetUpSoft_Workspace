"""Functional tests for new features: AI Providers, Jarvis, Clap Detection."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi.testclient import TestClient

from ai_automation_orchestrator.config import load_config
from ai_automation_orchestrator.jobs import WorkflowStore
from ai_automation_orchestrator.service import OrchestratorService
from ai_automation_orchestrator.user_credentials import CredentialStore
from ai_automation_orchestrator.webapp import create_app
from ai_automation_orchestrator.workflow_blueprints import WorkflowBlueprintStore


class FakeService(OrchestratorService):
    """Mock service for testing."""

    def __init__(self) -> None:
        super().__init__(load_config(Path(__file__).resolve().parents[1] / "config" / "models.example.json"))

    def generate(self, *, messages, model_id=None, **overrides):  # type: ignore[override]
        return f"generated for {model_id or self.config.default_model}"


class ProvidersEndpointsTests(unittest.TestCase):
    """Test AI Providers management endpoints."""

    @classmethod
    def setUpClass(cls) -> None:
        """Set up temporary directory for all tests."""
        cls.temp_dir = tempfile.TemporaryDirectory()

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up temporary directory."""
        cls.temp_dir.cleanup()

    def setUp(self) -> None:
        """Set up test client."""
        self.store = WorkflowStore(Path(self.temp_dir.name) / "jobs.db")
        self.blueprint_store = WorkflowBlueprintStore(Path(self.temp_dir.name) / "blueprints.json")
        self.credential_store = CredentialStore(Path(self.temp_dir.name) / "user_credentials.json")
        self.app = create_app(
            Path(__file__).resolve().parents[1] / "config" / "models.example.json",
            service=FakeService(),
            store=self.store,
            blueprint_store=self.blueprint_store,
            credential_store=self.credential_store,
        )
        self.client = TestClient(self.app)

    def test_list_providers(self) -> None:
        """Test listing available providers."""
        response = self.client.get("/api/providers")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("providers", data)
        providers = data["providers"]
        # Providers is a dict with provider IDs as keys
        self.assertIn("openai", providers)
        self.assertIn("claude", providers)
        self.assertIn("gemini", providers)
        self.assertIn("manus", providers)

    def test_get_provider_details(self) -> None:
        """Test getting provider details."""
        response = self.client.get("/api/providers/openai")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Response is {"openai": {...provider details...}}
        self.assertIn("openai", data)
        provider = data["openai"]
        self.assertEqual(provider["name"], "OpenAI")
        self.assertIn("description", provider)
        self.assertIn("models", provider)

    def test_validate_provider_invalid_key(self) -> None:
        """Test provider validation with invalid API key."""
        response = self.client.post(
            "/api/providers/openai/validate",
            json={"api_key": "invalid_key_12345"},
        )
        # Should indicate validation failed or return error
        self.assertIn(response.status_code, [200, 400, 401])

    def test_connect_provider(self) -> None:
        """Test connecting provider (storing credentials)."""
        response = self.client.post(
            "/api/providers/openai/connect",
            json={"api_key": "test_key_123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("configured"))
        self.assertEqual(data.get("provider"), "openai")

    def test_disconnect_provider(self) -> None:
        """Test disconnecting provider (removing credentials)."""
        # First connect
        self.client.post(
            "/api/providers/openai/connect",
            json={"api_key": "test_key_123"},
        )
        # Then disconnect
        response = self.client.delete("/api/providers/openai/disconnect")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("disconnected"))
        self.assertEqual(data.get("provider"), "openai")

    def test_providers_dashboard_section(self) -> None:
        """Test that providers dashboard HTML section is served."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for AI Providers section
        self.assertIn("AI Providers", html)


class JarvisEndpointsTests(unittest.TestCase):
    """Test Jarvis voice command integration endpoints."""

    @classmethod
    def setUpClass(cls) -> None:
        """Set up temporary directory for all tests."""
        cls.temp_dir = tempfile.TemporaryDirectory()

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up temporary directory."""
        cls.temp_dir.cleanup()

    def setUp(self) -> None:
        """Set up test client."""
        self.store = WorkflowStore(Path(self.temp_dir.name) / "jobs.db")
        self.blueprint_store = WorkflowBlueprintStore(Path(self.temp_dir.name) / "blueprints.json")
        self.credential_store = CredentialStore(Path(self.temp_dir.name) / "user_credentials.json")
        self.app = create_app(
            Path(__file__).resolve().parents[1] / "config" / "models.example.json",
            service=FakeService(),
            store=self.store,
            blueprint_store=self.blueprint_store,
            credential_store=self.credential_store,
        )
        self.client = TestClient(self.app)

    def test_jarvis_status(self) -> None:
        """Test Jarvis status endpoint."""
        response = self.client.get("/api/jarvis/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("available", data)
        self.assertIn("status", data)
        self.assertIn("supported_intents", data)
        self.assertIn("wake_words", data)

    def test_list_jarvis_commands(self) -> None:
        """Test listing available Jarvis intents."""
        response = self.client.get("/api/jarvis/commands")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("wake_words", data)
        self.assertIn("intents", data)
        # Should have 6 intents
        intents = data["intents"]
        self.assertGreaterEqual(len(intents), 6)
        # Check for specific intents
        intent_names = [i["intent"] for i in intents]
        self.assertIn("prompt-generation", intent_names)
        self.assertIn("scrum-management", intent_names)
        self.assertIn("bugfix", intent_names)
        self.assertIn("feature", intent_names)
        self.assertIn("research", intent_names)
        self.assertIn("documentation", intent_names)

    def test_process_voice_command(self) -> None:
        """Test processing a voice command."""
        response = self.client.post(
            "/api/jarvis/command",
            json={
                "input_value": "crea tarea para refactorizar auth",
                "source_type": "transcript",
            },
        )
        # May return error if Jarvis listener not initialized, but endpoint should exist
        self.assertIn(response.status_code, [200, 400])

    def test_jarvis_webhook(self) -> None:
        """Test Jarvis webhook endpoint."""
        response = self.client.post(
            "/api/jarvis/webhook",
            json={
                "input_value": "jarvis, crea tarea",
                "source_type": "transcript",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("received", data)


class ClapDetectionTests(unittest.TestCase):
    """Test Clap Detection interface."""

    @classmethod
    def setUpClass(cls) -> None:
        """Set up temporary directory for all tests."""
        cls.temp_dir = tempfile.TemporaryDirectory()

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up temporary directory."""
        cls.temp_dir.cleanup()

    def setUp(self) -> None:
        """Set up test client."""
        self.store = WorkflowStore(Path(self.temp_dir.name) / "jobs.db")
        self.blueprint_store = WorkflowBlueprintStore(Path(self.temp_dir.name) / "blueprints.json")
        self.credential_store = CredentialStore(Path(self.temp_dir.name) / "user_credentials.json")
        self.app = create_app(
            Path(__file__).resolve().parents[1] / "config" / "models.example.json",
            service=FakeService(),
            store=self.store,
            blueprint_store=self.blueprint_store,
            credential_store=self.credential_store,
        )
        self.client = TestClient(self.app)

    def test_clap_detection_interface(self) -> None:
        """Test that clap detection HTML interface is served."""
        response = self.client.get("/jarvis/clap")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for key elements
        self.assertIn("<!DOCTYPE html>", html)
        self.assertIn("Jarvis", html)
        self.assertIn("Clap", html)
        self.assertIn("particles", html.lower())

    def test_clap_detection_has_web_audio_api(self) -> None:
        """Test that clap detection uses Web Audio API."""
        response = self.client.get("/jarvis/clap")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for Web Audio API usage
        self.assertIn("getUserMedia", html)
        self.assertIn("AudioContext", html)
        self.assertIn("analyser", html)
        self.assertIn("getByteFrequencyData", html)

    def test_clap_detection_has_orca_logo(self) -> None:
        """Test that clap detection has orca SVG logo."""
        response = self.client.get("/jarvis/clap")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for SVG and orca-related elements
        self.assertIn("<svg", html)
        self.assertIn("orca", html.lower())
        self.assertIn("whale", html.lower())

    def test_clap_detection_has_particle_animation(self) -> None:
        """Test that clap detection has particle animation."""
        response = self.client.get("/jarvis/clap")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for particle system
        self.assertIn("Particle", html)
        self.assertIn("particles-canvas", html)
        self.assertIn("createParticles", html)
        self.assertIn("animateParticles", html)


class IntegrationTests(unittest.TestCase):
    """Integration tests for all new features."""

    @classmethod
    def setUpClass(cls) -> None:
        """Set up temporary directory for all tests."""
        cls.temp_dir = tempfile.TemporaryDirectory()

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up temporary directory."""
        cls.temp_dir.cleanup()

    def setUp(self) -> None:
        """Set up test client."""
        self.store = WorkflowStore(Path(self.temp_dir.name) / "jobs.db")
        self.blueprint_store = WorkflowBlueprintStore(Path(self.temp_dir.name) / "blueprints.json")
        self.credential_store = CredentialStore(Path(self.temp_dir.name) / "user_credentials.json")
        self.app = create_app(
            Path(__file__).resolve().parents[1] / "config" / "models.example.json",
            service=FakeService(),
            store=self.store,
            blueprint_store=self.blueprint_store,
            credential_store=self.credential_store,
        )
        self.client = TestClient(self.app)

    def test_dashboard_contains_all_sections(self) -> None:
        """Test that dashboard contains all new sections."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.text
        # Check for navigation items
        self.assertIn("AI Providers", html)

    def test_jarvis_endpoints_registered(self) -> None:
        """Test that all Jarvis endpoints are registered."""
        endpoints = [
            ("/api/jarvis/status", "get"),
            ("/api/jarvis/commands", "get"),
            ("/api/jarvis/command", "post"),
            ("/api/jarvis/webhook", "post"),
            ("/jarvis/clap", "get"),
        ]
        for endpoint, method in endpoints:
            if method == "get":
                response = self.client.get(endpoint)
            else:
                response = self.client.post(endpoint, json={})
            self.assertNotEqual(response.status_code, 404, f"Endpoint {endpoint} not found")

    def test_provider_endpoints_registered(self) -> None:
        """Test that all provider endpoints are registered."""
        # First connect to have credentials for disconnect test
        self.client.post(
            "/api/providers/openai/connect",
            json={"api_key": "test_key"},
        )

        endpoints = [
            ("/api/providers", "get"),
            ("/api/providers/openai", "get"),
            ("/api/providers/openai/validate", "post"),
            ("/api/providers/openai/connect", "post"),
            ("/api/providers/openai/disconnect", "delete"),
        ]
        for endpoint, method in endpoints:
            if method == "get":
                response = self.client.get(endpoint)
            elif method == "post":
                response = self.client.post(endpoint, json={})
            else:
                response = self.client.delete(endpoint)
            self.assertNotEqual(response.status_code, 404, f"Endpoint {endpoint} not found")


if __name__ == "__main__":
    unittest.main()
