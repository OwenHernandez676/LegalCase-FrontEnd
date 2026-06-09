import { Component, inject, computed } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';

import { CatalogService } from '@core/services/catalog.service';
import { CalendarEvent } from '@core/models';

@Component({
  selector: 'lex-calendar',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent],
  templateUrl: './calendar.page.html',
})
export class CalendarPage {
  private readonly catalog = inject(CatalogService);
  readonly events = this.catalog.events;
  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
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
}
