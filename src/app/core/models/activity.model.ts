/** Tipo de entrada en la línea de tiempo de un expediente. */
export type CaseActivityType = 'observacion' | 'documento' | 'estado' | 'evento' | 'creacion';

/**
 * Actividad cronológica de un expediente: fuente única de la línea de tiempo.
 * Toda acción relevante (observación, documento, cambio de estado, evento)
 * genera una entrada aquí, visible para abogado y cliente.
 */
export interface CaseActivity {
  id: string;
  caseId: string;
  tipo: CaseActivityType;
  titulo: string;
  detalle: string;
  autor: string;
  time: string;
  /** Marca de tiempo para ordenar cronológicamente. */
  ts: number;
}
