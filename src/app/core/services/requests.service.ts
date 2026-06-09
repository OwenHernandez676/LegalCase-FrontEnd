import { Injectable, signal, computed } from '@angular/core';
import { LegalRequest, RequestStatus } from '../models';
import { MOCK_REQUESTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly _requests = signal<LegalRequest[]>(MOCK_REQUESTS);
  readonly requests = this._requests.asReadonly();
  readonly pending = computed(() => this._requests().filter((r) => r.estado === 'Pendiente'));

  byStatus(status: RequestStatus | 'Todas'): LegalRequest[] {
    return status === 'Todas' ? this._requests() : this._requests().filter((r) => r.estado === status);
  }
  resolve(id: string, estado: RequestStatus): void {
    this._requests.update((list) => list.map((r) => (r.id === id ? { ...r, estado } : r)));
  }
}
