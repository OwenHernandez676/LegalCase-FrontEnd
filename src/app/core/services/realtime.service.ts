import { Injectable, effect, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { AuthStore } from '../store/auth.store';
import { NotificationService } from './notification.service';
import { CasesService } from './cases.service';
import { CatalogService } from './catalog.service';
import { EventsService } from './events.service';
import { MessagesService } from './messages.service';
import { CaseActivityService } from './case-activity.service';
import { RequestsService } from './requests.service';
import { CaseStatus } from '../models';
import { ApiCase, ApiDocument, ApiEvent, ApiMessage, ApiNotification } from './api.mappers';

/**
 * Capa de tiempo real (Socket.IO) del frontend.
 * Conecta al backend con el JWT del usuario y traduce los eventos de dominio
 * recibidos en actualizaciones de los stores con Signals. Gracias a esto la
 * campana de notificaciones, la mensajería, la línea de tiempo y el estado de
 * los expedientes se actualizan solos, SIN recargar la página.
 *
 * Se instancia desde el shell de la aplicación (AppLayout) tras el login.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth = inject(AuthStore);
  private readonly notifications = inject(NotificationService);
  private readonly cases = inject(CasesService);
  private readonly catalog = inject(CatalogService);
  private readonly events = inject(EventsService);
  private readonly messages = inject(MessagesService);
  private readonly activity = inject(CaseActivityService);
  private readonly requests = inject(RequestsService);

  private socket: Socket | null = null;

  /** Origen del servidor (sin el sufijo /api) para la conexión WebSocket. */
  private readonly origin = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor() {
    // Conecta/desconecta según el estado de sesión.
    effect(() => {
      const token = this.auth.token();
      if (token) this.connect(token);
      else this.disconnect();
    });
  }

  private connect(token: string): void {
    if (this.socket) return; // ya conectado
    this.socket = io(this.origin, {
      path: '/realtime',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    this.registerHandlers(this.socket);
  }

  private disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  private registerHandlers(socket: Socket): void {
    // Notificación dirigida al usuario → la campana incrementa su contador (+1, +2…).
    socket.on('notification.created', (n: ApiNotification) => this.notifications.addRealtime(n));

    // Mensaje nuevo en una conversación del usuario.
    socket.on('message.sent', (m: ApiMessage) => this.messages.receiveRealtime(m));

    // Actividad nueva → refresca la línea de tiempo (cliente y abogado).
    socket.on('activity.created', () => this.activity.loadRecent());

    // Cambio de estado de un expediente → se refleja en tabla, modal y dashboard.
    socket.on('case.status.changed', (p: { id: string; estado: CaseStatus; progreso: number }) =>
      this.cases.applyStatusRealtime(p.id, p.estado, p.progreso));

    // Expediente nuevo (p. ej. tras aprobar una solicitud).
    socket.on('case.created', (_c: ApiCase) => this.cases.load());

    // Documento nuevo → recarga el catálogo (ya filtrado por rol en el backend).
    socket.on('document.created', (_d: ApiDocument) => this.catalog.loadDocuments());

    // Evento de agenda nuevo → recarga eventos (filtrados por rol en el backend).
    socket.on('event.created', (_e: ApiEvent) => this.events.load());

    // Solicitudes (solo el administrador mantiene su listado).
    socket.on('request.created', () => this.requests.load());
    socket.on('request.resolved', () => { this.requests.load(); this.cases.load(); });
  }
}
