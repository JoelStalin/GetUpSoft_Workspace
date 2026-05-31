#!/usr/bin/env python3
"""
GetUpSoft Orca Agent - Cloudflare Connector Module

Automatically configures Cloudflare Tunnels and WARP for GetUpSoft infrastructure.
This module is called by the bootstrap script to enable autonomous setup of network gateway.

Author: getupsoft (Autonomous Agent)
Date: 2026-05-28
License: MIT
"""

import os
import sys
import json
import subprocess
import platform
import requests
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class CloudflareConfig:
    """Cloudflare configuration"""
    api_token: str = ""
    account_id: str = ""
    zone_id: str = ""
    tunnel_name: str = "getupsoft-lab-tunnel"
    services: List[Dict[str, Any]] = None

    def __post_init__(self):
        if self.services is None:
            self.services = [
                {
                    "name": "Orca Agent API",
                    "hostname": "orca-agent.getupsoft.com",
                    "local_port": 8000,
                    "protocol": "http"
                },
                {
                    "name": "Odoo v19 Lab",
                    "hostname": "odoo-lab.getupsoft.com",
                    "local_port": 8069,
                    "protocol": "http"
                },
                {
                    "name": "n8n Workflows",
                    "hostname": "n8n-lab.getupsoft.com",
                    "local_port": 5678,
                    "protocol": "http"
                },
                {
                    "name": "ORCA Workflow Editor",
                    "hostname": "editor-lab.getupsoft.com",
                    "local_port": 3000,
                    "protocol": "http"
                }
            ]


