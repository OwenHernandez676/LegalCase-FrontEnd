import { Component, computed, inject } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthStore } from '@core/store/auth.store';
import { MessagesService } from '@core/services/messages.service';
import { Conversation } from '@core/models';

@Component({
  selector: 'lex-messages',
  standalone: true,
  imports: [PageHeadComponent, AvatarComponent, IconComponent],
  templateUrl: './messages.page.html',
})
export class MessagesPage {
  readonly auth = inject(AuthStore);
  private readonly svc = inject(MessagesService);

  /** Bandeja según el rol: el abogado ve a sus clientes; el cliente, a su abogado. */
  readonly conversations = computed(() =>
    this.svc.forRole(this.auth.role() ?? 'cliente'));

  readonly active = computed<Conversation | null>(() => {
    const id = this.svc.activeId();
    return this.conversations().find((c) => c.id === id)
      ?? this.conversations()[0]
      ?? null;
  });

  draft = '';

  constructor() {
    // Abre la primera conversación de la bandeja al entrar.
    const first = this.conversations()[0];
    if (first) this.svc.open(first.id);
  }

  open(c: Conversation): void { this.svc.open(c.id); }

  send(): void {
    const text = this.draft.trim();
    const conv = this.active();
    if (!text || !conv) return;
    this.svc.send(conv.id, text);
    this.draft = '';
  }
}
