import { Component, inject, computed, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { EventsService, EventInput, MONTHS_ES, monthShort } from '@core/services/events.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@core/store/auth.store';
import { CalendarEvent } from '@core/models';
import { EventFormModalComponent } from './components/event-form-modal/event-form-modal.component';

const YEAR = 2026;

@Component({
  selector: 'lex-calendar',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, IconComponent, EventFormModalComponent],
  templateUrl: './calendar.page.html',
})
export class CalendarPage {
  private readonly eventsSvc = inject(EventsService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthStore);

  readonly events = this.eventsSvc.events;
  readonly upcoming = this.eventsSvc.upcoming;
  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  /** El cliente solo visualiza; abogado y administrador gestionan eventos. */
  readonly canEdit = computed(() => this.auth.role() !== 'cliente');
  readonly showForm = signal(false);

  /** Mes visible (1-12), año fijo 2026. */
  readonly month = signal(5);
  readonly monthLabel = computed(() => `${MONTHS_ES[this.month() - 1]} ${YEAR}`);

  prevMonth(): void { this.month.update((m) => (m === 1 ? 12 : m - 1)); }
  nextMonth(): void { this.month.update((m) => (m === 12 ? 1 : m + 1)); }

  /** Celdas del mes visible: huecos iniciales (semana inicia lunes) + días reales. */
  readonly cells = computed(() => {
    const m = this.month();
    const offset = (new Date(YEAR, m - 1, 1).getDay() + 6) % 7;
    const days = new Date(YEAR, m, 0).getDate();
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    return arr;
  });

  eventsOn(day: number | null): CalendarEvent[] {
    return day
      ? this.events().filter((e) => e.month === this.month() && e.day === day)
      : [];
  }

  monthShort(m: number): string { return monthShort(m); }

  openForm(): void { this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  onSave(data: EventInput): void {
    this.eventsSvc.add(data, this.auth.user()?.nombre ?? 'Usuario');
    this.toast.show({ title: 'Evento creado', msg: data.title, tone: 'success' });
    this.month.set(data.month);
    this.closeForm();
  }

  remove(e: CalendarEvent): void {
    this.eventsSvc.remove(e.id);
    this.toast.show({ title: 'Evento eliminado', msg: e.title, tone: 'warn' });
  }
}
