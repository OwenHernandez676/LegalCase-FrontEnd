import { Component, inject, computed } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { CasesService } from '@core/services/cases.service';
import { CaseStatus, CaseType } from '@core/models';

@Component({
  selector: 'lex-reports',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, KpiCardComponent],
  templateUrl: './reports.page.html',
})
export class ReportsPage {
  readonly svc = inject(CasesService);

  readonly byStatus = computed(() => {
    const states: CaseStatus[] = ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'];
    const colors = ['#9AA3B0', '#2E6CA8', '#C07E25', '#2C7A57'];
    const total = this.svc.total() || 1;
    return states.map((s, i) => {
      const n = this.svc.byStatus(s).length;
      return { label: s, n, pct: Math.round((n / total) * 100), color: colors[i] };
    });
  });
  readonly byType = computed(() => {
    const map = new Map<CaseType, number>();
    for (const c of this.svc.cases()) map.set(c.tipo, (map.get(c.tipo) ?? 0) + 1);
    const max = Math.max(...map.values(), 1);
    return [...map.entries()].map(([tipo, n]) => ({ tipo, n, pct: Math.round((n / max) * 100) }));
  });
}
