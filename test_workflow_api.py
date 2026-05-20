#!/usr/bin/env python3
"""Test the n8n workflow API endpoints."""

import json
import requests
from pathlib import Path

BASE_URL = "http://localhost:8015"
API_BASE = f"{BASE_URL}/api/n8n"

def test_health():
    """Test health endpoint."""
    print("\n[TEST] Health check...")
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"  Status: {resp.status_code}")
        print(f"  Response: {resp.json()}")
        return resp.status_code == 200
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def test_node_types():
    """Get available node types."""
    print("\n[TEST] Get node types...")
    try:
        resp = requests.get(f"{API_BASE}/node-types", timeout=5)
        data = resp.json()
        print(f"  Status: {resp.status_code}")
        print(f"  Node types count: {len(data)}")
        for ntype, info in list(data.items())[:3]:
            print(f"    - {info['label']} ({ntype})")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def test_list_workflows():
    """List workflows."""
    print("\n[TEST] List workflows...")
    try:
        resp = requests.get(f"{API_BASE}/workflows", timeout=5)
        data = resp.json()
        print(f"  Status: {resp.status_code}")
        print(f"  Total workflows: {data.get('total', 0)}")
        print(f"  Items: {len(data.get('items', []))}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def test_create_workflow():
    """Create a test workflow."""
    print("\n[TEST] Create workflow...")

    # Load test workflow from file
    test_file = Path("apps/orca/data/test_workflow.json")
    if not test_file.exists():
        print(f"  SKIP: {test_file} not found")
        return False

    try:
        with open(test_file) as f:
            workflow = json.load(f)

        resp = requests.post(f"{API_BASE}/workflows", json=workflow, timeout=5)
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        print(f"  Response: {data}")

        if "id" in data:
            print(f"  Created workflow ID: {data['id']}")
            return data.get("id")
        return False
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def test_get_workflow(workflow_id):
    """Get a specific workflow."""
    if not workflow_id:
        print("\n[SKIP] Get workflow (no ID)")
        return False

    print(f"\n[TEST] Get workflow {workflow_id[:8]}...")
    try:
        resp = requests.get(f"{API_BASE}/workflows/{workflow_id}", timeout=5)
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        print(f"  Name: {data.get('name')}")
        print(f"  Nodes: {len(data.get('nodes', []))}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing Orca Workflow API")
    print("=" * 60)

    results = []

    # Test health
    results.append(("Health Check", test_health()))

    if not results[-1][1]:
        print("\n[ERROR] Server not responding. Start with: ai-orchestrator serve")
        return

    # Test endpoints
    results.append(("Node Types", test_node_types()))
    results.append(("List Workflows", test_list_workflows()))

    # Test create
    workflow_id = test_create_workflow()
    results.append(("Create Workflow", workflow_id is not False))

    # Test get
    if workflow_id:
        results.append(("Get Workflow", test_get_workflow(workflow_id)))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  {status:4s} - {name}")

    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} passed")

    if passed == total:
        print("\n[SUCCESS] All tests passed!")
    else:
        print("\n[WARNING] Some tests failed")

if __name__ == "__main__":
    main()
