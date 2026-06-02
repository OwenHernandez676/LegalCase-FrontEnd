/** Modelos que devuelve el backend NestJS (campos en español). */

export type BackendRole = 'administrador' | 'abogado' | 'cliente';
export type BackendCaseStatus = 'Pendiente' | 'En proceso' | 'En revisión' | 'Finalizado';
export type BackendPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type BackendCaseType = 'Mercantil' | 'Laboral' | 'Penal' | 'Civil' | 'Familia' | 'Otro';

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol: BackendRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface BackendCase {
  id: string;
  codigo: string;
  titulo: string;
  tipo: BackendCaseType;
  cliente: string;
  abogado: string | null;
  estado: BackendCaseStatus;
  prioridad: BackendPriority;
  progreso: number;
  fechaApertura: string;
  fechaVencimiento: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendDocument {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'DOCX' | 'XLSX';
  tamano: string;
  expedienteId: string;
  subidoPor: string;
  carpeta: 'pruebas' | 'escritos' | 'contratos' | 'resoluciones';
  estadoFirma: 'firmado' | 'pendiente' | 'no_requerida';
  url?: string;
  createdAt?: string;
}

export interface BackendEvent {
  id: string;
  titulo: string;
  tipo: 'Audiencia' | 'Reunión' | 'Vencimiento';
  fecha: string;
  expedienteId?: string;
  descripcion?: string;
  createdAt?: string;
}

export interface BackendNotification {
  id: string;
  destinatario: string;
  tipo: 'comentario' | 'audiencia' | 'documento' | 'estado' | 'solicitud';
  mensaje: string;
  leida: boolean;
  createdAt?: string;
}

export interface BackendActivity {
  id: string;
  expedienteId: string;
  tipo: string;
  descripcion: string;
  autor: string;
  createdAt?: string;
}

export interface BackendRequest {
  id: string;
  codigo: string;
  cliente: string;
  correo: string;
  telefono: string;
  tipo: BackendCaseType;
  prioridad: BackendPriority;
  descripcion: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  expedienteId?: string;
  createdAt?: string;
}

export interface BackendMessage {
  id: string;
  expedienteId: string;
  emisor: string;
  receptor: string;
  texto: string;
  leido: boolean;
  createdAt?: string;
}

export interface DashboardReport {
  total: number;
  finalizados: number;
  pendientesSolicitudes: number;
  abogadosActivos: number;
  tasaResolucion: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface CreateCasePayload {
  titulo: string;
  tipo: BackendCaseType;
  cliente: string;
  abogado?: string;
  prioridad: BackendPriority;
  fechaVencimiento: string;
  descripcion?: string;
}

export interface CreateEventPayload {
  titulo: string;
  tipo: 'Audiencia' | 'Reunión' | 'Vencimiento';
  fecha: string;
  expedienteId?: string;
  descripcion?: string;
}
