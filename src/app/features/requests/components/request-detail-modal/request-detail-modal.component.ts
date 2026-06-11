import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { LegalRequest } from '@core/models';

@Component({
  selector: 'app-request-detail-modal',
  standalone: true,
  imports: [ModalComponent, PriorityChipComponent, ChipComponent],
  templateUrl: './request-detail-modal.component.html',
})
export class RequestDetailModalComponent {
  @Input({ required: true }) request!: LegalRequest;
  @Output() close = new EventEmitter<void>();

  estadoKind(estado: LegalRequest['estado']): 'c-gray' | 'c-green' | 'c-red' {
    return estado === 'Pendiente' ? 'c-gray' : estado === 'Aprobada' ? 'c-green' : 'c-red';
  }
}
