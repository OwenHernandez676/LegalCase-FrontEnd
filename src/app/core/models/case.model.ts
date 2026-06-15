import { CaseStatus, CaseType, Priority } from './enums';

export interface LegalCase {
  /** Identificador real (ObjectId de Mongo) usado en las llamadas a la API. */
  id: string;
  /** Código visible (EXP-####). */
  codigo?: string;
  titulo: string;
  cliente: string;
  abogado: string;
  tipo: CaseType;
  estado: CaseStatus;
  prioridad: Priority;
  progreso: number;
  docs: number;
  opened: string;
  due: string;
  next: string;
  descripcion?: string;
}
