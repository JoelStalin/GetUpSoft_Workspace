# ORCA Integration - Additional Requirements (2026-05-26)

## User Requirements Added

### 1. Project Identifier in ORCA Models
**Requirement:** Each ORCA log model must include a project_id field so that ORCA can track which project (getupsoft service) a model/audit log originated from.

**Impact:** 
- Modify base_orca_integration OrcaLog model to add:
  - `project_id`: Character field for project identifier
  - `project_name`: Character field for human-readable project name
- Update all per-module log models (v19, v18, v17) to include project context in audit logs
- Update all mixin implementations to populate project_id on log creation

**Affected Components:**
- base_orca_integration/models/orca_log.py (v19, v18, v17)
- All l10n_do_accounting*.orca.log models
- All pos, rnc_search models

**Testing Required:**
- Verify project_id is populated correctly on audit log creation
- Verify ORCA can query/filter logs by project_id
- Test with multiple projects to ensure isolation

### 2. Odoo Container Configuration - v19 GetUpSoft Workspace
**Requirement:** All Odoo containers must be configured to use v19 from getupsoft_workspace repository.

**Scope:**
- Check current container configurations (docker-compose files, deployment scripts)
- Identify which Odoo versions are running in containers
- Update containers to use v19 modules from GetUpSoft source
- Verify container connectivity and module loading

**Locations to Check:**
- docker-compose.yml files in project root
- Deployment scripts in scripts/ directory
- Container environment variables
- Odoo addons mount paths

## Implementation Sequence (Next Session)

1. **Modify base_orca_integration** (all versions)
   - Add project_id and project_name to OrcaLog base model
   - Update OrcaAuditMixin to capture project context

2. **Update all module log models** (v19, v18, v17)
   - Add project_id fields to module-specific logs
   - Test project tracking

3. **Test ORCA Project Tracking**
   - Create test audit logs with project identifiers
   - Verify ORCA API receives project information
   - Test multi-project isolation

4. **Update Container Configurations**
   - Audit current Docker/deployment setup
   - Update Odoo addons paths to v19/Modules
   - Restart containers with v19
   - Verify modules load correctly

## Estimated Effort
- Project identifier implementation: 3-4 hours (all versions)
- Testing: 2 hours
- Container configuration: 2-3 hours
- **Total: 7-9 additional hours**

**New Total Project Effort: ~50-52 hours (vs original 42h estimate)**
