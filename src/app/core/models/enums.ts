/** Enumeraciones de dominio compartidas en todo el sistema. */
export type Role = 'administrador' | 'abogado' | 'cliente';

export type CaseStatus = 'Pendiente' | 'En proceso' | 'En revisión' | 'Finalizado';
export type Priority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type RequestStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';
export type CaseType = 'Mercantil' | 'Laboral' | 'Penal' | 'Civil' | 'Familia' | 'Otro';
export type EventType = 'Audiencia' | 'Reunión' | 'Vencimiento' | 'Seguimiento';
export type FileType = 'PDF' | 'DOCX' | 'XLSX' | 'IMG' | 'OTRO';
export type NotificationType = 'comentario' | 'audiencia' | 'documento' | 'estado' | 'solicitud' | 'mensaje' | 'evento';
