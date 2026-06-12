import { Component, Input, computed, inject, signal } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { CasesService } from '@core/services/cases.service';
import { CaseActivityService } from '@core/services/case-activity.service';
import { CaseTasksService } from '@core/services/case-tasks.service';
import { NotificationService } from '@core/services/notification.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@core/store/auth.store';
import { CaseStatus, CaseTask, LegalCase } from '@core/models';

/** Qué se está arrastrando: la tarjeta del expediente o una tarjeta de tarea. */
type DragItem = { kind: 'case' } | { kind: 'task'; id: string };

/**
 * Tablero Kanban propio de un expediente. La tarjeta dorada representa el
 * expediente (moverla cambia el estado del caso); las demás son tarjetas de
 * trabajo que el abogado puede crear, renombrar, mover y eliminar. Todo cambio
 * de columna queda en la línea de tiempo. Con editable=false es solo lectura.
 */
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
  private readonly tasksSvc = inject(CaseTasksService);
  private readonly notifs = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthStore);

  readonly columns: { key: CaseStatus; color: string }[] = [
    { key: 'Pendiente', color: '#9AA3B0' },
    { key: 'En proceso', color: '#2E6CA8' },
    { key: 'En revisión', color: '#C07E25' },
    { key: 'Finalizado', color: '#2C7A57' },
  ];

  /** Expediente leído en vivo del store para reflejar cambios de estado al instante. */
  readonly liveCase = computed<LegalCase | undefined>(() =>
    this.cases.cases().find((c) => c.id === this.caseId));

  readonly tasks = computed(() => {
    this.tasksSvc.tasks(); // dependencia reactiva
    return this.tasksSvc.byCase(this.caseId);
  });

  tasksIn(estado: CaseStatus): CaseTask[] {
    return this.tasks().filter((t) => t.estado === estado);
  }

  private get autor(): string { return this.auth.user()?.nombre ?? 'Sistema'; }

  // ---- drag & drop ----
  readonly dragging = signal<DragItem | null>(null);
  readonly overCol = signal<CaseStatus | null>(null);

  onDragCase(): void { if (this.editable) this.dragging.set({ kind: 'case' }); }
  onDragTask(t: CaseTask): void { if (this.editable) this.dragging.set({ kind: 'task', id: t.id }); }
  onDragEnd(): void { this.dragging.set(null); this.overCol.set(null); }
  onDragOver(ev: DragEvent, status: CaseStatus): void {
    if (!this.editable || !this.dragging()) return;
    ev.preventDefault();
    this.overCol.set(status);
  }

  onDrop(status: CaseStatus): void {
    const drag = this.dragging();
    if (!this.editable || !drag) { this.onDragEnd(); return; }
    if (drag.kind === 'case') this.moveCase(status);
    else this.tasksSvc.move(drag.id, status, this.autor);
    this.onDragEnd();
  }

  private moveCase(status: CaseStatus): void {
    const c = this.liveCase();
    if (!c || c.estado === status) return;
    const prev = c.estado;
    this.cases.updateStatus(c.id, status);
    this.activity.log({
      caseId: c.id, tipo: 'estado',
      titulo: 'Estado actualizado',
      detalle: `El expediente pasó de ${prev} a ${status}.`,
      autor: this.autor,
    });
    this.notifs.push({
      tipo: 'estado',
      mensaje: `${c.id} pasó de ${prev} a ${status}`,
      icon: 'flag', route: '/app/cases',
    });
    this.toast.show({ title: 'Estado actualizado', msg: `${c.id} → ${status}`, tone: 'gold' });
  }

  // ---- crear tarjeta ----
  readonly addingIn = signal<CaseStatus | null>(null);
  startAdd(col: CaseStatus): void { this.addingIn.set(col); }
  cancelAdd(): void { this.addingIn.set(null); }

  confirmAdd(titulo: string): void {
    const col = this.addingIn();
    const text = titulo.trim();
    if (!col || !text) { this.cancelAdd(); return; }
    this.tasksSvc.add(this.caseId, text, col, this.autor);
    this.toast.show({ title: 'Tarjeta agregada', msg: text, tone: 'success' });
    this.cancelAdd();
  }

  // ---- renombrar tarjeta ----
  readonly editingId = signal<string | null>(null);
  startEdit(t: CaseTask): void { this.editingId.set(t.id); }
  cancelEdit(): void { this.editingId.set(null); }

  confirmEdit(t: CaseTask, titulo: string): void {
    const text = titulo.trim();
    if (text && text !== t.titulo) {
      this.tasksSvc.rename(t.id, text);
      this.toast.show({ title: 'Tarjeta actualizada', msg: text, tone: 'success' });
    }
    this.cancelEdit();
  }

  // ---- eliminar tarjeta ----
  removeTask(t: CaseTask): void {
    this.tasksSvc.remove(t.id);
    this.toast.show({ title: 'Tarjeta eliminada', msg: t.titulo, tone: 'warn' });
  }
}
