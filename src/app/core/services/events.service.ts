import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CalendarEvent } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { CasesService } from './cases.service';
import { CaseActivityService } from './case-activity.service';
import { ApiEvent, mapEvent } from './api.mappers';

/** Datos que recibe el formulario de creación de eventos. */
export interface EventInput {
  title: string;
  day: number;
  month: number;
  time: string;
  caseId?: string;
  /** Tipo de evento (Audiencia | Reunión | Vencimiento). */
  type?: 'Audiencia' | 'Reunión' | 'Vencimiento';
  /** Descripción / detalle del evento. */
  description?: string;
}

export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Abreviatura del mes (1-12), p. ej. 5 → "May". */
export function monthShort(m: number): string {
  return MONTHS_ES[m - 1]?.slice(0, 3) ?? '';
}

/** Año del calendario (la vista mensual trabaja con este año). */
const YEAR = 2026;

/**
 * Fuente única de eventos de agenda, sincronizada con GET/POST/DELETE /api/events.
 * Calendario, "Próximos eventos" del dashboard y la línea de tiempo del
 * expediente leen de aquí, por lo que un evento creado se refleja en todos
 * los módulos a la vez.
 */
@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);
  private readonly cases = inject(CasesService);
  private readonly activity = inject(CaseActivityService);

  private readonly _events = signal<CalendarEvent[]>([]);
  readonly events = this._events.asReadonly();

  /** Próximos eventos en orden cronológico (mes, día). */
  readonly upcoming = computed(() =>
    [...this._events()].sort((a, b) => (a.month - b.month) || (a.day - b.day)).slice(0, 5));

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) this.load();
      else this._events.set([]);
    });
  }

  load(): void {
    this.api.get<ApiEvent[]>('events').subscribe({
      next: (list) => this._events.set(list.map(mapEvent)),
      error: () => this._events.set([]),
    });
  }

  byCase(caseId: string): CalendarEvent[] {
    return this._events()
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => (a.month - b.month) || (a.day - b.day));
  }

  add(data: EventInput, autor: string): void {
    const [hh, mm] = data.time.split(':').map(Number);
    const fecha = new Date(YEAR, data.month - 1, data.day, hh || 9, mm || 0);
    const descripcion = data.description?.trim();
    // El backend solo acepta Audiencia | Reunión | Vencimiento.
    const body = {
      titulo: data.title,
      tipo: data.type ?? 'Reunión',
      fecha: fecha.toISOString(),
      ...(descripcion ? { descripcion } : {}),
      ...(data.caseId ? { expedienteId: data.caseId } : {}),
    };
    this.api.post<ApiEvent>('events', body).subscribe({
      next: (dto) => {
        const event = mapEvent(dto);
        this._events.update((list) => [...list, event]);

        if (event.caseId) {
          // La línea de tiempo conserva título, fecha y descripción del evento
          // (el backend regenera el título genérico al recargar, así que toda la
          // información relevante va en el detalle para que sobreviva).
          const cuando = `${event.day} ${monthShort(event.month)} ${YEAR} · ${event.time}`;
          const detalle = `"${event.title}" · ${cuando}${descripcion ? ` — ${descripcion}` : ''}`;
          this.activity.log({
            caseId: event.caseId,
            tipo: 'evento',
            titulo: 'Evento programado: ' + event.title,
            detalle,
            autor,
          });
        }
        // Las notificaciones a los participantes las emite el backend en tiempo real.
      },
    });
  }

  remove(id: string): void {
    this._events.update((list) => list.filter((e) => e.id !== id));
    this.api.delete(`events/${id}`).subscribe({
      error: () => this.load(),
    });
  }
}
