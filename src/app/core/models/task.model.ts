import { Priority } from './enums';
export interface LegalTask {
  id: string;
  titulo: string;
  caseId: string;
  prioridad: Priority;
  due: string;
  completada: boolean;
}
