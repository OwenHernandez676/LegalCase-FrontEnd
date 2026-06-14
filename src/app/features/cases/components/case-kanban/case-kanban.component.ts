import { Component, computed, inject, input, signal } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { CasesService } from '@core/services/cases.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { CaseStatus, LegalCase } from '@core/models';

/**
 * Tablero Kanban del ESTADO de un expediente (ya no de tareas individuales).
 * El expediente aparece como una sola tarjeta en la columna de su estado actual.
 * - editable=true (abogado): arrastra el expediente entre columnas para cambiar
 *   su estado; el cambio se persiste en MongoDB (PATCH /cases/:id/status) y se
 *   refleja al instante en la tabla, el modal y el dashboard.
 * - editable=false (cliente/administrador): solo lectura del avance.
 */
@Component({
  selector: 'app-case-kanban',
  standalone: true,
  imports: [IconComponent, PriorityChipComponent],
  templateUrl: './case-kanban.component.html',
  styleUrl: './case-kanban.component.scss',
})
export class CaseKanbanComponent {
  readonly caseId = input.required<string>();
  readonly editable = input(true);

  private readonly cases = inject(CasesService);
  private readonly toast = inject(ToastService);

  readonly columns: { key: CaseStatus; color: string }[] = [
    { key: 'Pendiente', color: '#9AA3B0' },
    { key: 'En proceso', color: '#2E6CA8' },
    { key: 'En revisión', color: '#C07E25' },
    { key: 'Finalizado', color: '#2C7A57' },
  ];

  /** Expediente vivo desde el store (reacciona a cambios en tiempo real). */
  readonly theCase = computed<LegalCase | undefined>(() =>
    this.cases.cases().find((c) => c.id === this.caseId()));

  /** La tarjeta del expediente solo aparece en la columna de su estado actual. */
  inCol(status: CaseStatus): LegalCase | null {
    const c = this.theCase();
    return c && c.estado === status ? c : null;
  }

  // ---- Drag & drop entre estados ----
  readonly dragging = signal(false);
  readonly overCol = signal<CaseStatus | null>(null);

  onDragStart(): void { if (this.editable()) this.dragging.set(true); }
  onDragEnd(): void { this.dragging.set(false); this.overCol.set(null); }
  onDragOver(ev: DragEvent, status: CaseStatus): void {
    if (!this.editable() || !this.dragging()) return;
    ev.preventDefault();
    this.overCol.set(status);
  }
  onDrop(status: CaseStatus): void {
    const c = this.theCase();
    if (this.editable() && c && c.estado !== status) {
      this.cases.updateStatus(c.id, status);
      this.toast.show({ title: 'Estado actualizado', msg: `${c.codigo || c.id} → ${status}`, tone: 'success' });
    }
    this.onDragEnd();
  }
}
