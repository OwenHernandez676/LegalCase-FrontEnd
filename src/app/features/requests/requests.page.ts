import { Component, inject, signal, computed } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { RequestsService } from '@core/services/requests.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { LegalRequest, RequestStatus } from '@core/models';
import { RequestDetailModalComponent } from './components/request-detail-modal/request-detail-modal.component';
import { AssignLawyerModalComponent, AssignResult } from './components/assign-lawyer-modal/assign-lawyer-modal.component';

@Component({
  selector: 'lex-requests',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, KpiCardComponent, AvatarComponent, IconComponent,
            PriorityChipComponent, ChipComponent, RequestDetailModalComponent, AssignLawyerModalComponent],
  templateUrl: './requests.page.html',
})
export class RequestsPage {
  private readonly svc = inject(RequestsService);
  private readonly toast = inject(ToastService);

  readonly filters: (RequestStatus | 'Todas')[] = ['Todas', 'Pendiente', 'Aprobada', 'Rechazada'];
  readonly filter = signal<RequestStatus | 'Todas'>('Todas');
  readonly list = computed(() => this.svc.byStatus(this.filter()));

  readonly total = computed(() => this.svc.requests().length);
  readonly pendientes = computed(() => this.svc.byStatus('Pendiente').length);
  readonly aprobadas = computed(() => this.svc.byStatus('Aprobada').length);
  readonly rechazadas = computed(() => this.svc.byStatus('Rechazada').length);

  readonly viewing = signal<LegalRequest | null>(null);
  readonly approving = signal<LegalRequest | null>(null);

  setFilter(f: RequestStatus | 'Todas'): void { this.filter.set(f); }

  chipKind(estado: RequestStatus): 'c-gray' | 'c-green' | 'c-red' {
    return estado === 'Pendiente' ? 'c-gray' : estado === 'Aprobada' ? 'c-green' : 'c-red';
  }

  openDetail(r: LegalRequest): void { this.viewing.set(r); }
  closeDetail(): void { this.viewing.set(null); }

  openApprove(r: LegalRequest): void { this.approving.set(r); }
  closeApprove(): void { this.approving.set(null); }

  onCreateExpediente(result: AssignResult): void {
    const req = this.approving();
    if (!req) return;
    this.svc.resolve(req.id, 'Aprobada');
    this.toast.show({
      title: 'Expediente creado correctamente',
      msg: req.id + ' · ' + result.lawyerName,
      tone: 'success',
    });
    this.closeApprove();
  }

  reject(id: string): void {
    this.svc.resolve(id, 'Rechazada');
    this.toast.show({ title: 'Solicitud rechazada', msg: id, tone: 'warn' });
  }
}
