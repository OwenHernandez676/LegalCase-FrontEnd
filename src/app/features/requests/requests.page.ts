import { Component, inject, signal, computed } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { RequestsService } from '@core/services/requests.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { RequestStatus } from '@core/models';

@Component({
  selector: 'lex-requests',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, AvatarComponent, IconComponent, PriorityChipComponent, ChipComponent],
  templateUrl: './requests.page.html',
})
export class RequestsPage {
  private readonly svc = inject(RequestsService);
  private readonly toast = inject(ToastService);

  readonly filters: (RequestStatus | 'Todas')[] = ['Todas', 'Pendiente', 'Aprobada', 'Rechazada'];
  readonly filter = signal<RequestStatus | 'Todas'>('Todas');
  readonly list = computed(() => this.svc.byStatus(this.filter()));

  setFilter(f: RequestStatus | 'Todas'): void { this.filter.set(f); }

  chipKind(estado: RequestStatus): any {
    return estado === 'Pendiente' ? 'c-gray' : estado === 'Aprobada' ? 'c-green' : 'c-red';
  }
  approve(id: string): void { this.svc.resolve(id, 'Aprobada'); this.toast.show({ title: 'Solicitud aprobada', msg: id + ' · expediente creado', tone: 'success' }); }
  reject(id: string): void { this.svc.resolve(id, 'Rechazada'); this.toast.show({ title: 'Solicitud rechazada', msg: id, tone: 'warn' }); }
}
