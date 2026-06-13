import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { CatalogService } from '@core/services/catalog.service';
import { LegalRequest, Priority } from '@core/models';

export interface AssignResult {
  lawyerId: string;
  lawyerName: string;
  prioridad: Priority;
  observaciones: string;
}

@Component({
  selector: 'app-assign-lawyer-modal',
  standalone: true,
  imports: [ModalComponent, AvatarComponent],
  templateUrl: './assign-lawyer-modal.component.html',
})
export class AssignLawyerModalComponent {
  @Input({ required: true }) request!: LegalRequest;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<AssignResult>();

  private readonly catalog = inject(CatalogService);

  /** Solo abogados activos pueden recibir asignaciones. */
  readonly lawyers = this.catalog.activeLawyers;
  readonly priorities: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

  readonly selectedLawyer = signal<string | null>(null);
  readonly priority = signal<Priority>('Media');
  observaciones = '';

  selectLawyer(id: string): void { this.selectedLawyer.set(id); }
  setPriority(p: Priority): void { this.priority.set(p); }

  submit(): void {
    const id = this.selectedLawyer();
    if (!id) return;
    const lawyer = this.lawyers().find((l) => l.id === id);
    this.create.emit({
      lawyerId: id,
      lawyerName: lawyer?.nombre ?? '',
      prioridad: this.priority(),
      observaciones: this.observaciones.trim(),
    });
  }
}
