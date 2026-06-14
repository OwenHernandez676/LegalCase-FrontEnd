import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { LegalDocument, User } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiDocument, ApiUser, mapDocument, mapUser, toApiFileType } from './api.mappers';
import { fileExt, fileSize, fileToBase64, downloadBlob } from '../utils/file.util';

/** Datos que recibe el formulario de alta/edición de abogados. */
export interface LawyerInput {
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
}

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

  /**
   * Sube un documento real: lee el archivo como base64 y lo persiste con su
   * contenido binario en el backend, de modo que pueda descargarse después.
   */
  uploadDocument(caseId: string, by: string, file: File): Observable<LegalDocument> {
    return from(fileToBase64(file)).pipe(
      switchMap((contenido) => this.api.post<ApiDocument>('documents', {
        nombre: file.name,
        tipo: toApiFileType(fileExt(file.name)),
        tamano: fileSize(file.size),
        expedienteId: caseId,
        subidoPor: by,
        mimeType: file.type || 'application/octet-stream',
        contenido,
      })),
      map(mapDocument),
      tap((doc) => this._documents.update((list) => [doc, ...list.filter((d) => d.id !== doc.id)])),
    );
  }

  /** Descarga real del documento (stream binario con permisos verificados en el backend). */
  download(doc: LegalDocument): Observable<Blob> {
    return this.api.getBlob(`documents/${doc.id}/download`).pipe(
      tap((blob) => downloadBlob(blob, doc.name)),
    );
  }

  /** Inserta en vivo (Socket.IO) un documento recién creado, sin recargar. */
  addRealtime(dto: ApiDocument): void {
    const doc = mapDocument(dto);
    this._documents.update((list) =>
      list.some((d) => d.id === doc.id) ? list : [doc, ...list]);
  }

  /**
   * Alta de abogado. Devuelve el Observable para que la página reaccione al
   * resultado HTTP: en éxito actualiza la lista de forma optimista y refresca
   * desde el backend (refetch de seguridad); en error propaga para mostrar el
   * mensaje real de la API. El backend genera una contraseña temporal segura y
   * la envía al abogado por correo (onboarding), por lo que NO se envía aquí.
   */
  addLawyer(data: LawyerInput): Observable<User> {
    return this.api.post<ApiUser>('users', {
      nombre: data.nombre,
      correo: data.correo,
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
