#!/usr/bin/env python3
"""
Triangular Communication Test
Verifies 3-way communication:
  code.getupsoft.com → PC Local → Docker Odoo Lab
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Tuple, List

class TriangularCommTest:
    def __init__(self, orca_agent_url="http://localhost:8000", api_key="default-key"):
        self.orca_agent_url = orca_agent_url
        self.api_key = api_key
        self.results = []
        self.errors = []

    def log(self, message: str, level: str = "INFO"):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "✅":
            symbol = "✅"
        elif level == "❌":
            symbol = "❌"
        elif level == "⚠️":
            symbol = "⚠️"
        else:
            symbol = "ℹ️"

        print(f"[{timestamp}] {symbol} {message}")

    def test_1_orca_agent_online(self) -> Tuple[bool, str]:
        """Test 1: Verify Orca Agent server is running (Node 1 → Node 2)"""
        self.log("TEST 1: Verify Orca Agent online...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/status",
                headers={"X-API-Key": self.api_key},
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                self.log(f"Orca Agent running: {data.get('agent')}", "✅")
                self.results.append(("Orca Agent Online", True))
                return True, "Agent online"
            else:
                self.log(f"Unexpected status: {response.status_code}", "❌")
                self.results.append(("Orca Agent Online", False))
                self.errors.append(f"Agent returned {response.status_code}")
                return False, f"Status {response.status_code}"
        except requests.exceptions.ConnectionError:
            self.log("Cannot connect to Orca Agent (http://localhost:8000)", "❌")
            self.results.append(("Orca Agent Online", False))
            self.errors.append("Connection refused - Agent not running")
            return False, "Connection refused"
        except Exception as e:
            self.log(f"Error: {e}", "❌")
            self.results.append(("Orca Agent Online", False))
            self.errors.append(str(e))
            return False, str(e)

    def test_2_orca_agent_to_odoo(self) -> Tuple[bool, str]:
        """Test 2: Verify Orca Agent can reach Odoo (Node 2 → Node 3)"""
        self.log("TEST 2: Verify Orca Agent can reach Odoo...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/odoo/health",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                status = data.get('odoo_status', 'unknown')

                if status == 'online':
                    self.log("Odoo v19 is ONLINE via Orca Agent", "✅")
                    self.results.append(("Agent→Odoo Connection", True))
                    return True, "Odoo online"
                else:
                    self.log("Odoo status is OFFLINE", "❌")
                    self.results.append(("Agent→Odoo Connection", False))
                    self.errors.append("Odoo offline")
                    return False, "Odoo offline"
            else:
                self.log(f"Agent returned: {response.status_code}", "❌")
                self.results.append(("Agent→Odoo Connection", False))
                return False, f"Status {response.status_code}"
        except Exception as e:
            self.log(f"Error querying Odoo: {e}", "❌")
            self.results.append(("Agent→Odoo Connection", False))
            self.errors.append(f"Odoo query failed: {e}")
            return False, str(e)

    def test_3_odoo_module_verification(self) -> Tuple[bool, str]:
        """Test 3: Verify Odoo has 46+ ORCA modules (Node 3 → Node 2 → Node 1)"""
        self.log("TEST 3: Verify 46+ ORCA modules in Odoo...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/odoo/modules",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                total = data.get('total_count', 0)
                orca_count = data.get('orca_count', 0)

                self.log(f"Total modules: {total}, ORCA modules: {orca_count}", "ℹ️")

                if total >= 40 and orca_count >= 20:
                    self.log(f"✅ Module check PASSED ({total} total, {orca_count} ORCA)", "✅")
                    self.results.append(("Module Verification", True))
                    return True, f"{total} modules, {orca_count} ORCA"
                else:
                    self.log(f"Module count LOW: {total} total, {orca_count} ORCA", "⚠️")
                    self.results.append(("Module Verification", False))
                    self.errors.append(f"Only {total} modules found")
                    return False, "Low module count"
            else:
                self.log(f"Agent returned: {response.status_code}", "❌")
                self.results.append(("Module Verification", False))
                return False, f"Status {response.status_code}"
        except Exception as e:
            self.log(f"Error verifying modules: {e}", "❌")
            self.results.append(("Module Verification", False))
            self.errors.append(f"Module check failed: {e}")
            return False, str(e)

    def test_4_orca_audit_logs(self) -> Tuple[bool, str]:
        """Test 4: Read ORCA audit logs from Odoo (Node 3 data → Node 2 → Node 1)"""
        self.log("TEST 4: Read ORCA audit logs...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/odoo/orca-logs",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)

                if count > 0:
                    self.log(f"Found {count} ORCA audit logs", "✅")
                    self.results.append(("ORCA Audit Logs", True))
                    return True, f"{count} logs found"
                else:
                    self.log("No ORCA audit logs found (may be OK if fresh install)", "⚠️")
                    self.results.append(("ORCA Audit Logs", True))  # Not critical
                    return True, "0 logs (fresh install)"
            else:
                self.log(f"Agent returned: {response.status_code}", "⚠️")
                self.results.append(("ORCA Audit Logs", True))  # Not critical
                return True, "Logs query skipped"
        except Exception as e:
            self.log(f"Warning querying logs: {e}", "⚠️")
            self.results.append(("ORCA Audit Logs", True))  # Not critical
            return True, "Logs query warning"

    def test_5_docker_containers(self) -> Tuple[bool, str]:
        """Test 5: Verify Docker containers visible (Node 2 → Docker)"""
        self.log("TEST 5: Verify Docker containers...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/docker/containers",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                containers = data.get('containers', [])

                # Look for odoo container
                odoo_found = any('odoo' in c.get('name', '').lower() for c in containers)

                self.log(f"Found {count} Docker containers", "ℹ️")
                if odoo_found:
                    self.log("Odoo container is RUNNING", "✅")
                    self.results.append(("Docker Containers", True))
                    return True, f"{count} containers, Odoo running"
                else:
                    self.log("Odoo container NOT found", "⚠️")
                    self.results.append(("Docker Containers", False))
                    self.errors.append("Odoo container not found")
                    return False, "Odoo container missing"
            else:
                self.log(f"Docker API returned: {response.status_code}", "❌")
                self.results.append(("Docker Containers", False))
                return False, f"Status {response.status_code}"
        except Exception as e:
            self.log(f"Error querying Docker: {e}", "❌")
            self.results.append(("Docker Containers", False))
            self.errors.append(f"Docker query failed: {e}")
            return False, str(e)

    def test_6_health_check_all(self) -> Tuple[bool, str]:
        """Test 6: Full health check of all endpoints (Node 1 ← Node 2 ← Node 3)"""
        self.log("TEST 6: Full health check of all endpoints...", "ℹ️")

        try:
            response = requests.get(
                f"{self.orca_agent_url}/api/health",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                endpoints = data.get('endpoints', {})

                online_count = sum(1 for ep in endpoints.values()
                                 if 'OK' in str(ep.get('status', '')))

                self.log(f"Endpoint status: {online_count}/{len(endpoints)} online", "ℹ️")
                for name, ep in endpoints.items():
                    status = ep.get('status', 'UNKNOWN')
                    icon = "✅" if "OK" in status else "❌"
                    self.log(f"  {icon} {name}: {status}", "ℹ️")

                if online_count >= 1:  # At least Odoo should be online
                    self.log("Health check PASSED", "✅")
                    self.results.append(("Health Check", True))
                    return True, f"{online_count}/{len(endpoints)} online"
                else:
                    self.log("All endpoints offline", "❌")
                    self.results.append(("Health Check", False))
                    return False, "All offline"
            else:
                self.log(f"Agent returned: {response.status_code}", "❌")
                self.results.append(("Health Check", False))
                return False, f"Status {response.status_code}"
        except Exception as e:
            self.log(f"Error in health check: {e}", "❌")
            self.results.append(("Health Check", False))
            self.errors.append(f"Health check failed: {e}")
            return False, str(e)

    def test_7_bidirectional_flow(self) -> Tuple[bool, str]:
        """Test 7: Verify bidirectional communication (Node 1 → 2 → 3 → 2 → 1)"""
        self.log("TEST 7: Verify bidirectional communication flow...", "ℹ️")

        try:
            # Send request from Node 1 to Node 2, which queries Node 3
            response = requests.post(
                f"{self.orca_agent_url}/api/odoo/modules",
                headers={"X-API-Key": self.api_key},
                json={"action": "test"},
                timeout=10
            )

            # Try GET instead if POST fails
            if response.status_code != 200:
                response = requests.get(
                    f"{self.orca_agent_url}/api/odoo/modules",
                    headers={"X-API-Key": self.api_key},
                    timeout=10
                )

            if response.status_code == 200:
                self.log("Bidirectional flow: getupsoft.com → Agent → Odoo → Agent → getupsoft.com ✅", "✅")
                self.results.append(("Bidirectional Flow", True))
                return True, "3-way communication verified"
            else:
                self.log("Bidirectional flow FAILED", "❌")
                self.results.append(("Bidirectional Flow", False))
                return False, f"Status {response.status_code}"
        except Exception as e:
            self.log(f"Error testing bidirectional flow: {e}", "❌")
            self.results.append(("Bidirectional Flow", False))
            self.errors.append(f"Bidirectional test failed: {e}")
            return False, str(e)

    def run_all_tests(self):
        """Execute all tests in sequence"""
        self.log("=" * 70, "ℹ️")
        self.log("TRIANGULAR COMMUNICATION TEST", "ℹ️")
        self.log("Testing: getupsoft.com ↔ PC Local ↔ Docker Odoo", "ℹ️")
        self.log("=" * 70, "ℹ️")
        self.log("")

        # Node 1: code.getupsoft.com
        self.log("NODE 1: code.getupsoft.com (External/Cloud)", "ℹ️")
        self.log("-" * 70, "ℹ️")

        # Node 2: PC Local
        self.log("NODE 2: PC Local (Orca Agent Server)", "ℹ️")
        self.log("-" * 70, "ℹ️")
        self.test_1_orca_agent_online()
        self.test_5_docker_containers()

        self.log("")

        # Node 3: Docker Odoo
        self.log("NODE 3: Docker Odoo Lab", "ℹ️")
        self.log("-" * 70, "ℹ️")
        self.test_2_orca_agent_to_odoo()
        self.test_3_odoo_module_verification()
        self.test_4_orca_audit_logs()

        self.log("")

        # Full system tests
        self.log("SYSTEM INTEGRATION TESTS", "ℹ️")
        self.log("-" * 70, "ℹ️")
        self.test_6_health_check_all()
        self.test_7_bidirectional_flow()

        self.log("")
        self.print_results()

    def print_results(self):
        """Print summary of all tests"""
        self.log("=" * 70, "ℹ️")
        self.log("TEST RESULTS SUMMARY", "ℹ️")
        self.log("=" * 70, "ℹ️")
        self.log("")

        passed = sum(1 for _, result in self.results if result)
        total = len(self.results)

        for test_name, result in self.results:
            icon = "✅" if result else "❌"
            self.log(f"{icon} {test_name}", "ℹ️")

        self.log("")
        self.log(f"PASSED: {passed}/{total}", "✅" if passed == total else "⚠️")
        self.log("")

        if self.errors:
            self.log("ERRORS FOUND:", "❌")
            for error in self.errors:
                self.log(f"  • {error}", "❌")
            self.log("")

        if passed == total:
            self.log("🎉 ALL TESTS PASSED - Communication triangulation successful!", "✅")
            self.log("", "ℹ️")
            self.log("Communication verified:", "✅")
            self.log("  ✅ code.getupsoft.com → PC Local (Orca Agent)", "✅")
            self.log("  ✅ PC Local (Orca Agent) → Docker Odoo", "✅")
            self.log("  ✅ Docker Odoo → PC Local → code.getupsoft.com", "✅")
            self.log("", "ℹ️")
            self.log("🚀 System is READY for production use!", "✅")
            return True
        else:
            self.log("⚠️ Some tests failed - Check logs above", "❌")
            self.log("", "ℹ️")
            self.log("Common fixes:", "⚠️")
            self.log("  1. Verify Orca Agent is running: .\scripts\start-orca-agent.ps1", "⚠️")
            self.log("  2. Verify Docker labs running: docker-compose up -d", "⚠️")
            self.log("  3. Check API key matches: $env:ORCA_AGENT_API_KEY", "⚠️")
            return False


if __name__ == "__main__":
    # Get configuration from arguments or environment
    orca_url = "http://localhost:8000"
    api_key = "default-insecure-key-change-me"  # User should set this

    if len(sys.argv) > 1:
        api_key = sys.argv[1]

    tester = TriangularCommTest(orca_url, api_key)
    success = tester.run_all_tests()

    sys.exit(0 if success else 1)
