import { CaseStatus } from './enums';

/** Tarjeta del tablero Kanban de un expediente. */
export interface CaseTask {
  id: string;
  caseId: string;
  titulo: string;
  estado: CaseStatus;
}
