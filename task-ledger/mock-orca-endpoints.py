#!/usr/bin/env python3
"""
Mock ORCA NestJS Endpoints Module
Provides HTTP server endpoints for /api/orca/audit-log and /api/orca/fiscal-sync
Fallback for when real NestJS backend is unavailable.

Usage:
    python mock-orca-endpoints.py --port 8000 --db mock_orca.json

Endpoints:
    POST /api/orca/audit-log       - Record audit log
    POST /api/orca/fiscal-sync     - Record fiscal sync event
    GET  /api/orca/health          - Health check
    GET  /api/orca/logs            - Retrieve stored logs
"""

import json
import argparse
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import uuid

class MockOrcaDB:
    """In-memory database for mock ORCA logs."""

    def __init__(self, db_file: str = None):
        self.db_file = db_file
        self.audit_logs: List[Dict] = []
        self.fiscal_syncs: List[Dict] = []
        self.request_counter = 0
        self.load()

    def load(self):
        """Load existing logs from file if available."""
        if self.db_file and Path(self.db_file).exists():
            try:
                with open(self.db_file, 'r') as f:
                    data = json.load(f)
                    self.audit_logs = data.get('audit_logs', [])
                    self.fiscal_syncs = data.get('fiscal_syncs', [])
                print(f"✓ Loaded {len(self.audit_logs)} audit logs and {len(self.fiscal_syncs)} fiscal syncs")
            except Exception as e:
                print(f"⚠ Failed to load DB: {e}")

    def save(self):
        """Persist logs to file."""
        if not self.db_file:
            return
        try:
            with open(self.db_file, 'w') as f:
                json.dump({
                    'audit_logs': self.audit_logs,
                    'fiscal_syncs': self.fiscal_syncs,
                    'saved_at': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            print(f"⚠ Failed to save DB: {e}")

    def record_audit_log(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record an audit log entry."""
        self.request_counter += 1
        request_id = f"ORCA-{datetime.now().strftime('%Y%m%d')}-{self.request_counter:06d}"

        log_entry = {
            'id': len(self.audit_logs) + 1,
            'request_id': request_id,
            'module_name': data.get('module_name', 'unknown'),
            'model_name': data.get('model_name', 'unknown'),
            'record_id': data.get('record_id', 0),
            'action': data.get('action', 'unknown'),
            'user_id': data.get('user_id', None),
            'date': data.get('date', datetime.now().isoformat()),
            'before_values': data.get('before_values', '{}'),
            'after_values': data.get('after_values', '{}'),
            'received_at': datetime.now().isoformat(),
            'status': 'processed'
        }

        self.audit_logs.append(log_entry)
        self.save()

        return {
            'success': True,
            'request_id': request_id,
            'status': 201,
            'message': f'Audit log recorded for {data.get("model_name")} #{data.get("record_id")}'
        }

    def record_fiscal_sync(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a fiscal sync event."""
        self.request_counter += 1
        request_id = f"FISCAL-{datetime.now().strftime('%Y%m%d')}-{self.request_counter:06d}"

        sync_entry = {
            'id': len(self.fiscal_syncs) + 1,
            'request_id': request_id,
            'module_name': data.get('module_name', 'l10n_do_accounting'),
            'model_name': data.get('model_name', 'account.move'),
            'record_id': data.get('record_id', 0),
            'sync_type': data.get('sync_type', 'unknown'),
            'sync_data': data.get('sync_data', {}),
            'user_id': data.get('user_id', None),
            'date': data.get('date', datetime.now().isoformat()),
            'received_at': datetime.now().isoformat(),
            'status': 'processed'
        }

        self.fiscal_syncs.append(sync_entry)
        self.save()

        return {
            'success': True,
            'request_id': request_id,
            'status': 201,
            'message': f'Fiscal sync recorded for {data.get("sync_type")} on {data.get("model_name")} #{data.get("record_id")}'
        }

    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        return {
            'total_audit_logs': len(self.audit_logs),
            'total_fiscal_syncs': len(self.fiscal_syncs),
            'total_requests': self.request_counter,
            'last_audit_log': self.audit_logs[-1] if self.audit_logs else None,
            'last_fiscal_sync': self.fiscal_syncs[-1] if self.fiscal_syncs else None,
        }


class MockOrcaRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for mock ORCA endpoints."""

    db: MockOrcaDB = None  # Set by server

    def do_POST(self):
        """Handle POST requests."""
        path = urlparse(self.path).path

        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_error(400, 'Invalid JSON')
            return

        # Route to appropriate handler
        if path == '/api/orca/audit-log':
            self.handle_audit_log(data)
        elif path == '/api/orca/fiscal-sync':
            self.handle_fiscal_sync(data)
        else:
            self.send_error(404, 'Not found')

    def do_GET(self):
        """Handle GET requests."""
        path = urlparse(self.path).path

        if path == '/api/orca/health':
            self.send_json_response({
                'status': 'ok',
                'service': 'mock-orca-endpoints',
                'timestamp': datetime.now().isoformat()
            }, 200)
        elif path == '/api/orca/logs':
            stats = self.db.get_stats()
            self.send_json_response(stats, 200)
        elif path == '/api/orca/logs/audit':
            query = parse_qs(urlparse(self.path).query)
            limit = int(query.get('limit', [100])[0])
            logs = self.db.audit_logs[-limit:]
            self.send_json_response({'audit_logs': logs}, 200)
        elif path == '/api/orca/logs/fiscal':
            query = parse_qs(urlparse(self.path).query)
            limit = int(query.get('limit', [100])[0])
            syncs = self.db.fiscal_syncs[-limit:]
            self.send_json_response({'fiscal_syncs': syncs}, 200)
        else:
            self.send_error(404, 'Not found')

    def handle_audit_log(self, data: Dict[str, Any]):
        """Handle POST /api/orca/audit-log."""
        # Validate required fields
        required = ['module_name', 'model_name', 'record_id', 'action']
        missing = [f for f in required if f not in data]

        if missing:
            self.send_json_response({
                'success': False,
                'error': 'missing_fields',
                'missing': missing
            }, 400)
            return

        # Record the log
        response = self.db.record_audit_log(data)
        self.send_json_response(response, response.get('status', 201))

    def handle_fiscal_sync(self, data: Dict[str, Any]):
        """Handle POST /api/orca/fiscal-sync."""
        # Validate required fields
        required = ['module_name', 'model_name', 'record_id', 'sync_type']
        missing = [f for f in required if f not in data]

        if missing:
            self.send_json_response({
                'success': False,
                'error': 'missing_fields',
                'missing': missing
            }, 400)
            return

        # Record the sync
        response = self.db.record_fiscal_sync(data)
        self.send_json_response(response, response.get('status', 201))

    def send_json_response(self, data: Dict[str, Any], status: int):
        """Send JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        """Suppress default logging."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Mock ORCA NestJS Endpoints')
    parser.add_argument('--port', type=int, default=8000,
                        help='Port to listen on (default: 8000)')
    parser.add_argument('--host', default='127.0.0.1',
                        help='Host to listen on (default: 127.0.0.1)')
    parser.add_argument('--db', default='mock_orca.json',
                        help='Database file for persistence')

    args = parser.parse_args()

    # Initialize database
    db = MockOrcaDB(db_file=args.db)
    MockOrcaRequestHandler.db = db

    # Start server
    server_address = (args.host, args.port)
    httpd = HTTPServer(server_address, MockOrcaRequestHandler)

    print(f"🚀 Mock ORCA Endpoints listening on http://{args.host}:{args.port}")
    print(f"   POST /api/orca/audit-log       - Record audit log")
    print(f"   POST /api/orca/fiscal-sync     - Record fiscal sync")
    print(f"   GET  /api/orca/health          - Health check")
    print(f"   GET  /api/orca/logs            - View statistics")
    print(f"   GET  /api/orca/logs/audit      - View audit logs")
    print(f"   GET  /api/orca/logs/fiscal     - View fiscal syncs")
    print(f"📁 Database: {args.db}")
    print("\n✓ Mock server ready. Press Ctrl+C to stop.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        return 0


if __name__ == '__main__':
    sys.exit(main())
