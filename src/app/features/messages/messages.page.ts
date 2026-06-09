import { Component, inject, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthStore } from '@core/store/auth.store';
import { ChatMessage } from '@core/models';
import { MOCK_CHAT } from '@core/services/mock-data';

@Component({
  selector: 'lex-messages',
  standalone: true,
  imports: [PageHeadComponent, AvatarComponent, IconComponent],
  templateUrl: './messages.page.html',
})
export class MessagesPage {
  readonly auth = inject(AuthStore);
  readonly contacts = [
    { name: 'Lic. Rodrigo Castellanos', last: 'Le notificaré en cuanto la confirmen.', unread: 0, active: true },
    { name: 'Dra. Mariela Fonseca', last: 'Documento recibido, gracias.', unread: 1, active: false },
    { name: 'Lic. Ana Zelaya', last: 'El trámite quedó finalizado.', unread: 0, active: false },
  ];
  readonly messages = signal<ChatMessage[]>(MOCK_CHAT);
  draft = '';

  send(): void {
    const text = this.draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    this.messages.update((m) => [...m, { id: 'm' + Date.now(), me: true, text, time: now }]);
    this.draft = '';
  }
}
