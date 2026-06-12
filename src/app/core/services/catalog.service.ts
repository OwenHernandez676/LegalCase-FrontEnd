import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { LegalDocument, User } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiDocument, ApiUser, mapDocument, mapUser, toApiFileType } from './api.mappers';

/** Datos que recibe el formulario de alta/edición de abogados. */
export interface LawyerInput {
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
}

/**
 * Contraseña inicial de los abogados creados desde el panel:
 * el backend exige contrasena en POST /api/users y el formulario no la pide.
 */
const DEFAULT_LAWYER_PASSWORD = 'LegalCase#2026';

/** Catálogos de apoyo (documentos, abogados) expuestos como signals. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);

  private readonly _documents = signal<LegalDocument[]>([]);
  readonly documents = this._documents.asReadonly();

  private readonly _lawyers = signal<User[]>([]);
  readonly lawyers = this._lawyers.asReadonly();
  /** Solo abogados activos: los únicos que pueden recibir asignaciones. */
  readonly activeLawyers = computed(() => this._lawyers().filter((l) => l.activo));

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this._documents.set([]);
        this._lawyers.set([]);
        return;
      }
      this.loadDocuments();
      // GET /api/users es solo para administrador.
      if (this.auth.role() === 'administrador') this.loadLawyers();
    });
  }

  loadDocuments(): void {
    this.api.get<ApiDocument[]>('documents').subscribe({
      next: (list) => this._documents.set(list.map(mapDocument)),
      error: () => this._documents.set([]),
    });
  }

  loadLawyers(): void {
    this.api.get<ApiUser[]>('users', { rol: 'abogado' }).subscribe({
      next: (list) => this._lawyers.set(list.map(mapUser)),
      error: () => this._lawyers.set([]),
    });
  }

  addDocument(doc: Omit<LegalDocument, 'id' | 'date'>): void {
    this.api.post<ApiDocument>('documents', {
      nombre: doc.name,
      tipo: toApiFileType(doc.ext),
      tamano: doc.size,
      expedienteId: doc.caseId,
      subidoPor: doc.by,
    }).subscribe({
      next: (dto) => this._documents.update((list) => [mapDocument(dto), ...list]),
    });
  }

  /**
   * Alta de abogado. Devuelve el Observable para que la página reaccione al
   * resultado HTTP: en éxito actualiza la lista de forma optimista y refresca
   * desde el backend (refetch de seguridad); en error propaga para mostrar el
   * mensaje real de la API. El backend exige contrasena en POST /api/users.
   */
  addLawyer(data: LawyerInput): Observable<User> {
    return this.api.post<ApiUser>('users', {
      nombre: data.nombre,
      correo: data.correo,
      contrasena: DEFAULT_LAWYER_PASSWORD,
      rol: 'abogado',
      especialidad: data.especialidad,
      telefono: data.telefono,
      activo: data.activo,
    }).pipe(
      map(mapUser),
      tap((user) => {
        this._lawyers.update((list) => [user, ...list.filter((l) => l.id !== user.id)]);
        this.loadLawyers(); // refetch de seguridad: reconcilia con la BD
      }),
    );
  }

  /** Edición de abogado. El backend no permite cambiar el correo en PATCH /api/users/:id. */
  updateLawyer(id: string, data: LawyerInput): Observable<User> {
    return this.api.patch<ApiUser>(`users/${id}`, {
      nombre: data.nombre,
      especialidad: data.especialidad,
      telefono: data.telefono,
      activo: data.activo,
    }).pipe(
      map(mapUser),
      tap((user) => {
        this._lawyers.update((list) => list.map((l) => (l.id === id ? user : l)));
        this.loadLawyers(); // refetch de seguridad
      }),
    );
  }

  /** Habilita/inhabilita un abogado (PATCH optimista con reconciliación). */
  setLawyerActive(id: string, activo: boolean): Observable<User> {
    this._lawyers.update((list) => list.map((l) => (l.id === id ? { ...l, activo } : l)));
    return this.api.patch<ApiUser>(`users/${id}`, { activo }).pipe(
      map(mapUser),
      tap((user) => this._lawyers.update((list) => list.map((l) => (l.id === id ? user : l)))),
    );
  }
}
