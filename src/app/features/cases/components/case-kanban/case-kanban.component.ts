import { Component, Input, computed, inject, signal } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { CasesService } from '@core/services/cases.service';
import { CaseActivityService } from '@core/services/case-activity.service';
import { NotificationService } from '@core/services/notification.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@core/store/auth.store';
import { CaseStatus, LegalCase } from '@core/models';

@Component({
  selector: 'app-case-kanban',
  standalone: true,
  imports: [IconComponent, PriorityChipComponent, AvatarComponent],
  templateUrl: './case-kanban.component.html',
  styleUrl: './case-kanban.component.scss',
})
export class CaseKanbanComponent {
  @Input({ required: true }) caseId!: string;
  @Input() editable = true;

  private readonly cases = inject(CasesService);
  private readonly activity = inject(CaseActivityService);
  private readonly notifs = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthStore);

  readonly columns: { key: CaseStatus; color: string }[] = [
    { key: 'Pendiente', color: '#9AA3B0' },
    { key: 'En proceso', color: '#2E6CA8' },
    { key: 'En revisión', color: '#C07E25' },
    { key: 'Finalizado', color: '#2C7A57' },
  ];

  readonly liveCase = computed<LegalCase | undefined>(() =>
    this.cases.cases().find((c) => c.id === this.caseId));

  private get autor(): string { return this.auth.user()?.nombre ?? 'Sistema'; }

  readonly dragging = signal(false);
  readonly overCol = signal<CaseStatus | null>(null);

  onDragCase(): void { if (this.editable) this.dragging.set(true); }
  onDragEnd(): void { this.dragging.set(false); this.overCol.set(null); }
  onDragOver(ev: DragEvent, status: CaseStatus): void {
    if (!this.editable || !this.dragging()) return;
    ev.preventDefault();
    this.overCol.set(status);
  }

  onDrop(status: CaseStatus): void {
    if (!this.editable || !this.dragging()) { this.onDragEnd(); return; }
    this.moveCase(status);
    this.onDragEnd();
  }

  private moveCase(status: CaseStatus): void {
    const c = this.liveCase();
    if (!c || c.estado === status) return;
    const prev = c.estado;
    const codigo = c.codigo ?? c.id;
    this.cases.updateStatus(c.id, status);
    this.activity.log({
      caseId: c.id, tipo: 'estado',
      titulo: 'Estado actualizado',
      detalle: `El expediente pasó de ${prev} a ${status}.`,
      autor: this.autor,
    });
    this.notifs.push({
      tipo: 'estado',
      mensaje: `${codigo} pasó de ${prev} a ${status}`,
      icon: 'flag', route: '/app/cases',
    });
    this.toast.show({ title: 'Estado actualizado', msg: `${codigo} → ${status}`, tone: 'gold' });
  }
}
