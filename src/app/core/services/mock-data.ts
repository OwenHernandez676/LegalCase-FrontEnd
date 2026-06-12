/**
 * Datos de demostración en memoria.
 * Permiten que el frontend funcione sin backend. Al conectar NestJS,
 * los servicios reemplazan estas fuentes por llamadas HTTP (ver api.service.ts).
 */
import {
  User, LegalRequest, LegalCase, LegalDocument, CalendarEvent,
  AppNotification, CaseActivity, CaseTask, Conversation,
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
  { id: 'e1', title: 'Audiencia laboral', type: 'Audiencia', day: 26, month: 5, time: '09:00', color: '#BB4138', caseId: 'EXP-2047' },
  { id: 'e2', title: 'Reunión con cliente', type: 'Reunión', day: 27, month: 5, time: '14:30', color: '#2E6CA8', caseId: 'EXP-2048' },
  { id: 'e3', title: 'Vencimiento de pruebas', type: 'Vencimiento', day: 28, month: 5, time: '23:59', color: '#C07E25', caseId: 'EXP-2047' },
  { id: 'e4', title: 'Audiencia de registro', type: 'Audiencia', day: 30, month: 5, time: '10:00', color: '#BB4138', caseId: 'EXP-2048' },
  { id: 'e5', title: 'Mediación civil', type: 'Reunión', day: 8, month: 6, time: '11:00', color: '#2E6CA8', caseId: 'EXP-2046' },
];

export const MOCK_NOTIFS: AppNotification[] = [
  { id: 'n1', tipo: 'solicitud', mensaje: 'Nueva solicitud legal de Grupo Andares', time: 'Hace 10 min', leida: false, icon: 'inbox' },
  { id: 'n2', tipo: 'audiencia', mensaje: 'Audiencia laboral programada para mañana', time: 'Hace 1 h', leida: false, icon: 'cal' },
  { id: 'n3', tipo: 'documento', mensaje: 'Nuevo documento en EXP-2047', time: 'Hace 3 h', leida: true, icon: 'doc' },
  { id: 'n4', tipo: 'estado', mensaje: 'EXP-2045 cambió a Finalizado', time: 'Ayer', leida: true, icon: 'check' },
];

const DAY = 86_400_000;
const NOW = Date.now();

