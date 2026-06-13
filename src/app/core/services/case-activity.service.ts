import { Injectable, signal, effect, inject, untracked } from '@angular/core';
import { CaseActivity } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiActivity, isObjectId, mapActivity } from './api.mappers';

/**
 * Registro de actividad por expediente: fuente única de la línea de tiempo.
 * Se alimenta de GET /api/activities y GET /api/activities/case/:id.
 * log() inserta la entrada de forma optimista y la PERSISTE en el backend
 * (POST /api/activities) cuando el expediente es real, reemplazándola por la
 * entrada confirmada para que sobreviva a recargas.
 */
@Injectable({ providedIn: 'root' })
export class CaseActivityService {
  private seq = 0;
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);

  private readonly _items = signal<CaseActivity[]>([]);
  readonly items = this._items.asReadonly();

  /** Expedientes cuya actividad ya fue solicitada al backend. */
  private readonly fetched = new Set<string>();

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) this.loadRecent();
      else {
        this._items.set([]);
        this.fetched.clear();
      }
    });
  }

  loadRecent(): void {
    this.api.get<ApiActivity[]>('activities', { limit: 100 }).subscribe({
      next: (list) => this.merge(list.map(mapActivity)),
      error: () => this._items.set([]),
    });
  }

  /** Actividad de un expediente, de lo más reciente a lo más antiguo. */
  byCase(caseId: string): CaseActivity[] {
    if (isObjectId(caseId) && !this.fetched.has(caseId)) {
      this.fetched.add(caseId);
      untracked(() => {
        this.api.get<ApiActivity[]>(`activities/case/${caseId}`).subscribe({
          next: (list) => this.merge(list.map(mapActivity)),
        });
      });
    }
    return this._items()
      .filter((a) => a.caseId === caseId)
      .sort((a, b) => b.ts - a.ts);
  }

  log(entry: Omit<CaseActivity, 'id' | 'ts' | 'time'>): void {
    const now = new Date();
    const item: CaseActivity = {
      ...entry,
      id: 'ca-' + Date.now() + '-' + ++this.seq,
      ts: now.getTime(),
      time: now.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    };
    // Insert optimista para respuesta inmediata en la UI.
    this._items.update((list) => [item, ...list]);

    // Persistencia real: solo para expedientes del backend (ObjectId).
    if (!isObjectId(entry.caseId)) return;
    this.api.post<ApiActivity>('activities', {
      expedienteId: entry.caseId,
      tipo: entry.tipo,
      descripcion: entry.detalle,
      autor: entry.autor,
    }).subscribe({
      // Reemplaza la entrada optimista por la confirmada (id real del backend).
      next: (dto) => this._items.update((list) =>
        [mapActivity(dto), ...list.filter((a) => a.id !== item.id)]),
    });
  }

  /** Une actividades del backend sin duplicar las ya presentes. */
  private merge(incoming: CaseActivity[]): void {
    this._items.update((list) => {
      const ids = new Set(list.map((a) => a.id));
      return [...incoming.filter((a) => !ids.has(a.id)), ...list];
    });
  }
}
