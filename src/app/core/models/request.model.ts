import { CaseType, Priority, RequestStatus } from './enums';

export interface LegalRequest {
  id: string;
  cliente: string;
  correo: string;
  telefono: string;
  tipo: CaseType;
  prioridad: Priority;
  descripcion: string;
  estado: RequestStatus;
  date: string;
  expedienteId?: string;
}
