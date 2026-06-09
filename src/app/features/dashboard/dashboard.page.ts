import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { AuthStore } from '@core/store/auth.store';
import { CasesService } from '@core/services/cases.service';
import { RequestsService } from '@core/services/requests.service';
import { CatalogService } from '@core/services/catalog.service';
import { MOCK_ACTIVITY } from '@core/services/mock-data';

@Component({
  selector: 'lex-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeadComponent, PanelComponent, KpiCardComponent, AvatarComponent,
            IconComponent, StatusChipComponent, PriorityChipComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly auth = inject(AuthStore);
  readonly cases = inject(CasesService);
  readonly requests = inject(RequestsService);
  readonly catalog = inject(CatalogService);

  readonly role = this.auth.role;
  readonly activity = MOCK_ACTIVITY;
  readonly recentCases = computed(() => this.cases.cases().slice(0, 4));
  readonly recentRequests = computed(() => this.requests.requests().slice(0, 4));
  readonly events = computed(() => this.catalog.events().slice(0, 5));
  readonly clientCase = computed(() => this.cases.cases()[1]);

  renderActivity(text: string): string { return text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
}
