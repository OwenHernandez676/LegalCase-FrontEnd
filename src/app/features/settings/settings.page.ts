import { Component, inject } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';

import { AuthStore } from '@core/store/auth.store';
import { UiStore } from '@core/store/ui.store';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'lex-settings',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, AvatarComponent],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  readonly auth = inject(AuthStore);
  readonly ui = inject(UiStore);
  private readonly toast = inject(ToastService);
  save(): void { this.toast.show({ title: 'Cambios guardados', tone: 'success' }); }
}
