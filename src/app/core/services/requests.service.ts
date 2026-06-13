import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { CaseType, LegalRequest, Priority, RequestStatus } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { CasesService } from './cases.service';
import { ApiRequest, mapRequest } from './api.mappers';

/** Datos del formulario público de solicitud (POST /api/requests, sin auth). */
export interface RequestInput {
  cliente: string;
  correo: string;
  telefono: string;
  tipo: CaseType;
  prioridad: Priority;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);
  private readonly cases = inject(CasesService);

  private readonly _requests = signal<LegalRequest[]>([]);
  readonly requests = this._requests.asReadonly();
  readonly pending = computed(() => this._requests().filter((r) => r.estado === 'Pendiente'));

  constructor() {
    // GET /api/requests es solo para administrador: cargar únicamente con ese rol.
    effect(() => {
      if (this.auth.isAuthenticated() && this.auth.role() === 'administrador') this.load();
      else this._requests.set([]);
    });
  }

  load(): void {
    this.api.get<ApiRequest[]>('requests').subscribe({
      next: (list) => this._requests.set(list.map(mapRequest)),
      error: () => this._requests.set([]),
    });
  }

  byStatus(status: RequestStatus | 'Todas'): LegalRequest[] {
    return status === 'Todas' ? this._requests() : this._requests().filter((r) => r.estado === status);
  }

  /** Solicitud enviada desde el formulario público de la landing. */
  create(input: RequestInput): Observable<LegalRequest> {
    return this.api.post<ApiRequest>('requests', input).pipe(
      map(mapRequest),
      tap((created) => {
        if (this.auth.role() === 'administrador') this._requests.update((list) => [created, ...list]);
      }),
    );
  }

  /**
   * Aprueba/rechaza una solicitud.
   * - Al APROBAR: envía abogado y prioridad para que el backend cree el cliente,
   *   el expediente (asignado) y dispare el correo de bienvenida.
   * - Al RECHAZAR: envía el motivo (observaciones) que el backend persiste.
   */
  resolve(id: string, estado: RequestStatus,
          opts?: { abogado?: string; abogadoId?: string; prioridad?: Priority; observaciones?: string; motivo?: string }): void {
    // Optimista: el PATCH confirma; si se aprueba, el backend crea el expediente.
    this._requests.update((list) => list.map((r) => (r.id === id ? { ...r, estado } : r)));
    const body: Record<string, unknown> = { estado };
    if (estado === 'Aprobada') {
      if (opts?.abogado) body['abogado'] = opts.abogado;
      if (opts?.abogadoId) body['abogadoId'] = opts.abogadoId;
      if (opts?.prioridad) body['prioridad'] = opts.prioridad;
      if (opts?.observaciones?.trim()) body['observaciones'] = opts.observaciones.trim();
    } else if (estado === 'Rechazada' && opts?.motivo?.trim()) {
      body['motivo'] = opts.motivo.trim();
    }
    this.api.patch<ApiRequest>(`requests/${id}/resolve`, body).subscribe({
      next: (dto) => {
        this._requests.update((list) => list.map((r) => (r.id === dto.id ? mapRequest(dto) : r)));
        // Recarga los expedientes para reflejar el nuevo caso y su abogado en
        // listados, tarjetas de abogados y panel de ocupación (en vivo).
        if (dto.estado === 'Aprobada') this.cases.load();
      },
      error: () => this.load(),
    });
  }
}
