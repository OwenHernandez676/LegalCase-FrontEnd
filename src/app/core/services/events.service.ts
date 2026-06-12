import { Injectable, computed, inject, signal } from '@angular/core';
import { CalendarEvent, EventType } from '../models';
import { MOCK_EVENTS } from './mock-data';
import { CaseActivityService } from './case-activity.service';
import { NotificationService } from './notification.service';

/** Datos que recibe el formulario de creación de eventos. */
export interface EventInput {
  title: string;
  day: number;
  month: number;
  time: string;
  caseId?: string;
}

const TYPE_COLOR: Record<EventType, string> = {
  'Audiencia': '#BB4138',
  'Reunión': '#2E6CA8',
  'Vencimiento': '#C07E25',
  'Seguimiento': '#2C7A57',
};

export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Abreviatura del mes (1-12), p. ej. 5 → "May". */
export function monthShort(m: number): string {
  return MONTHS_ES[m - 1]?.slice(0, 3) ?? '';
}

/**
 * Fuente única de eventos de agenda. Calendario, "Próximos eventos" del
 * dashboard y la línea de tiempo del expediente leen de aquí, por lo que un
 * evento creado se refleja en todos los módulos a la vez.
 *
 * Punto de integración futuro con Google Calendar API: create/update/delete
 * pasarían por este servicio, que sincronizaría con el proveedor externo.
 */
@Injectable({ providedIn: 'root' })
export class EventsService {
  private seq = 0;
  private readonly activity = inject(CaseActivityService);
  private readonly notifs = inject(NotificationService);

  private readonly _events = signal<CalendarEvent[]>(MOCK_EVENTS);
  readonly events = this._events.asReadonly();

  /** Próximos eventos en orden cronológico (mes, día). */
  readonly upcoming = computed(() =>
    [...this._events()].sort((a, b) => (a.month - b.month) || (a.day - b.day)).slice(0, 5));

  byCase(caseId: string): CalendarEvent[] {
    return this._events()
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => (a.month - b.month) || (a.day - b.day));
  }

  add(data: EventInput, autor: string): void {
    const type: EventType = 'Seguimiento';
    const event: CalendarEvent = {
      id: 'e-' + Date.now() + '-' + ++this.seq,
      title: data.title,
      type,
      day: data.day,
      month: data.month,
      time: data.time,
      color: TYPE_COLOR[type],
      caseId: data.caseId || undefined,
    };
    this._events.update((list) => [...list, event]);

    if (event.caseId) {
      this.activity.log({
        caseId: event.caseId,
        tipo: 'evento',
        titulo: 'Evento programado: ' + event.title,
        detalle: `${event.day} ${monthShort(event.month)} 2026 · ${event.time}`,
        autor,
      });
    }
    this.notifs.push({
      tipo: 'evento',
      mensaje: `${autor} programó "${event.title}"` + (event.caseId ? ` en ${event.caseId}` : ''),
      icon: 'cal',
      route: '/app/calendar',
    });
  }

  remove(id: string): void {
    this._events.update((list) => list.filter((e) => e.id !== id));
  }
}
