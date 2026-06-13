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
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'lex-requests',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, KpiCardComponent, AvatarComponent, IconComponent,
            PriorityChipComponent, ChipComponent, RequestDetailModalComponent, AssignLawyerModalComponent,
            ModalComponent],
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
  readonly rejecting = signal<LegalRequest | null>(null);
  rejectMotivo = '';

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
    // Envía el abogado y la prioridad: el backend crea la cuenta del cliente,
    // el expediente asignado y envía el correo de bienvenida con sus credenciales.
    this.svc.resolve(req.id, 'Aprobada', { abogado: result.lawyerName, prioridad: result.prioridad });
    this.toast.show({
      title: 'Solicitud aprobada',
      msg: `Cuenta de cliente creada y credenciales enviadas a ${req.correo}`,
      tone: 'success',
    });
    this.closeApprove();
  }

  openReject(r: LegalRequest): void { this.rejectMotivo = ''; this.rejecting.set(r); }
  closeReject(): void { this.rejecting.set(null); }

  confirmReject(): void {
    const r = this.rejecting();
    if (!r) return;
    this.svc.resolve(r.id, 'Rechazada', { motivo: this.rejectMotivo });
    this.toast.show({ title: 'Solicitud rechazada', msg: r.codigo ?? r.id, tone: 'warn' });
    this.closeReject();
  }
}
