import { Injectable, signal } from '@angular/core';
import { CalendarEvent, LegalDocument, User } from '../models';
import { MOCK_DOCS, MOCK_EVENTS, MOCK_LAWYERS } from './mock-data';

/** Catálogos de apoyo (documentos, eventos, abogados) expuestos como signals. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly documents = signal<LegalDocument[]>(MOCK_DOCS).asReadonly();
  readonly events = signal<CalendarEvent[]>(MOCK_EVENTS).asReadonly();
  readonly lawyers = signal<User[]>(MOCK_LAWYERS).asReadonly();
}
