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
import { LegalCase, LegalDocument } from '@core/models';
import { apiErrorMessage } from '@core/utils/http-error.util';
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

  /**
   * Solo el abogado puede operar el expediente: agregar actualizaciones a la
   * línea de tiempo, subir documentos y usar el tablero Kanban. El administrador
   * y el cliente lo ven en modo lectura.
   */
  readonly isLawyer = computed(() => this.auth.role() === 'abogado');

  /** Estado leído en vivo: el kanban puede cambiarlo mientras el modal está abierto. */
  readonly liveCase = computed(() =>
    this.cases.cases().find((c) => c.id === this.case.id) ?? this.case);

  readonly documents = computed(() =>
    this.catalog.documents().filter((d) => d.caseId === this.case.id));

  // ---- Nueva observación ----
  readonly showNoteForm = signal(false);
  note = '';

  toggleNoteForm(): void { this.showNoteForm.update((v) => !v); this.note = ''; }

  /** Código visible del expediente (EXP-####) para mensajes y avisos. */
  private get codigo(): string { return this.case.codigo ?? this.case.id; }

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
      mensaje: `${autor} agregó una actualización en ${this.codigo}`,
      icon: 'msg', route: '/app/cases',
    });
    this.toast.show({ title: 'Actualización registrada', msg: this.codigo, tone: 'success' });
    this.toggleNoteForm();
  }

  // ---- Subir documento (contenido real, descargable) ----
  onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    const autor = this.auth.user()?.nombre ?? 'Abogado';
    this.catalog.uploadDocument(this.case.id, autor, file).subscribe({
      next: () => {
        this.activity.log({
          caseId: this.case.id, tipo: 'documento',
          titulo: 'Documento agregado al expediente', detalle: `"${file.name}"`, autor,
        });
        this.toast.show({ title: 'Documento subido', msg: file.name, tone: 'success' });
      },
      error: (e) => this.toast.show({ title: 'No se pudo subir el documento', msg: apiErrorMessage(e), tone: 'warn' }),
    });
    input.value = '';
  }

  /** Descarga real del documento (binario con permisos verificados en el backend). */
  download(doc: LegalDocument): void {
    this.catalog.download(doc).subscribe({
      error: (e) => this.toast.show({ title: 'No se pudo descargar', msg: apiErrorMessage(e), tone: 'warn' }),
    });
  }
}
