// A02 — puerto del dominio: el caso de uso depende de esta interfaz, nunca de un adapter
// concreto (execFile hacia Python, o el mock). Los adapters implementan este puerto.
import { InterpretationOutput } from '../entities/interpretation.entity';

export interface InterpretRequest {
  source_type: 'text' | 'script' | 'audio';
  content: string;
}

export const ORCA_INTERPRETER_PORT = Symbol('ORCA_INTERPRETER_PORT');

export interface OrcaInterpreterPort {
  interpret(request: InterpretRequest): Promise<InterpretationOutput>;
}
