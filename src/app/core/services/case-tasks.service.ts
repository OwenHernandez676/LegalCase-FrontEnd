import { Injectable, inject, signal } from '@angular/core';
import { CaseStatus, CaseTask } from '../models';
import { MOCK_CASE_TASKS } from './mock-data';
import { CaseActivityService } from './case-activity.service';

/**
 * Tarjetas del Kanban de cada expediente. Crear, renombrar, mover y eliminar
 * tarjetas opera aquí; mover una tarjeta de columna queda registrado en la
 * línea de tiempo del expediente.
 */
@Injectable({ providedIn: 'root' })
export class CaseTasksService {
  private seq = 0;
  private readonly activity = inject(CaseActivityService);

  private readonly _tasks = signal<CaseTask[]>(MOCK_CASE_TASKS);
  readonly tasks = this._tasks.asReadonly();

  byCase(caseId: string): CaseTask[] {
    return this._tasks().filter((t) => t.caseId === caseId);
  }

  add(caseId: string, titulo: string, estado: CaseStatus, autor: string): void {
    const task: CaseTask = { id: 't-' + Date.now() + '-' + ++this.seq, caseId, titulo, estado };
    this._tasks.update((list) => [...list, task]);
    this.activity.log({
      caseId, tipo: 'estado',
      titulo: 'Nueva tarjeta en el tablero',
      detalle: `"${titulo}" se agregó en ${estado}.`,
      autor,
    });
  }

  rename(id: string, titulo: string): void {
    this._tasks.update((list) => list.map((t) => (t.id === id ? { ...t, titulo } : t)));
  }

  move(id: string, estado: CaseStatus, autor: string): void {
    const task = this._tasks().find((t) => t.id === id);
    if (!task || task.estado === estado) return;
    const prev = task.estado;
    this._tasks.update((list) => list.map((t) => (t.id === id ? { ...t, estado } : t)));
    this.activity.log({
      caseId: task.caseId, tipo: 'estado',
      titulo: 'Tarjeta actualizada',
      detalle: `"${task.titulo}" pasó de ${prev} a ${estado}.`,
      autor,
    });
  }

  remove(id: string): void {
    this._tasks.update((list) => list.filter((t) => t.id !== id));
  }
}
