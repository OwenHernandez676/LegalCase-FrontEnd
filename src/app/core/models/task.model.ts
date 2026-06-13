import { CaseStatus, Priority } from './enums';

/** Tarea del tablero Kanban de un expediente. Los estados son las columnas. */
export interface LegalTask {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: Priority;
  /** Fecha límite en ISO (o vacío si no tiene). */
  fechaLimite: string;
  estado: CaseStatus;
  expedienteId: string;
  abogadoId: string;
}
