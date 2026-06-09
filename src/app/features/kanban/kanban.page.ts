import { Component, inject, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { CasesService } from '@core/services/cases.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { CaseStatus, LegalCase } from '@core/models';

@Component({
  selector: 'lex-kanban',
  standalone: true,
  imports: [PageHeadComponent, AvatarComponent, IconComponent, PriorityChipComponent],
  templateUrl: './kanban.page.html',
})
export class KanbanPage {
  private readonly svc = inject(CasesService);
  private readonly toast = inject(ToastService);

  readonly columns: { key: CaseStatus; color: string }[] = [
    { key: 'Pendiente', color: '#9AA3B0' },
    { key: 'En proceso', color: '#2E6CA8' },
    { key: 'En revisión', color: '#C07E25' },
    { key: 'Finalizado', color: '#2C7A57' },
  ];
  readonly cases = this.svc.cases;
  readonly dragging = signal<LegalCase | null>(null);
  readonly overCol = signal<CaseStatus | null>(null);

  colCases(status: CaseStatus): LegalCase[] { return this.cases().filter((c) => c.estado === status); }
  onDragStart(c: LegalCase): void { this.dragging.set(c); }
  onDragEnd(): void { this.dragging.set(null); this.overCol.set(null); }
  onDragOver(ev: DragEvent, status: CaseStatus): void { ev.preventDefault(); this.overCol.set(status); }
  onDrop(status: CaseStatus): void {
    const c = this.dragging();
    if (c && c.estado !== status) {
      this.svc.updateStatus(c.id, status);
      this.toast.show({ title: 'Caso movido', msg: `${c.id} → ${status}`, tone: 'gold' });
    }
    this.onDragEnd();
  }
}
