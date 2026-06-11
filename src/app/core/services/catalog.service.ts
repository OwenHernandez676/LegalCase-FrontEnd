import { Injectable, signal, computed } from '@angular/core';
import { CalendarEvent, LegalDocument, User } from '../models';
import { MOCK_DOCS, MOCK_EVENTS, MOCK_LAWYERS } from './mock-data';

/** Datos que recibe el formulario de alta/edición de abogados. */
export interface LawyerInput {
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
}

/** Catálogos de apoyo (documentos, eventos, abogados) expuestos como signals. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly documents = signal<LegalDocument[]>(MOCK_DOCS).asReadonly();
  readonly events = signal<CalendarEvent[]>(MOCK_EVENTS).asReadonly();

  private readonly _lawyers = signal<User[]>(MOCK_LAWYERS);
  readonly lawyers = this._lawyers.asReadonly();
  /** Solo abogados activos: los únicos que pueden recibir asignaciones. */
  readonly activeLawyers = computed(() => this._lawyers().filter((l) => l.activo));

  addLawyer(data: LawyerInput): void {
    const nuevo: User = {
      id: 'l-' + Date.now(),
      rol: 'abogado',
      casos: 0,
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      especialidad: data.especialidad,
      activo: data.activo,
    };
    this._lawyers.update((list) => [nuevo, ...list]);
  }

  updateLawyer(id: string, data: LawyerInput): void {
    this._lawyers.update((list) =>
      list.map((l) => (l.id === id ? { ...l, ...data } : l)),
    );
  }

  setLawyerActive(id: string, activo: boolean): void {
    this._lawyers.update((list) => list.map((l) => (l.id === id ? { ...l, activo } : l)));
  }
}
