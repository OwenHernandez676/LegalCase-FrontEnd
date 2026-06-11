import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { AuthStore } from '@core/store/auth.store';
import { CasesService } from '@core/services/cases.service';
import { RequestsService } from '@core/services/requests.service';
import { CatalogService } from '@core/services/catalog.service';
import { Priority, RequestStatus } from '@core/models';

const PRIORITY_DEFS: { label: Priority; color: string }[] = [
  { label: 'Crítica', color: '#6B5599' },
  { label: 'Alta', color: '#BB4138' },
  { label: 'Media', color: '#C07E25' },
  { label: 'Baja', color: '#2E6CA8' },
];
const DONUT_R = 54;
const DONUT_C = 2 * Math.PI * DONUT_R;

@Component({
  selector: 'lex-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeadComponent, PanelComponent, KpiCardComponent, AvatarComponent,
            IconComponent, StatusChipComponent, PriorityChipComponent, ChipComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly auth = inject(AuthStore);
  readonly cases = inject(CasesService);
  readonly requests = inject(RequestsService);
  readonly catalog = inject(CatalogService);

  readonly role = this.auth.role;
  readonly recentCases = computed(() => this.cases.cases().slice(0, 4));
  readonly recentRequests = computed(() => this.requests.requests().slice(0, 4));
  readonly events = computed(() => this.catalog.events().slice(0, 5));
  readonly clientCase = computed(() => this.cases.cases()[1]);

  /** Abogados activos con su carga de casos, para el panel "Ocupación de abogados". */
  readonly lawyerLoad = computed(() => this.catalog.activeLawyers());

  /** Color de chip para el estado de una solicitud (no de un caso). */
  reqChipKind(estado: RequestStatus): 'c-gray' | 'c-green' | 'c-red' {
    return estado === 'Pendiente' ? 'c-gray' : estado === 'Aprobada' ? 'c-green' : 'c-red';
  }

  /** Distribución de expedientes por prioridad para el gráfico de dona. */
  readonly priorityDist = computed(() => {
    const all = this.cases.cases();
    const total = all.length || 1;
    let acc = 0;
    return PRIORITY_DEFS.map((d) => {
      const value = all.filter((c) => c.prioridad === d.label).length;
      const len = (value / total) * DONUT_C;
      const seg = { ...d, value, dash: `${len} ${DONUT_C - len}`, offset: -acc };
      acc += len;
      return seg;
    });
  });
}
