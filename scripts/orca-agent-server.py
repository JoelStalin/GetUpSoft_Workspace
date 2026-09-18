#!/usr/bin/env python3
"""
GetUpSoft Orca Agent Server
Enables direct access from code.getupsoft.com to local Docker, Odoo, and Labs
Runs on localhost:8000 with API key authentication
"""

import os
import json
import docker
import requests
from flask import Flask, request, jsonify
from functools import wraps
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
API_KEY = os.getenv('ORCA_AGENT_API_KEY', 'default-insecure-key-change-me')

try:
    docker_client = docker.from_env()
    docker_available = True
    logger.info("✅ Docker client initialized")
except Exception as e:
    docker_client = None
    docker_available = False
    logger.warning(f"⚠️  Docker not available: {e}")

# ============================================
# AUTHENTICATION
# ============================================

def require_api_key(f):
    """Verify API key in requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        key = request.headers.get('X-API-Key')
        if key != API_KEY:
            logger.warning(f"❌ Unauthorized request - Invalid key")
            return jsonify({'error': 'Unauthorized - Invalid API Key'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ============================================
# DOCKER OPERATIONS
# ============================================

@app.route('/api/docker/containers', methods=['GET'])
@require_api_key
def list_containers():
    """List all Docker containers with status"""
    if not docker_available:
        return jsonify({'error': 'Docker not available'}), 503

    try:
        containers = docker_client.containers.list(all=True)
        result = []
        for c in containers:
            result.append({
                'id': c.id[:12],
                'name': c.name,
                'status': c.status,
                'image': c.image.tags[0] if c.image.tags else 'unknown',
                'ports': c.ports,
                'created': c.attrs['Created'],
                'started_at': c.attrs.get('State', {}).get('StartedAt')
            })

        logger.info(f"✅ Listed {len(result)} containers")
        return jsonify({
            'success': True,
            'count': len(result),
            'containers': result
        })
    except Exception as e:
        logger.error(f"❌ Error listing containers: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/containers/<container_id>/logs', methods=['GET'])
@require_api_key
def get_container_logs(container_id):
    """Get logs from a specific container"""
    if not docker_available:
        return jsonify({'error': 'Docker not available'}), 503

    try:
        limit = request.args.get('limit', 50, type=int)
        container = docker_client.containers.get(container_id)
        logs = container.logs(tail=limit).decode('utf-8')

        logger.info(f"✅ Retrieved logs for {container_id}")
        return jsonify({
            'success': True,
            'container_id': container_id,
            'container_name': container.name,
            'logs': logs
        })
    except Exception as e:
        logger.error(f"❌ Error getting logs: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/containers/<container_id>/stats', methods=['GET'])
@require_api_key
def get_container_stats(container_id):
    """Get container resource stats (CPU, memory)"""
    if not docker_available:
        return jsonify({'error': 'Docker not available'}), 503

    try:
        container = docker_client.containers.get(container_id)
        stats = container.stats(stream=False)

        logger.info(f"✅ Retrieved stats for {container_id}")
        return jsonify({
            'success': True,
            'container_id': container_id,
            'container_name': container.name,
            'status': container.status,
            'stats': stats
        })
    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/networks', methods=['GET'])
@require_api_key
def list_networks():
    """List Docker networks"""
    if not docker_available:
        return jsonify({'error': 'Docker not available'}), 503

    try:
        networks = docker_client.networks.list()
        result = [{
            'id': n.id[:12],
            'name': n.name,
            'driver': n.attrs['Driver'],
            'containers': len(n.containers)
        } for n in networks]

        logger.info(f"✅ Listed {len(result)} networks")
        return jsonify({
            'success': True,
            'count': len(result),
            'networks': result
        })
    except Exception as e:
        logger.error(f"❌ Error listing networks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/volumes', methods=['GET'])
@require_api_key
def list_volumes():
    """List Docker volumes"""
    if not docker_available:
        return jsonify({'error': 'Docker not available'}), 503

    try:
        volumes = docker_client.volumes.list()
        result = [{
            'name': v.name,
            'driver': v.attrs['Driver'],
            'mountpoint': v.attrs['Mountpoint']
        } for v in volumes]

        logger.info(f"✅ Listed {len(result)} volumes")
        return jsonify({
            'success': True,
            'count': len(result),
            'volumes': result
        })
    except Exception as e:
        logger.error(f"❌ Error listing volumes: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# ODOO RPC OPERATIONS
# ============================================

@app.route('/api/odoo/modules', methods=['GET'])
@require_api_key
def get_odoo_modules():
    """List installed modules in Odoo"""
    try:
        response = requests.post(
            'http://localhost:8069/json/2/ir.module.module/search_read',
            json={
                "params": {
                    "filter": [["state", "=", "installed"]],
                    "fields": ["name", "state", "version"]
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        modules = response.json()
        orca_modules = [m for m in modules if 'orca' in m['name'].lower()]

        logger.info(f"✅ Retrieved {len(modules)} modules from Odoo")
        return jsonify({
            'success': True,
            'total_count': len(modules),
            'orca_count': len(orca_modules),
            'modules': modules[:20],  # First 20
            'orca_modules': orca_modules
        })
    except requests.exceptions.ConnectionError:
        logger.error("❌ Cannot connect to Odoo at localhost:8069")
        return jsonify({'error': 'Cannot connect to Odoo'}), 503
    except Exception as e:
        logger.error(f"❌ Error getting modules: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odoo/orca-logs', methods=['GET'])
@require_api_key
def get_orca_logs():
    """Get recent ORCA audit logs from all modules"""
    try:
        # Try to get logs from account_extended module
        module_names = [
            'account_extended.orca.log',
            'sale_extended.orca.log',
            'stock_extended.orca.log'
        ]

        all_logs = []
        for module in module_names:
            try:
                response = requests.post(
                    f'http://localhost:8069/json/2/{module}/search_read',
                    json={
                        "params": {
                            "order": "id DESC",
                            "limit": 10
                        }
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                if response.status_code == 200:
                    logs = response.json()
                    all_logs.extend(logs)
            except:
                pass  # Module might not be installed

        logger.info(f"✅ Retrieved {len(all_logs)} ORCA logs")
        return jsonify({
            'success': True,
            'count': len(all_logs),
            'recent_logs': all_logs[:20]
        })
    except Exception as e:
        logger.error(f"❌ Error getting ORCA logs: {e}")
        return jsonify({'error': str(e), 'logs': []}), 200

@app.route('/api/odoo/health', methods=['GET'])
@require_api_key
def check_odoo_health():
    """Check if Odoo is online and healthy"""
    try:
        response = requests.head('http://localhost:8069', timeout=5)
        is_online = response.status_code in [200, 302, 404]

        status = "✅ ONLINE" if is_online else "❌ OFFLINE"
        logger.info(f"{status}")

        return jsonify({
            'success': True,
            'odoo_status': 'online' if is_online else 'offline',
            'http_code': response.status_code
        })
    except:
        logger.warning("⚠️  Odoo appears to be offline")
        return jsonify({
            'success': True,
            'odoo_status': 'offline',
            'http_code': 0
        })

# ============================================
# WORKFLOW OPERATIONS
# ============================================

@app.route('/api/workflows/trigger', methods=['POST'])
@require_api_key
def trigger_workflow():
    """Trigger an n8n workflow via webhook"""
    data = request.json
    webhook_url = data.get('webhook_url')
    payload = data.get('payload', {})

    if not webhook_url:
        return jsonify({'error': 'webhook_url required'}), 400

    try:
        response = requests.post(webhook_url, json=payload, timeout=10)
        logger.info(f"✅ Triggered workflow: {webhook_url}")
        return jsonify({
            'success': True,
            'status': 'triggered',
            'response_code': response.status_code
        })
    except Exception as e:
        logger.error(f"❌ Error triggering workflow: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# HEALTH & STATUS
# ============================================

@app.route('/api/health', methods=['GET'])
@require_api_key
def health_check():
    """Check health of all lab endpoints"""
    endpoints = {
        'odoo_v19': {'url': 'http://localhost:8069', 'status': 'checking'},
        'n8n': {'url': 'http://localhost:5678', 'status': 'checking'},
        'workflow_editor': {'url': 'http://localhost:3000', 'status': 'checking'},
    }

    for name, endpoint in endpoints.items():
        try:
            resp = requests.head(endpoint['url'], timeout=5)
            endpoint['status'] = f"OK ({resp.status_code})"
        except requests.exceptions.ConnectionError:
            endpoint['status'] = "UNREACHABLE"
        except:
            endpoint['status'] = "DOWN"

    logger.info("✅ Health check complete")
    return jsonify({
        'orca_agent': 'running',
        'docker': 'available' if docker_available else 'unavailable',
        'endpoints': endpoints,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/agent/info', methods=['GET'])
@require_api_key
def agent_info():
    """Get Orca Agent information"""
    return jsonify({
        'name': 'GetUpSoft Orca Agent',
        'version': '1.0.0',
        'machine': 'GetUpSoft-PC',
        'user': 'yoeli',
        'capabilities': [
            'docker_monitoring',
            'odoo_rpc',
            'workflow_triggers',
            'lms_queries',
            'orca_audit_logs'
        ],
        'docker_available': docker_available,
        'status': 'active',
        'started': datetime.now().isoformat()
    })

@app.route('/api/status', methods=['GET'])
@require_api_key
def status():
    """General status endpoint"""
    return jsonify({
        'status': 'running',
        'agent': 'GetUpSoft Orca Agent',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("🤖 GetUpSoft Orca Agent Server Starting...")
    logger.info("=" * 60)

    api_key = os.getenv('ORCA_AGENT_API_KEY', 'INSECURE-DEFAULT')
    if api_key == 'INSECURE-DEFAULT':
        logger.warning("⚠️  WARNING: Using default API key! Set ORCA_AGENT_API_KEY environment variable!")

    logger.info(f"✅ Listening on http://localhost:8000")
    logger.info(f"✅ Docker: {'Available' if docker_available else 'Not Available'}")
    logger.info(f"✅ API Key: {'Set' if api_key != 'INSECURE-DEFAULT' else 'DEFAULT (INSECURE)'}")
    logger.info("")
    logger.info("Available endpoints:")
    logger.info("  GET  /api/docker/containers")
    logger.info("  GET  /api/docker/containers/<id>/logs")
    logger.info("  GET  /api/docker/containers/<id>/stats")
    logger.info("  GET  /api/docker/networks")
    logger.info("  GET  /api/docker/volumes")
    logger.info("  GET  /api/odoo/modules")
    logger.info("  GET  /api/odoo/orca-logs")
    logger.info("  GET  /api/odoo/health")
    logger.info("  POST /api/workflows/trigger")
    logger.info("  GET  /api/health")
    logger.info("  GET  /api/agent/info")
    logger.info("")

    # Run server
    app.run(host='127.0.0.1', port=8000, debug=False, use_reloader=False)
