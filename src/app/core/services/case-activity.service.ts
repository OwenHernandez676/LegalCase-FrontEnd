import { Injectable, signal } from '@angular/core';
import { CaseActivity } from '../models';
import { MOCK_CASE_ACTIVITY } from './mock-data';

/**
 * Registro de actividad por expediente: fuente única de la línea de tiempo.
 * Observaciones, documentos, cambios de estado y eventos generan entradas aquí;
 * abogado y cliente leen la misma cronología.
 */
@Injectable({ providedIn: 'root' })
export class CaseActivityService {
  private seq = 0;
  private readonly _items = signal<CaseActivity[]>(MOCK_CASE_ACTIVITY);
  readonly items = this._items.asReadonly();

  /** Actividad de un expediente, de lo más reciente a lo más antiguo. */
  byCase(caseId: string): CaseActivity[] {
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
    this._items.update((list) => [item, ...list]);
  }
}
