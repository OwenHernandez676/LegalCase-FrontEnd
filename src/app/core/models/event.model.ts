import { EventType } from './enums';
export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  day: number;
  time: string;
  color: string;
  caseId?: string;
}
