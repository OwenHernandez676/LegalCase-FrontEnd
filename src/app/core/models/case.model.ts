import { CaseStatus, CaseType, Priority } from './enums';

export interface LegalCase {
  id: string;
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
