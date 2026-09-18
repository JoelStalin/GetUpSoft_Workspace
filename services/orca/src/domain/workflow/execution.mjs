// A03 - Workflow Domain Entity (Pure TypeScript/JavaScript - Zero Framework Imports)
export class WorkflowExecution {
  constructor({ id, projectId, organizationId, definition }) {
    if (!id || !projectId || !organizationId) {
      throw new Error('Identificadores obligatorios faltantes');
    }
    this.id = id;
    this.projectId = projectId;
    this.organizationId = organizationId;
    this.definition = definition;
    this.status = 'CREATED';
  }

  start() {
    this.status = 'IN_PROGRESS';
    return { status: this.status };
  }

  complete() {
    this.status = 'COMPLETED';
    return { status: this.status };
  }
}
