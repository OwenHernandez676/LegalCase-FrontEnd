import { CaseType, Priority, RequestStatus } from './enums';

export interface LegalRequest {
  /** Identificador real (ObjectId de Mongo) usado en las llamadas a la API. */
  id: string;
  /** Código visible para humanos (SOL-###). */
  codigo?: string;
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
