import { Injectable, computed, effect, signal, inject, untracked } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { CaseStatus, LegalTask, Priority } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiTask, isObjectId, mapTask } from './api.mappers';

/** Datos para crear/editar una tarea desde el tablero. */
export interface TaskInput {
  titulo: string;
  descripcion?: string;
  prioridad?: Priority;
  fechaLimite?: string;
  estado?: CaseStatus;
}

/**
 * Store del tablero Kanban de tareas. Fuente única consumida por el componente
 * de kanban. Persiste en el backend (GET/POST/PATCH/DELETE /api/tasks) con
 * actualización optimista del signal para una UI ágil.
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);

  private readonly _items = signal<LegalTask[]>([]);
  readonly items = this._items.asReadonly();

  /** Expedientes cuya lista de tareas ya fue solicitada al backend. */
  private readonly fetched = new Set<string>();
  private _allLoaded = false;

  /** Tareas no finalizadas del usuario autenticado (KPI del dashboard). */
  readonly pendingCount = computed(() =>
    this._items().filter((t) => t.estado !== 'Finalizado').length);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        untracked(() => { if (!this._allLoaded) this.loadAll(); });
      } else {
        this._items.set([]);
        this._allLoaded = false;
        this.fetched.clear();
      }
    });
  }

  /** Carga todas las tareas del usuario; el backend filtra por rol automáticamente. */
  loadAll(): void {
    this._allLoaded = true;
    this.api.get<ApiTask[]>('tasks').subscribe({
      next: (list) => this.merge(list.map(mapTask)),
      error: () => {},
    });
  }

  /** Tareas de un expediente; dispara la carga la primera vez. */
  byCase(caseId: string): LegalTask[] {
    if (isObjectId(caseId) && !this.fetched.has(caseId)) {
      this.fetched.add(caseId);
      untracked(() => {
        this.api.get<ApiTask[]>('tasks', { expedienteId: caseId }).subscribe({
          next: (list) => this.merge(list.map(mapTask)),
        });
      });
    }
    return this._items().filter((t) => t.expedienteId === caseId);
  }

  create(caseId: string, input: TaskInput): Observable<LegalTask> {
    return this.api.post<ApiTask>('tasks', { ...input, expedienteId: caseId }).pipe(
      map(mapTask),
      tap((t) => this._items.update((list) => [t, ...list])),
    );
  }

  update(id: string, patch: TaskInput): Observable<LegalTask> {
    return this.api.patch<ApiTask>(`tasks/${id}`, patch).pipe(
      map(mapTask),
      tap((t) => this._items.update((list) => list.map((x) => (x.id === id ? t : x)))),
    );
  }

  /** Mueve una tarea de columna (cambia su estado) de forma optimista. */
  move(id: string, estado: CaseStatus): void {
    const prev = this._items();
    this._items.update((list) => list.map((t) => (t.id === id ? { ...t, estado } : t)));
    this.api.patch<ApiTask>(`tasks/${id}`, { estado }).subscribe({
      next: (dto) => this._items.update((list) => list.map((t) => (t.id === id ? mapTask(dto) : t))),
      error: () => this._items.set(prev), // revierte si falla
    });
  }

  remove(id: string): Observable<unknown> {
    return this.api.delete(`tasks/${id}`).pipe(
      tap(() => this._items.update((list) => list.filter((t) => t.id !== id))),
    );
  }

  private merge(incoming: LegalTask[]): void {
    this._items.update((list) => {
      const ids = new Set(incoming.map((t) => t.id));
      return [...incoming, ...list.filter((t) => !ids.has(t.id))];
    });
  }
}
