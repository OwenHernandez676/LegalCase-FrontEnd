import { EventType } from './enums';
export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  day: number;
  /** Mes del evento (1-12), año 2026. */
  month: number;
  time: string;
  color: string;
  caseId?: string;
}
