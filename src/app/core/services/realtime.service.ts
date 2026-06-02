import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { WS_NAMESPACE } from '../config';

export interface RealtimeEvent<T = unknown> {
  topic: string;
  payload: T;
}

/** Tópicos de dominio que emite el backend por Socket.IO. */
const TOPICS = [
  'case.created', 'case.status.changed', 'case.updated',
  'document.created', 'document.signed',
  'request.created', 'request.resolved',
  'notification.created', 'reports.updated',
];

/**
 * Cliente Socket.IO. Reenvía cada evento de dominio del backend a un Subject
 * que los servicios de estado consumen para refrescar la UI en tiempo real.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket | null = null;
  private readonly subject = new Subject<RealtimeEvent>();
  readonly events$ = this.subject.asObservable();

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(WS_NAMESPACE, { transports: ['websocket', 'polling'] });
    for (const topic of TOPICS) {
      this.socket.on(topic, (payload: unknown) => this.subject.next({ topic, payload }));
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
