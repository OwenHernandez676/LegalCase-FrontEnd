/**
 * Datos de demostración en memoria.
 * Permiten que el frontend funcione sin backend. Al conectar NestJS,
 * los servicios reemplazan estas fuentes por llamadas HTTP (ver api.service.ts).
 */
import {
  User, LegalRequest, LegalCase, LegalDocument, CalendarEvent,
  AppNotification, Activity, ChatMessage,
} from '../models';

export const MOCK_USERS: User[] = [
  { id: 'u1', nombre: 'Mariela Fonseca', correo: 'admin@legalcase.hn', rol: 'administrador', activo: true },
  { id: 'u2', nombre: 'Rodrigo Castellanos', correo: 'abogado@legalcase.hn', rol: 'abogado', especialidad: 'Derecho Laboral', cargaTrabajo: 72, calificacion: 4.7, casos: 14, activo: true },
  { id: 'u3', nombre: 'Carlos Mendoza', correo: 'cliente@legalcase.hn', rol: 'cliente', activo: true },
];

export const MOCK_LAWYERS: User[] = [
  { id: 'l1', nombre: 'Mariela Fonseca', correo: 'm.fonseca@legalcase.hn', telefono: '+504 2234-0001', rol: 'abogado', especialidad: 'Derecho Mercantil', cargaTrabajo: 66, calificacion: 4.8, casos: 14, activo: true },
  { id: 'l2', nombre: 'Rodrigo Castellanos', correo: 'r.castellanos@legalcase.hn', telefono: '+504 2234-0002', rol: 'abogado', especialidad: 'Derecho Laboral', cargaTrabajo: 81, calificacion: 4.7, casos: 11, activo: true },
  { id: 'l3', nombre: 'Lucía Bográn', correo: 'l.bogran@legalcase.hn', telefono: '+504 2234-0003', rol: 'abogado', especialidad: 'Derecho de Familia', cargaTrabajo: 54, calificacion: 4.6, casos: 9, activo: true },
  { id: 'l4', nombre: 'Diego Maradiaga', correo: 'd.maradiaga@legalcase.hn', telefono: '+504 2234-0004', rol: 'abogado', especialidad: 'Derecho Penal', cargaTrabajo: 88, calificacion: 4.9, casos: 16, activo: true },
  { id: 'l5', nombre: 'Ana Zelaya', correo: 'a.zelaya@legalcase.hn', telefono: '+504 2234-0005', rol: 'abogado', especialidad: 'Derecho Civil', cargaTrabajo: 47, calificacion: 4.5, casos: 8, activo: true },
];

export const MOCK_REQUESTS: LegalRequest[] = [
  { id: 'SOL-148', cliente: 'Grupo Andares S.A.', correo: 'legal@andares.hn', telefono: '+504 2234-5678', tipo: 'Mercantil', prioridad: 'Alta', descripcion: 'Constitución de sociedad mercantil y registro de marca comercial para nueva línea de negocio.', estado: 'Pendiente', date: '24 May 2026' },
  { id: 'SOL-147', cliente: 'Ana Lucía Reyes', correo: 'a.reyes@gmail.com', telefono: '+504 9988-1122', tipo: 'Laboral', prioridad: 'Crítica', descripcion: 'Despido injustificado; busca reinstalación y pago de prestaciones laborales pendientes.', estado: 'Pendiente', date: '24 May 2026' },
  { id: 'SOL-146', cliente: 'Industrias Lempira', correo: 'contacto@lempira.hn', telefono: '+504 2200-3344', tipo: 'Civil', prioridad: 'Media', descripcion: 'Incumplimiento de contrato de suministro con proveedor regional.', estado: 'Pendiente', date: '23 May 2026' },
  { id: 'SOL-145', cliente: 'Familia Discua', correo: 'discua@gmail.com', telefono: '+504 9090-7788', tipo: 'Familia', prioridad: 'Baja', descripcion: 'Trámite de divorcio por mutuo consentimiento y régimen de custodia.', estado: 'Aprobada', date: '21 May 2026', expedienteId: 'EXP-2045' },
  { id: 'SOL-144', cliente: 'Roberto Paz', correo: 'r.paz@gmail.com', telefono: '+504 8877-2211', tipo: 'Penal', prioridad: 'Alta', descripcion: 'Defensa en proceso penal por presunto delito patrimonial.', estado: 'Rechazada', date: '19 May 2026' },
];

