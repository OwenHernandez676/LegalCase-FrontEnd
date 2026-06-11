import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { CatalogService } from '@core/services/catalog.service';
import { LegalCase } from '@core/models';

interface TimelineEntry {
  title: string;
  desc: string;
  time: string;
  icon: 'flag' | 'doc' | 'msg' | 'user' | 'check';
  color: string;
}

type Tab = 'timeline' | 'docs';

/**
 * Modal de detalle de expediente con pestañas de Línea de tiempo y Documentos.
 * Recibe el expediente por input, por lo que puede reutilizarse en las vistas
 * de Cliente y Abogado sin cambios.
 */
@Component({
  selector: 'app-case-detail-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent, StatusChipComponent, PriorityChipComponent],
  templateUrl: './case-detail-modal.component.html',
})
export class CaseDetailModalComponent {
  @Input({ required: true }) case!: LegalCase;
  @Output() close = new EventEmitter<void>();

  private readonly catalog = inject(CatalogService);

  readonly tab = signal<Tab>('timeline');
  setTab(t: Tab): void { this.tab.set(t); }

  readonly documents = computed(() =>
    this.catalog.documents().filter((d) => d.caseId === this.case.id));

  /** Línea de tiempo mock derivada del expediente. */
  readonly timeline = computed<TimelineEntry[]>(() => {
    const c = this.case;
    return [
      { title: 'Prioridad actualizada a ' + c.prioridad, desc: 'El administrador ajustó la prioridad del caso.', time: 'Hace 2 días', icon: 'flag', color: '#C07E25' },
      { title: 'Documento agregado al expediente', desc: 'Se incorporó nueva documentación de respaldo.', time: 'Hace 4 días', icon: 'doc', color: '#2E6CA8' },
      { title: 'Observación del abogado', desc: 'Se registró una nota sobre el avance del caso.', time: 'Hace 1 semana', icon: 'msg', color: '#6B5599' },
      { title: 'Caso asignado a ' + c.abogado, desc: 'El expediente fue asignado al abogado responsable.', time: c.opened, icon: 'user', color: '#B68A33' },
      { title: 'Expediente creado', desc: 'Se aprobó la solicitud y se abrió el expediente.', time: c.opened, icon: 'check', color: '#2C7A57' },
    ];
  });
}
