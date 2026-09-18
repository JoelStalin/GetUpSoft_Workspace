from __future__ import annotations

from io import BytesIO
import sys
import unittest
from pathlib import Path
from zipfile import ZipFile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.client_plugin import build_clap_plugin_zip


class ClientPluginTests(unittest.TestCase):
    def test_builds_downloadable_clap_plugin(self) -> None:
        archive = build_clap_plugin_zip("https://orca.example.com")

        with ZipFile(BytesIO(archive)) as zip_file:
            names = set(zip_file.namelist())
            html = zip_file.read("orca-clap-launcher.html").decode("utf-8")
            readme = zip_file.read("README.md").decode("utf-8")

        self.assertIn("orca-clap-launcher.html", names)
        self.assertIn("README.md", names)
        self.assertIn("https://orca.example.com", html)
        self.assertIn("getUserMedia", html)
        self.assertIn("https://orca.example.com", readme)


if __name__ == "__main__":
    unittest.main()
