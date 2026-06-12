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
import { CaseActivityType, FileType, LegalCase } from '@core/models';
import { CaseKanbanComponent } from '../case-kanban/case-kanban.component';

type Tab = 'timeline' | 'docs' | 'kanban';

const ACTIVITY_META: Record<CaseActivityType, { icon: any; color: string }> = {
  observacion: { icon: 'msg', color: '#6B5599' },
  documento: { icon: 'doc', color: '#2E6CA8' },
  estado: { icon: 'flag', color: '#C07E25' },
  evento: { icon: 'cal', color: '#BB4138' },
  creacion: { icon: 'check', color: '#2C7A57' },
};

const EXT_MAP: Record<string, FileType> = {
  pdf: 'PDF', docx: 'DOCX', doc: 'DOCX', xlsx: 'XLSX', xls: 'XLSX',
  png: 'IMG', jpg: 'IMG', jpeg: 'IMG', gif: 'IMG', webp: 'IMG',
};

/**
 * Centro operativo del expediente: línea de tiempo, documentos y kanban.
 * Con editable=false (portal del cliente) toda la información es visible
 * pero sin acciones de edición.
 */
@Component({
  selector: 'app-case-detail-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent, StatusChipComponent, PriorityChipComponent, CaseKanbanComponent],
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

  /** Línea de tiempo del expediente desde la fuente central de actividad. */
  readonly timeline = computed(() => {
    this.activity.items(); // dependencia reactiva
    return this.activity.byCase(this.case.id);
  });

  meta(tipo: CaseActivityType): { icon: any; color: string } { return ACTIVITY_META[tipo]; }

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
    const ext = EXT_MAP[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'OTRO';
    const size = file.size >= 1_048_576
      ? (file.size / 1_048_576).toFixed(1) + ' MB'
      : Math.max(1, Math.round(file.size / 1024)) + ' KB';

    this.catalog.addDocument({ name: file.name, ext, size, caseId: this.case.id, by: autor });
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