export const MOCK_CASES: LegalCase[] = [
  { id: 'EXP-2048', titulo: 'Constitución de sociedad — Grupo Andares', cliente: 'Grupo Andares S.A.', abogado: 'Dra. Mariela Fonseca', tipo: 'Mercantil', estado: 'En proceso', prioridad: 'Alta', progreso: 45, docs: 8, opened: '06 Feb 2026', due: '30 Jun 2026', next: 'Audiencia de registro' },
  { id: 'EXP-2047', titulo: 'Demanda laboral por despido injustificado', cliente: 'Carlos Mendoza', abogado: 'Lic. Rodrigo Castellanos', tipo: 'Laboral', estado: 'En revisión', prioridad: 'Crítica', progreso: 68, docs: 14, opened: '04 Feb 2026', due: '12 Jun 2026', next: 'Presentar pruebas' },
  { id: 'EXP-2046', titulo: 'Incumplimiento de contrato de suministro', cliente: 'Industrias Lempira', abogado: 'Lic. Diego Maradiaga', tipo: 'Civil', estado: 'En proceso', prioridad: 'Media', progreso: 32, docs: 6, opened: '28 Ene 2026', due: '20 Jul 2026', next: 'Mediación' },
  { id: 'EXP-2045', titulo: 'Divorcio por mutuo consentimiento', cliente: 'Familia Discua', abogado: 'Lic. Ana Zelaya', tipo: 'Familia', estado: 'Finalizado', prioridad: 'Baja', progreso: 100, docs: 21, opened: '12 Ene 2026', due: '05 May 2026', next: 'Cerrado' },
  { id: 'EXP-2044', titulo: 'Registro de marca y propiedad intelectual', cliente: 'Tecno Soluciones', abogado: 'Dra. Mariela Fonseca', tipo: 'Mercantil', estado: 'Pendiente', prioridad: 'Media', progreso: 12, docs: 3, opened: '20 May 2026', due: '15 Ago 2026', next: 'Búsqueda fonética' },
  { id: 'EXP-2041', titulo: 'Defensa de marca comercial', cliente: 'Grupo Andares S.A.', abogado: 'Dra. Mariela Fonseca', tipo: 'Mercantil', estado: 'En proceso', prioridad: 'Alta', progreso: 58, docs: 11, opened: '15 Feb 2026', due: '28 Jun 2026', next: 'Oposición de marca' },
];

export const MOCK_DOCS: LegalDocument[] = [
  { id: 'd1', name: 'Escritura de constitución.pdf', ext: 'PDF', size: '2.4 MB', caseId: 'EXP-2048', by: 'M. Fonseca', date: '20 May 2026' },
  { id: 'd2', name: 'Contrato de suministro.docx', ext: 'DOCX', size: '480 KB', caseId: 'EXP-2046', by: 'D. Maradiaga', date: '18 May 2026' },
  { id: 'd3', name: 'Estado de cuenta laboral.xlsx', ext: 'XLSX', size: '92 KB', caseId: 'EXP-2047', by: 'R. Castellanos', date: '15 May 2026' },
  { id: 'd4', name: 'Demanda inicial.pdf', ext: 'PDF', size: '1.1 MB', caseId: 'EXP-2047', by: 'R. Castellanos', date: '12 May 2026' },
  { id: 'd5', name: 'Poder legal.pdf', ext: 'PDF', size: '680 KB', caseId: 'EXP-2045', by: 'A. Zelaya', date: '08 May 2026' },
  { id: 'd6', name: 'Pruebas documentales.pdf', ext: 'PDF', size: '3.7 MB', caseId: 'EXP-2047', by: 'R. Castellanos', date: '15 May 2026' },
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Audiencia laboral', type: 'Audiencia', day: 26, time: '09:00', color: '#BB4138', caseId: 'EXP-2047' },
  { id: 'e2', title: 'Reunión con cliente', type: 'Reunión', day: 27, time: '14:30', color: '#2E6CA8', caseId: 'EXP-2048' },
  { id: 'e3', title: 'Vencimiento de pruebas', type: 'Vencimiento', day: 28, time: '23:59', color: '#C07E25', caseId: 'EXP-2047' },
  { id: 'e4', title: 'Audiencia de registro', type: 'Audiencia', day: 30, time: '10:00', color: '#BB4138', caseId: 'EXP-2048' },
  { id: 'e5', title: 'Mediación civil', type: 'Reunión', day: 8, time: '11:00', color: '#2E6CA8', caseId: 'EXP-2046' },
];

export const MOCK_NOTIFS: AppNotification[] = [
  { id: 'n1', tipo: 'solicitud', mensaje: 'Nueva solicitud legal de Grupo Andares', time: 'Hace 10 min', leida: false, icon: 'inbox' },
  { id: 'n2', tipo: 'audiencia', mensaje: 'Audiencia laboral programada para mañana', time: 'Hace 1 h', leida: false, icon: 'cal' },
  { id: 'n3', tipo: 'documento', mensaje: 'Nuevo documento en EXP-2047', time: 'Hace 3 h', leida: true, icon: 'doc' },
  { id: 'n4', tipo: 'estado', mensaje: 'EXP-2045 cambió a Finalizado', time: 'Ayer', leida: true, icon: 'check' },
];

export const MOCK_ACTIVITY: Activity[] = [
  { id: 'a1', text: '**M. Fonseca** aprobó la solicitud **SOL-145**', time: 'Hace 12 min', icon: 'check', color: 'c-green' },
  { id: 'a2', text: 'Nuevo documento en **EXP-2047**', time: 'Hace 1 h', icon: 'doc', color: 'c-blue' },
  { id: 'a3', text: '**R. Castellanos** actualizó el estado de **EXP-2047**', time: 'Hace 3 h', icon: 'flag', color: 'c-gold' },
  { id: 'a4', text: 'Nueva solicitud recibida: **SOL-148**', time: 'Hace 5 h', icon: 'inbox', color: 'c-violet' },
];

export const MOCK_CHAT: ChatMessage[] = [
  { id: 'm1', me: false, text: 'Buenas tardes Carlos. Le informo que la demanda fue admitida por el juzgado.', time: '10:24' },
  { id: 'm2', me: true, text: '¡Excelente noticia! ¿Cuáles son los siguientes pasos?', time: '10:31' },
  { id: 'm3', me: false, text: 'Ahora esperamos la fecha de audiencia. Le notificaré en cuanto la confirmen.', time: '10:35' },
  { id: 'm4', me: true, text: 'Perfecto, muchas gracias por mantenerme informado.', time: '10:36' },
];
