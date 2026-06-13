import { Component, Input, computed, inject, signal } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { TasksService, TaskInput } from '@core/services/tasks.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { apiErrorMessage } from '@core/utils/http-error.util';
import { CaseStatus, LegalTask, Priority } from '@core/models';

/**
 * Tablero Kanban de TAREAS de un expediente (persistidas en backend).
 * - editable=true (abogado): crear, editar, eliminar y mover tareas entre columnas.
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
  @Input({ required: true }) caseId!: string;
  @Input() editable = true;

  private readonly tasks = inject(TasksService);
  private readonly toast = inject(ToastService);

  readonly columns: { key: CaseStatus; color: string }[] = [
    { key: 'Pendiente', color: '#9AA3B0' },
    { key: 'En proceso', color: '#2E6CA8' },
    { key: 'En revisión', color: '#C07E25' },
    { key: 'Finalizado', color: '#2C7A57' },
  ];
  readonly priorities: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

  /** Tareas del expediente (dispara la carga la primera vez). */
  readonly all = computed(() => this.tasks.byCase(this.caseId));
  byCol(status: CaseStatus): LegalTask[] { return this.all().filter((t) => t.estado === status); }

  // ---- Drag & drop ----
  readonly draggingId = signal<string | null>(null);
  readonly overCol = signal<CaseStatus | null>(null);

  onDragStart(id: string): void { if (this.editable) this.draggingId.set(id); }
  onDragEnd(): void { this.draggingId.set(null); this.overCol.set(null); }
  onDragOver(ev: DragEvent, status: CaseStatus): void {
    if (!this.editable || !this.draggingId()) return;
    ev.preventDefault();
    this.overCol.set(status);
  }
  onDrop(status: CaseStatus): void {
    const id = this.draggingId();
    if (this.editable && id) this.tasks.move(id, status);
    this.onDragEnd();
  }

  // ---- Crear / editar ----
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  form: TaskInput = this.empty();

  private empty(): TaskInput { return { titulo: '', descripcion: '', prioridad: 'Media', fechaLimite: '', estado: 'Pendiente' }; }

  openNew(): void { this.editingId.set(null); this.form = this.empty(); this.showForm.set(true); }
  openEdit(t: LegalTask): void {
    this.editingId.set(t.id);
    this.form = { titulo: t.titulo, descripcion: t.descripcion, prioridad: t.prioridad, fechaLimite: t.fechaLimite?.slice(0, 10) || '', estado: t.estado };
    this.showForm.set(true);
  }
  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); }

  save(): void {
    const titulo = this.form.titulo.trim();
    if (!titulo) { this.toast.show({ title: 'El título es obligatorio', tone: 'warn' }); return; }
    const id = this.editingId();
    const op$ = id ? this.tasks.update(id, this.form) : this.tasks.create(this.caseId, this.form);
    op$.subscribe({
      next: () => { this.toast.show({ title: id ? 'Tarea actualizada' : 'Tarea creada', tone: 'success' }); this.cancelForm(); },
      error: (e) => this.toast.show({ title: 'No se pudo guardar la tarea', msg: apiErrorMessage(e), tone: 'warn' }),
    });
  }

  remove(t: LegalTask): void {
    this.tasks.remove(t.id).subscribe({
      next: () => this.toast.show({ title: 'Tarea eliminada', msg: t.titulo, tone: 'warn' }),
      error: (e) => this.toast.show({ title: 'No se pudo eliminar', msg: apiErrorMessage(e), tone: 'warn' }),
    });
  }

  /** Fecha límite legible (dd mmm) o vacío. */
  fmtDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
  }
}