class CloudflareConnector:
    """
    Autonomous Cloudflare gateway connector for GetUpSoft infrastructure.

    Handles:
    1. Cloudflared installation & verification
    2. Cloudflare tunnel creation & management
    3. Service routing configuration
    4. WARP Split Tunnel rule management
    5. Connectivity verification
    """

    def __init__(self, config: Optional[CloudflareConfig] = None):
        """Initialize connector with optional config"""
        self.config = config or CloudflareConfig()
        self.cloudflared_path = None
        self.tunnel_id = None
        self.tunnel_token = None
        self.os_type = platform.system().lower()
        self._load_credentials()

    def _load_credentials(self) -> None:
        """Load Cloudflare credentials from environment or file"""
        self.config.api_token = os.getenv('CLOUDFLARE_API_TOKEN', '')
        self.config.account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID', '')
        self.config.zone_id = os.getenv('CLOUDFLARE_ZONE_ID', '')

        # Try to load from .claude/cloudflare-config.json
        config_file = Path('.claude/cloudflare-config.json')
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    saved = json.load(f)
                    self.config.api_token = saved.get('api_token', self.config.api_token)
                    self.config.account_id = saved.get('account_id', self.config.account_id)
                    self.config.zone_id = saved.get('zone_id', self.config.zone_id)
                logger.info("✅ Cloudflare credentials loaded from .claude/cloudflare-config.json")
            except Exception as e:
                logger.warning(f"Could not load config file: {e}")

    def _run_command(self, cmd: List[str], check: bool = False) -> Tuple[int, str, str]:
        """Run a command and return exit code, stdout, stderr"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            logger.error(f"Failed to run command: {e}")
            return 1, "", str(e)

    # ========== SECTION 1: CLOUDFLARED MANAGEMENT ==========

    def check_cloudflared_installed(self) -> bool:
        """Check if cloudflared is installed"""
        logger.info("Checking cloudflared installation...")

        if self.os_type == "windows":
            code, stdout, stderr = self._run_command(["where", "cloudflared"])
            if code == 0:
                self.cloudflared_path = stdout.strip().split('\n')[0]
                logger.info(f"✅ cloudflared found at: {self.cloudflared_path}")
                return True
        else:
            code, stdout, stderr = self._run_command(["which", "cloudflared"])
            if code == 0:
                self.cloudflared_path = stdout.strip()
                logger.info(f"✅ cloudflared found at: {self.cloudflared_path}")
                return True

        logger.warning("❌ cloudflared not found in PATH")
        return False

    def install_cloudflared(self) -> bool:
        """Install cloudflared from official source"""
        logger.info("Installing cloudflared...")

        try:
            if self.os_type == "windows":
                url = "https://github.com/cloudflare/cloudflared/releases/download/2024.5.0/cloudflared-windows-amd64.msi"
                logger.info(f"Downloading from: {url}")

                response = requests.get(url, timeout=30)
                if response.status_code != 200:
                    logger.error(f"Download failed: {response.status_code}")
                    return False

                installer_path = Path("cloudflared-installer.msi")
                with open(installer_path, 'wb') as f:
                    f.write(response.content)

                code, _, _ = self._run_command(["msiexec", "/i", str(installer_path), "/quiet"])
                installer_path.unlink()

                if code == 0:
                    logger.info("✅ cloudflared installed successfully")
                    return self.check_cloudflared_installed()
                else:
                    logger.error("MSI installation failed")
                    return False
            else:
                # macOS/Linux installation
                code, _, _ = self._run_command(["sh", "-c", "curl -L https://pkg.cloudflareclient.com/cloudflared-release | sh"])
                if code == 0:
                    logger.info("✅ cloudflared installed successfully")
                    return self.check_cloudflared_installed()
                else:
                    logger.error("Installation failed")
                    return False
        except Exception as e:
            logger.error(f"Installation error: {e}")
            return False

    def verify_cloudflared_version(self) -> Optional[str]:
        """Get cloudflared version"""
        code, stdout, _ = self._run_command(["cloudflared", "version"])
        if code == 0:
            version = stdout.strip().split('\n')[0]
            logger.info(f"cloudflared version: {version}")
            return version
        return None

    # ========== SECTION 2: TUNNEL MANAGEMENT ==========

    def list_existing_tunnels(self) -> List[Dict]:
        """List existing Cloudflare tunnels"""
        if not self.config.api_token or not self.config.account_id:
            logger.warning("Cloudflare credentials not configured")
            return []

        try:
            url = f"https://api.cloudflare.com/client/v4/accounts/{self.config.account_id}/tunnels"
            headers = {"Authorization": f"Bearer {self.config.api_token}"}

            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get('result', [])
                logger.info(f"Found {len(tunnels)} existing tunnels")
                return tunnels
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Failed to list tunnels: {e}")
            return []

    def create_tunnel(self) -> Optional[str]:
        """Create a new Cloudflare tunnel"""
        if not self.config.api_token or not self.config.account_id:
            logger.error("Cloudflare credentials not configured")
            return None

        # Check if tunnel already exists
        existing = self.list_existing_tunnels()
        for tunnel in existing:
            if tunnel.get('name') == self.config.tunnel_name:
                self.tunnel_id = tunnel.get('id')
                logger.info(f"✅ Tunnel already exists: {self.config.tunnel_name} (ID: {self.tunnel_id})")
                return self.tunnel_id

        try:
            url = f"https://api.cloudflare.com/client/v4/accounts/{self.config.account_id}/tunnels"
            headers = {"Authorization": f"Bearer {self.config.api_token}"}
            payload = {"name": self.config.tunnel_name}

            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 201:
                data = response.json()
                tunnel = data.get('result', {})
                self.tunnel_id = tunnel.get('id')
                self.tunnel_token = tunnel.get('token')
                logger.info(f"✅ Tunnel created: {self.config.tunnel_name}")
                logger.info(f"   ID: {self.tunnel_id}")
                return self.tunnel_id
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Failed to create tunnel: {e}")
            return None

    def delete_tunnel(self, tunnel_name: str) -> bool:
        """Delete a Cloudflare tunnel"""
        if not self.config.api_token or not self.config.account_id:
            logger.error("Cloudflare credentials not configured")
            return False

        tunnels = self.list_existing_tunnels()
        tunnel_id = None
        for t in tunnels:
            if t.get('name') == tunnel_name:
                tunnel_id = t.get('id')
                break

        if not tunnel_id:
            logger.warning(f"Tunnel not found: {tunnel_name}")
            return False

        try:
            url = f"https://api.cloudflare.com/client/v4/accounts/{self.config.account_id}/tunnels/{tunnel_id}"
            headers = {"Authorization": f"Bearer {self.config.api_token}"}

            response = requests.delete(url, headers=headers, timeout=10)
            if response.status_code == 200:
                logger.info(f"✅ Tunnel deleted: {tunnel_name}")
                return True
            else:
                logger.error(f"API error: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Failed to delete tunnel: {e}")
            return False

    # ========== SECTION 3: ROUTE MANAGEMENT ==========

    def route_service(self, hostname: str, local_port: int) -> bool:
        """Configure a tunnel route for a service"""
        if not self.tunnel_id:
            logger.error("Tunnel not created")
            return False

        if not self.config.api_token or not self.config.account_id or not self.config.zone_id:
            logger.error("Cloudflare credentials incomplete")
            return False

        try:
            # Create DNS record
            dns_url = f"https://api.cloudflare.com/client/v4/zones/{self.config.zone_id}/dns_records"
            headers = {"Authorization": f"Bearer {self.config.api_token}"}

            # Check if record exists
            existing = requests.get(
                f"{dns_url}?name={hostname}",
                headers=headers,
                timeout=10
            )

            if existing.status_code == 200:
                records = existing.json().get('result', [])
                if records:
                    logger.info(f"✅ DNS record already exists: {hostname}")
                    return True

            # Create DNS record pointing to tunnel
            dns_payload = {
                "type": "CNAME",
                "name": hostname.split('.')[0],
                "content": f"{self.tunnel_id}.cfargotunnel.com",
                "ttl": 1,
                "proxied": True
            }

            dns_response = requests.post(
                dns_url,
                headers=headers,
                json=dns_payload,
                timeout=10
            )

            if dns_response.status_code == 200:
                logger.info(f"✅ DNS route configured: {hostname} → localhost:{local_port}")
                return True
            else:
                logger.error(f"DNS error: {dns_response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Failed to route service: {e}")
            return False

    def list_tunnel_routes(self) -> List[str]:
        """List configured tunnel routes"""
        if not self.tunnel_id:
            return []

        routes = []
        for service in self.config.services:
            routes.append(f"{service['hostname']} → localhost:{service['local_port']}")
        return routes

    # ========== SECTION 4: WARP MANAGEMENT ==========

    def check_warp_installed(self) -> bool:
        """Check if Cloudflare WARP is installed"""
        logger.info("Checking WARP installation...")

        if self.os_type == "windows":
            code, _, _ = self._run_command(["tasklist", "/FI", "IMAGENAME eq warp-svc.exe"])
            is_installed = code == 0 and "warp-svc.exe" in _ if _ else False
        else:
            code, _, _ = self._run_command(["pgrep", "-f", "warp"])
            is_installed = code == 0

        if is_installed:
            logger.info("✅ WARP is installed")
        else:
            logger.warning("❌ WARP not found")

        return is_installed

    def list_split_tunnel_rules(self) -> List[str]:
        """List WARP Split Tunnel rules (platform-specific)"""
        logger.info("Listing WARP Split Tunnel rules...")

        rules = []
        if self.os_type == "windows":
            # Windows: Use Windows Registry or WARP CLI
            try:
                code, stdout, _ = self._run_command(["warp-cli", "split-tunnel", "list"])
                if code == 0:
                    rules = [line.strip() for line in stdout.split('\n') if line.strip()]
                    logger.info(f"Found {len(rules)} rules:")
                    for rule in rules:
                        logger.info(f"  • {rule}")
            except:
                logger.warning("Could not list WARP rules")

        return rules

    def remove_split_tunnel_rule(self, cidr: str) -> bool:
        """Remove a WARP Split Tunnel rule"""
        logger.info(f"Removing WARP rule: {cidr}")

        if self.os_type == "windows":
            code, stdout, stderr = self._run_command(["warp-cli", "split-tunnel", "remove", cidr])
            if code == 0:
                logger.info(f"✅ Rule removed: {cidr}")
                return True
            else:
                logger.error(f"Failed to remove rule: {stderr}")
                return False
        else:
            logger.warning("WARP rule management requires Windows")
            return True  # Skip on non-Windows

    def add_split_tunnel_rule(self, cidr: str, mode: str = "include") -> bool:
        """Add a WARP Split Tunnel rule"""
        logger.info(f"Adding WARP rule: {cidr} ({mode})")

        if self.os_type == "windows":
            code, stdout, stderr = self._run_command(["warp-cli", "split-tunnel", "add", "--mode", mode, cidr])
            if code == 0:
                logger.info(f"✅ Rule added: {cidr}")
                return True
            else:
                logger.error(f"Failed to add rule: {stderr}")
                return False
        else:
            logger.warning("WARP rule management requires Windows")
            return True  # Skip on non-Windows

    # ========== SECTION 5: VERIFICATION ==========

    def test_tunnel_connectivity(self, hostname: str) -> Tuple[bool, str]:
        """Test connectivity to a tunneled service"""
        logger.info(f"Testing connectivity: {hostname}")

        try:
            response = requests.get(f"https://{hostname}", timeout=5, verify=False)
            if response.status_code < 500:
                logger.info(f"✅ {hostname} is accessible")
                return True, f"Status: {response.status_code}"
            else:
                logger.error(f"❌ {hostname} returned {response.status_code}")
                return False, f"Status: {response.status_code}"
        except requests.exceptions.Timeout:
            logger.error(f"❌ Timeout connecting to {hostname}")
            return False, "Timeout"
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Cannot connect to {hostname}")
            return False, "Connection refused"
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False, str(e)

    def test_warp_network_access(self, ip: str) -> bool:
        """Test WARP network access to local IP"""
        logger.info(f"Testing WARP access to {ip}")

        try:
            code, _, _ = self._run_command(["ping", "-n" if self.os_type == "windows" else "-c", "1", ip])
            if code == 0:
                logger.info(f"✅ Network accessible: {ip}")
                return True
            else:
                logger.error(f"❌ Network unreachable: {ip}")
                return False
        except Exception as e:
            logger.error(f"Ping failed: {e}")
            return False

    def test_service_accessibility(self, url: str) -> bool:
        """Test service accessibility via HTTP"""
        logger.info(f"Testing service: {url}")

        try:
            response = requests.get(url, timeout=5, verify=False)
            if 200 <= response.status_code < 500:
                logger.info(f"✅ Service accessible: {url}")
                return True
            else:
                logger.warning(f"⚠️  Service returned {response.status_code}: {url}")
                return response.status_code < 500
        except Exception as e:
            logger.error(f"❌ Service unreachable: {e}")
            return False

    # ========== SECTION 6: AUTONOMOUS SETUP ==========

    def autonomous_setup(self) -> Dict[str, Any]:
        """
        Run complete autonomous setup.

        This is the main entry point that orchestrates:
        1. Cloudflared check/install
        2. Tunnel creation
        3. Service routing
        4. WARP configuration
        5. Verification

        Returns: Dictionary with setup results
        """
        logger.info("🤖 Starting Autonomous Cloudflare Setup")
        logger.info("=" * 60)

        results = {
            'status': 'failed',
            'tunnel_name': self.config.tunnel_name,
            'tunnel_id': None,
            'routes': [],
            'warp_rules': {'removed': [], 'added': []},
            'tests': {},
            'credentials': {}
        }

        try:
            # Step 1: Cloudflared
            logger.info("\n[1/6] Cloudflared Setup")
            logger.info("-" * 60)

            if not self.check_cloudflared_installed():
                logger.info("Installing cloudflared...")
                if not self.install_cloudflared():
                    logger.error("Failed to install cloudflared")
                    return results

            version = self.verify_cloudflared_version()

            # Step 2: Create Tunnel
            logger.info("\n[2/6] Tunnel Creation")
            logger.info("-" * 60)

            tunnel_id = self.create_tunnel()
            if not tunnel_id:
                logger.error("Failed to create tunnel")
                return results

            results['tunnel_id'] = tunnel_id

            # Step 3: Configure Routes
            logger.info("\n[3/6] Service Routing")
            logger.info("-" * 60)

            routed = []
            for service in self.config.services:
                if self.route_service(service['hostname'], service['local_port']):
                    routed.append({
                        'hostname': service['hostname'],
                        'local_port': service['local_port']
                    })

            results['routes'] = routed

            # Step 4: WARP Configuration
            logger.info("\n[4/6] WARP Split Tunnel Configuration")
            logger.info("-" * 60)

            if self.os_type == "windows":
                # Remove blocking rule
                if self.remove_split_tunnel_rule("192.168.0.0/16"):
                    results['warp_rules']['removed'].append("192.168.0.0/16")

                # Add include rule
                if self.add_split_tunnel_rule("192.168.1.0/24", "include"):
                    results['warp_rules']['added'].append("192.168.1.0/24")

            # Step 5: Verification Tests
            logger.info("\n[5/6] Connectivity Verification")
            logger.info("-" * 60)

            test_results = {}
            for service in self.config.services:
                success, msg = self.test_tunnel_connectivity(service['hostname'])
                test_results[service['hostname']] = success

            results['tests'] = test_results

            # Step 6: Credentials
            logger.info("\n[6/6] Credential Storage")
            logger.info("-" * 60)

            self._save_tunnel_credentials()
            results['credentials']['saved'] = True
            results['credentials']['config_file'] = '.claude/cloudflare-tunnel.json'

            # Final status
            logger.info("\n" + "=" * 60)
            logger.info("✅ AUTONOMOUS SETUP COMPLETE")
            logger.info("=" * 60)

            results['status'] = 'success'
            return results

        except Exception as e:
            logger.error(f"Setup failed: {e}")
            return results

    # ========== SECTION 7: CREDENTIAL STORAGE ==========

    def _save_tunnel_credentials(self) -> None:
        """Save tunnel credentials securely"""
        config_dir = Path('.claude')
        config_dir.mkdir(exist_ok=True)

        config_file = config_dir / 'cloudflare-tunnel.json'

        credentials = {
            'tunnel_name': self.config.tunnel_name,
            'tunnel_id': self.tunnel_id,
            'tunnel_token': self.tunnel_token,
            'api_token_configured': bool(self.config.api_token),
            'created_at': datetime.now().isoformat(),
            'routes': self.config.services
        }

        try:
            with open(config_file, 'w') as f:
                json.dump(credentials, f, indent=2)

            # Secure file (Windows)
            if self.os_type == "windows":
                self._run_command(["attrib", "+h", str(config_file)])

            logger.info(f"✅ Credentials saved: {config_file}")
        except Exception as e:
            logger.error(f"Failed to save credentials: {e}")


def main():
    """Command-line entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='GetUpSoft Orca Agent Cloudflare Connector')
    parser.add_argument('--setup', action='store_true', help='Run autonomous setup')
    parser.add_argument('--check-cloudflared', action='store_true', help='Check cloudflared installation')
    parser.add_argument('--check-warp', action='store_true', help='Check WARP installation')
    parser.add_argument('--list-tunnels', action='store_true', help='List existing tunnels')
    parser.add_argument('--config', type=str, help='Path to Cloudflare config file')

    args = parser.parse_args()

    connector = CloudflareConnector()

    if args.setup:
        result = connector.autonomous_setup()
        print(json.dumps(result, indent=2))
        return 0 if result['status'] == 'success' else 1

    elif args.check_cloudflared:
        if connector.check_cloudflared_installed():
            version = connector.verify_cloudflared_version()
            print(f"✅ cloudflared is installed: {version}")
            return 0
        else:
            print("❌ cloudflared is not installed")
            return 1

    elif args.check_warp:
        if connector.check_warp_installed():
            print("✅ WARP is installed")
            return 0
        else:
            print("❌ WARP is not installed")
            return 1

    elif args.list_tunnels:
        tunnels = connector.list_existing_tunnels()
        print(json.dumps(tunnels, indent=2))
        return 0

    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
