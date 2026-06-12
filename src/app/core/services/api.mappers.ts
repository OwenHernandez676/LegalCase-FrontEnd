import {
  AppNotification, CalendarEvent, CaseActivity, CaseActivityType, CaseStatus, CaseType,
  ChatMessage, EventType, FileType, LegalCase, LegalDocument, LegalRequest,
  NotificationType, Priority, RequestStatus, Role, User,
} from '../models';

/* =====================================================================
 * Contrato real del backend (Express + MongoDB). Estas interfaces son
 * la forma EXACTA del JSON que devuelve la API; los mappers traducen
 * hacia los modelos del frontend sin tocar componentes ni plantillas.
 * ===================================================================== */

export interface ApiCase {
  id: string; codigo: string; titulo: string; tipo: CaseType; cliente: string;
  abogado: string | null; estado: CaseStatus; prioridad: Priority; progreso: number;
  fechaApertura: string; fechaVencimiento: string; descripcion?: string;
  createdAt?: string; updatedAt?: string;
}

export interface ApiRequest {
  id: string; codigo: string; cliente: string; correo: string; telefono: string;
  tipo: CaseType; prioridad: Priority; descripcion: string; estado: RequestStatus;
  expedienteId?: string; createdAt?: string; updatedAt?: string;
}

export interface ApiUser {
  id: string; nombre: string; correo: string; rol: Role; activo: boolean;
  especialidad?: string; cargaTrabajo?: number; telefono?: string;
  createdAt?: string; updatedAt?: string;
}

export interface ApiDocument {
  id: string; nombre: string; tipo: 'PDF' | 'DOCX' | 'XLSX'; tamano: string;
  expedienteId: string; subidoPor: string; createdAt?: string;
}

export interface ApiEvent {
  id: string; titulo: string; tipo: 'Audiencia' | 'Reunión' | 'Vencimiento';
  fecha: string; expedienteId?: string; descripcion?: string; createdAt?: string;
}

export interface ApiActivity {
  id: string; expedienteId: string; tipo: string; descripcion: string;
  autor: string; createdAt?: string;
}

export interface ApiNotification {
  id: string; destinatario: string; tipo: NotificationType; mensaje: string;
  leida: boolean; createdAt?: string;
}

export interface ApiMessage {
  id: string; expedienteId: string; emisor: string; receptor: string;
  texto: string; leido: boolean; createdAt?: string;
}

/* ===== Utilidades de formato (mantienen la experiencia visual previa) ===== */

export function fmtDate(value?: string | Date): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(value?: string | Date): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function fmtTime(value?: string | Date): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

/** El backend valida ObjectId de Mongo en rutas con :id. */
export function isObjectId(id: string | undefined | null): boolean {
  return !!id && /^[a-f\d]{24}$/i.test(id);
}

/** El backend solo acepta PDF | DOCX | XLSX al registrar documentos. */
export function toApiFileType(ext: FileType): 'PDF' | 'DOCX' | 'XLSX' {
  return ext === 'DOCX' || ext === 'XLSX' ? ext : 'PDF';
}

/* ===== Mappers backend → frontend ===== */

export function mapCase(dto: ApiCase): LegalCase {
  return {
    id: dto.id,
    codigo: dto.codigo,
    titulo: dto.titulo,
    cliente: dto.cliente,
    abogado: dto.abogado ?? 'Sin asignar',
    tipo: dto.tipo,
    estado: dto.estado,
    prioridad: dto.prioridad,
    progreso: dto.progreso,
    docs: 0,
    opened: fmtDate(dto.fechaApertura),
    due: fmtDate(dto.fechaVencimiento),
    next: '—',
    descripcion: dto.descripcion,
  };
}

export function mapRequest(dto: ApiRequest): LegalRequest {
  return {
    id: dto.id,
    codigo: dto.codigo,
    cliente: dto.cliente,
    correo: dto.correo,
    telefono: dto.telefono,
    tipo: dto.tipo,
    prioridad: dto.prioridad,
    descripcion: dto.descripcion,
    estado: dto.estado,
    date: fmtDate(dto.createdAt),
    expedienteId: dto.expedienteId,
  };
}

export function mapUser(dto: ApiUser): User {
  return {
    id: dto.id,
    nombre: dto.nombre,
    correo: dto.correo,
    telefono: dto.telefono,
    rol: dto.rol,
    especialidad: dto.especialidad,
    cargaTrabajo: dto.cargaTrabajo,
    activo: dto.activo,
  };
}

export function mapDocument(dto: ApiDocument): LegalDocument {
  return {
    id: dto.id,
    name: dto.nombre,
    ext: dto.tipo,
    size: dto.tamano,
    caseId: dto.expedienteId,
    by: dto.subidoPor,
    date: fmtDate(dto.createdAt),
  };
}

const EVENT_COLOR: Record<EventType, string> = {
  'Audiencia': '#BB4138',
  'Reunión': '#2E6CA8',
  'Vencimiento': '#C07E25',
  'Seguimiento': '#2C7A57',
};

export function mapEvent(dto: ApiEvent): CalendarEvent {
  const d = new Date(dto.fecha);
  return {
    id: dto.id,
    title: dto.titulo,
    type: dto.tipo,
    day: d.getDate(),
    month: d.getMonth() + 1,
    time: fmtTime(d),
    color: EVENT_COLOR[dto.tipo] ?? '#2E6CA8',
    caseId: dto.expedienteId || undefined,
  };
}

const ACTIVITY_TITLE: Record<CaseActivityType, string> = {
  observacion: 'Observación del abogado',
  documento: 'Documento agregado al expediente',
  estado: 'Estado actualizado',
  evento: 'Evento programado',
  creacion: 'Expediente creado',
};

export function mapActivity(dto: ApiActivity): CaseActivity {
  const tipo: CaseActivityType = (dto.tipo in ACTIVITY_TITLE ? dto.tipo : 'observacion') as CaseActivityType;
  const ts = dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now();
  return {
    id: dto.id,
    caseId: dto.expedienteId,
    tipo,
    titulo: ACTIVITY_TITLE[tipo],
    detalle: dto.descripcion,
    autor: dto.autor,
    time: fmtDateTime(dto.createdAt),
    ts,
  };
}

const NOTIF_ICON: Record<NotificationType, string> = {
  comentario: 'msg',
  audiencia: 'cal',
  documento: 'doc',
  estado: 'flag',
  solicitud: 'inbox',
  mensaje: 'msg',
  evento: 'cal',
};

export function mapNotification(dto: ApiNotification): AppNotification {
  return {
    id: dto.id,
    tipo: dto.tipo,
    mensaje: dto.mensaje,
    time: fmtDateTime(dto.createdAt),
    leida: dto.leida,
    icon: NOTIF_ICON[dto.tipo] ?? 'bell',
  };
}

export function mapMessage(dto: ApiMessage, myName: string): ChatMessage {
  return {
    id: dto.id,
    me: dto.emisor === myName,
    text: dto.texto,
    time: fmtTime(dto.createdAt),
  };
}
