import { Component, inject, signal, computed } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { CasesService } from '@core/services/cases.service';
import { CaseStatus } from '@core/models';

@Component({
  selector: 'lex-cases',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, AvatarComponent, IconComponent, StatusChipComponent, PriorityChipComponent],
  templateUrl: './cases.page.html',
})
export class CasesPage {
  private readonly svc = inject(CasesService);
  readonly statuses: (CaseStatus | 'Todos')[] = ['Todos', 'Pendiente', 'En proceso', 'En revisión', 'Finalizado'];
  readonly status = signal<CaseStatus | 'Todos'>('Todos');
  readonly query = signal('');

  readonly list = computed(() => {
    const q = this.query().toLowerCase();
    const st = this.status();
    return this.svc.cases().filter((c) =>
      (st === 'Todos' || c.estado === st) &&
      (c.titulo.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q)));
  });

  setStatus(s: CaseStatus | 'Todos'): void { this.status.set(s); }
  onSearch(v: string): void { this.query.set(v); }
}
