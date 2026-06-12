import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CaseStatus, LegalCase } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiCase, mapCase } from './api.mappers';

/** Store de expedientes — fuente única consumida por listado, Kanban y dashboards. */
@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);

  private readonly _cases = signal<LegalCase[]>([]);
  readonly cases = this._cases.asReadonly();

  readonly total = computed(() => this._cases().length);
  readonly active = computed(() => this._cases().filter((c) => c.estado !== 'Finalizado').length);
  readonly finished = computed(() => this._cases().filter((c) => c.estado === 'Finalizado').length);

  constructor() {
    // Carga (y recarga al cambiar de sesión) desde GET /api/cases.
    effect(() => {
      if (this.auth.isAuthenticated()) this.load();
      else this._cases.set([]);
    });
  }

  load(): void {
    this.api.get<ApiCase[]>('cases').subscribe({
      next: (list) => this._cases.set(list.map(mapCase)),
      error: () => this._cases.set([]),
    });
  }

  byStatus(status: CaseStatus): LegalCase[] { return this._cases().filter((c) => c.estado === status); }

  updateStatus(id: string, estado: CaseStatus): void {
    // Actualización optimista; el PATCH confirma y el backend recalcula el progreso.
    this._cases.update((list) =>
      list.map((c) => (c.id === id ? { ...c, estado, progreso: estado === 'Finalizado' ? 100 : c.progreso } : c)),
    );
    this.api.patch<ApiCase>(`cases/${id}/status`, { estado }).subscribe({
      next: (dto) => this._cases.update((list) => list.map((c) => (c.id === dto.id ? mapCase(dto) : c))),
      error: () => this.load(),
    });
  }
}