export const MOCK_CASE_ACTIVITY: CaseActivity[] = [
  { id: 'ca1', caseId: 'EXP-2048', tipo: 'estado', titulo: 'Prioridad actualizada a Alta', detalle: 'El administrador ajustó la prioridad del caso.', autor: 'Mariela Fonseca', time: 'Hace 2 días', ts: NOW - 2 * DAY },
  { id: 'ca2', caseId: 'EXP-2048', tipo: 'documento', titulo: 'Documento agregado al expediente', detalle: '"Escritura de constitución.pdf"', autor: 'Mariela Fonseca', time: 'Hace 4 días', ts: NOW - 4 * DAY },
  { id: 'ca3', caseId: 'EXP-2048', tipo: 'observacion', titulo: 'Observación del abogado', detalle: 'Se registró una nota sobre el avance del caso.', autor: 'Mariela Fonseca', time: 'Hace 1 semana', ts: NOW - 7 * DAY },
  { id: 'ca4', caseId: 'EXP-2048', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '06 Feb 2026', ts: NOW - 90 * DAY },
  { id: 'ca5', caseId: 'EXP-2047', tipo: 'observacion', titulo: 'Observación del abogado', detalle: 'Se presentó la demanda ante el juzgado competente.', autor: 'Rodrigo Castellanos', time: 'Hace 2 horas', ts: NOW - 7_200_000 },
  { id: 'ca6', caseId: 'EXP-2047', tipo: 'documento', titulo: 'Documento agregado al expediente', detalle: '"Demanda inicial.pdf"', autor: 'Rodrigo Castellanos', time: 'Hace 5 días', ts: NOW - 5 * DAY },
  { id: 'ca7', caseId: 'EXP-2047', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '04 Feb 2026', ts: NOW - 92 * DAY },
  { id: 'ca8', caseId: 'EXP-2046', tipo: 'estado', titulo: 'Estado actualizado', detalle: 'El expediente pasó de Pendiente a En proceso.', autor: 'Diego Maradiaga', time: 'Hace 3 días', ts: NOW - 3 * DAY },
  { id: 'ca9', caseId: 'EXP-2046', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '28 Ene 2026', ts: NOW - 99 * DAY },
  { id: 'ca10', caseId: 'EXP-2045', tipo: 'estado', titulo: 'Estado actualizado', detalle: 'El expediente pasó de En revisión a Finalizado.', autor: 'Ana Zelaya', time: '05 May 2026', ts: NOW - 20 * DAY },
  { id: 'ca11', caseId: 'EXP-2045', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '12 Ene 2026', ts: NOW - 115 * DAY },
  { id: 'ca12', caseId: 'EXP-2044', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '20 May 2026', ts: NOW - 5 * DAY },
  { id: 'ca13', caseId: 'EXP-2041', tipo: 'creacion', titulo: 'Expediente creado', detalle: 'Se aprobó la solicitud y se abrió el expediente.', autor: 'Sistema', time: '15 Feb 2026', ts: NOW - 81 * DAY },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  // Bandeja del abogado: una conversación por cliente.
  {
    id: 'cv1', nombre: 'Carlos Mendoza', detalle: 'Cliente · EXP-2047', visiblePara: 'abogado', noLeidos: 1,
    mensajes: [
      { id: 'mm1', me: true, text: 'Buenas tardes Carlos. Le informo que la demanda fue admitida por el juzgado.', time: '10:24' },
      { id: 'mm2', me: false, text: '¡Excelente noticia! ¿Cuáles son los siguientes pasos?', time: '10:31' },
      { id: 'mm3', me: true, text: 'Ahora esperamos la fecha de audiencia. Le notificaré en cuanto la confirmen.', time: '10:35' },
      { id: 'mm4', me: false, text: 'Perfecto, muchas gracias por mantenerme informado.', time: '10:36' },
    ],
  },
  {
    id: 'cv2', nombre: 'Grupo Andares S.A.', detalle: 'Cliente · EXP-2048', visiblePara: 'abogado', noLeidos: 0,
    mensajes: [
      { id: 'mm5', me: false, text: 'Adjuntamos la documentación societaria solicitada.', time: '09:02' },
      { id: 'mm6', me: true, text: 'Documento recibido, gracias. Procedo con el registro.', time: '09:15' },
    ],
  },
  {
    id: 'cv3', nombre: 'Familia Discua', detalle: 'Cliente · EXP-2045', visiblePara: 'abogado', noLeidos: 0,
    mensajes: [
      { id: 'mm7', me: true, text: 'El trámite quedó finalizado. Pueden pasar por la resolución.', time: 'Ayer' },
    ],
  },
  // Bandeja del cliente: su abogado asignado.
  {
    id: 'cv4', nombre: 'Lic. Rodrigo Castellanos', detalle: 'Derecho Laboral · EXP-2047', visiblePara: 'cliente', noLeidos: 1,
    mensajes: [
      { id: 'mm8', me: false, text: 'Buenas tardes Carlos. Le informo que la demanda fue admitida por el juzgado.', time: '10:24' },
      { id: 'mm9', me: true, text: '¡Excelente noticia! ¿Cuáles son los siguientes pasos?', time: '10:31' },
      { id: 'mm10', me: false, text: 'Ahora esperamos la fecha de audiencia. Le notificaré en cuanto la confirmen.', time: '10:35' },
    ],
  },
];

export const MOCK_CASE_TASKS: CaseTask[] = [
  { id: 't1', caseId: 'EXP-2048', titulo: 'Redactar escritura de constitución', estado: 'Finalizado' },
  { id: 't2', caseId: 'EXP-2048', titulo: 'Presentar solicitud de registro mercantil', estado: 'En proceso' },
  { id: 't3', caseId: 'EXP-2048', titulo: 'Búsqueda fonética de la marca', estado: 'Pendiente' },
  { id: 't4', caseId: 'EXP-2047', titulo: 'Presentar demanda ante el juzgado', estado: 'Finalizado' },
  { id: 't5', caseId: 'EXP-2047', titulo: 'Preparar pruebas documentales', estado: 'En revisión' },
  { id: 't6', caseId: 'EXP-2047', titulo: 'Citar testigos a audiencia', estado: 'Pendiente' },
  { id: 't7', caseId: 'EXP-2046', titulo: 'Agendar mediación con proveedor', estado: 'En proceso' },
  { id: 't8', caseId: 'EXP-2045', titulo: 'Entregar resolución de divorcio', estado: 'Finalizado' },
];
