import { Component, inject, computed, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { EventsService, EventInput } from '@core/services/events.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@core/store/auth.store';
import { CalendarEvent } from '@core/models';
import { EventFormModalComponent } from './components/event-form-modal/event-form-modal.component';

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

  // Mayo 2026 empieza un viernes (offset 4); 31 días.
  readonly cells = computed(() => {
    const offset = 4, days = 31;
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    return arr;
  });

  eventsOn(day: number | null): CalendarEvent[] {
    return day ? this.events().filter((e) => e.day === day) : [];
  }

  openForm(): void { this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  onSave(data: EventInput): void {
    this.eventsSvc.add(data, this.auth.user()?.nombre ?? 'Usuario');
    this.toast.show({ title: 'Evento creado', msg: data.title, tone: 'success' });
    this.closeForm();
  }

  remove(e: CalendarEvent): void {
    this.eventsSvc.remove(e.id);
    this.toast.show({ title: 'Evento eliminado', msg: e.title, tone: 'warn' });
  }
}
