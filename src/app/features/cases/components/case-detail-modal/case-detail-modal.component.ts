import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { CatalogService } from '@core/services/catalog.service';
import { CasesService } from '@core/services/cases.service';
import { CaseActivityService } from '@core/services/case-activity.service';
import { NotificationService } from '@core/services/notification.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@core/store/auth.store';
import { LegalCase } from '@core/models';
import { fileExt, fileSize } from '@core/utils/file.util';
import { CaseKanbanComponent } from '../case-kanban/case-kanban.component';
import { CaseTimelineComponent } from '../case-timeline/case-timeline.component';

type Tab = 'timeline' | 'docs' | 'kanban';

/**
 * Centro operativo del expediente: línea de tiempo, documentos y kanban.
 * Con editable=false (portal del cliente) toda la información es visible
 * pero sin acciones de edición.
 */
@Component({
  selector: 'app-case-detail-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent, StatusChipComponent, PriorityChipComponent,
            CaseKanbanComponent, CaseTimelineComponent],
  templateUrl: './case-detail-modal.component.html',
})
export class CaseDetailModalComponent {
  @Input({ required: true }) case!: LegalCase;
  @Input() editable = true;
  @Output() close = new EventEmitter<void>();

  private readonly catalog = inject(CatalogService);
  private readonly cases = inject(CasesService);
  private readonly activity = inject(CaseActivityService);
  private readonly notifs = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthStore);

  readonly tab = signal<Tab>('timeline');
  setTab(t: Tab): void { this.tab.set(t); }

  /** Estado leído en vivo: el kanban puede cambiarlo mientras el modal está abierto. */
  readonly liveCase = computed(() =>
    this.cases.cases().find((c) => c.id === this.case.id) ?? this.case);

  readonly documents = computed(() =>
    this.catalog.documents().filter((d) => d.caseId === this.case.id));

  // ---- Nueva observación ----
  readonly showNoteForm = signal(false);
  note = '';

  toggleNoteForm(): void { this.showNoteForm.update((v) => !v); this.note = ''; }

  saveNote(): void {
    const text = this.note.trim();
    if (!text) return;
    const autor = this.auth.user()?.nombre ?? 'Abogado';
    this.activity.log({
      caseId: this.case.id, tipo: 'observacion',
      titulo: 'Observación del abogado', detalle: text, autor,
    });
    this.notifs.push({
      tipo: 'comentario',
      mensaje: `${autor} agregó una actualización en ${this.case.id}`,
      icon: 'msg', route: '/app/cases',
    });
    this.toast.show({ title: 'Actualización registrada', msg: this.case.id, tone: 'success' });
    this.toggleNoteForm();
  }

  // ---- Subir documento ----
  onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    const autor = this.auth.user()?.nombre ?? 'Abogado';
    this.catalog.addDocument({
      name: file.name, ext: fileExt(file.name), size: fileSize(file.size),
      caseId: this.case.id, by: autor,
    });
    this.activity.log({
      caseId: this.case.id, tipo: 'documento',
      titulo: 'Documento agregado al expediente', detalle: `"${file.name}"`, autor,
    });
    this.notifs.push({
      tipo: 'documento',
      mensaje: `${autor} subió "${file.name}" a ${this.case.id}`,
      icon: 'doc', route: '/app/cases',
    });
    this.toast.show({ title: 'Documento subido', msg: file.name, tone: 'success' });
    input.value = '';
  }
}
