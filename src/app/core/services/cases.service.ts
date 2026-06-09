import { Injectable, signal, computed } from '@angular/core';
import { CaseStatus, LegalCase } from '../models';
import { MOCK_CASES } from './mock-data';

/** Store de expedientes — fuente única consumida por listado, Kanban y dashboards. */
@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly _cases = signal<LegalCase[]>(MOCK_CASES);
  readonly cases = this._cases.asReadonly();

  readonly total = computed(() => this._cases().length);
  readonly active = computed(() => this._cases().filter((c) => c.estado !== 'Finalizado').length);
  readonly finished = computed(() => this._cases().filter((c) => c.estado === 'Finalizado').length);

  byStatus(status: CaseStatus): LegalCase[] { return this._cases().filter((c) => c.estado === status); }

  updateStatus(id: string, estado: CaseStatus): void {
    this._cases.update((list) =>
      list.map((c) => (c.id === id ? { ...c, estado, progreso: estado === 'Finalizado' ? 100 : c.progreso } : c)),
    );
  }
}
