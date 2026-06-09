import { Component, inject } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';

import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { CatalogService } from '@core/services/catalog.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'lex-users',
  standalone: true,
  imports: [PageHeadComponent, AvatarComponent, IconComponent, ChipComponent],
  templateUrl: './users.page.html',
})
export class UsersPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  readonly lawyers = this.catalog.lawyers;

  loadTone(v: number): any { return v >= 80 ? 'c-red' : v >= 60 ? 'c-gold' : 'c-green'; }
  add(): void { this.toast.show({ title: 'Nuevo usuario', msg: 'Demo: formulario de alta pendiente', tone: 'info' }); }
}
