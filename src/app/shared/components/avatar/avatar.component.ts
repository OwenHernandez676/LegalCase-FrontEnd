import { Component, Input, computed, signal } from '@angular/core';

const PALETTE = ['#B68A33', '#2E6CA8', '#6B5599', '#2C7A57', '#BB4138', '#1C3A55'];

@Component({
  selector: 'lex-avatar',
  standalone: true,
  template: `<span class="av" [style.width.px]="size" [style.height.px]="size"
      [style.background]="bg()" [style.fontSize.px]="size * 0.38">{{ initials() }}</span>`,
  styles: [`.av{border-radius:50%;display:inline-grid;place-items:center;color:#fff;font-weight:700;flex:none;font-family:'Manrope'}`],
})
export class AvatarComponent {
  private readonly _name = signal('');
  @Input({ required: true }) set name(v: string) { this._name.set(v ?? ''); }
  @Input() size = 36;

  readonly initials = computed(() =>
    this._name().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase());
  readonly bg = computed(() => {
    const n = this._name();
    let h = 0;
    for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
    return PALETTE[Math.abs(h) % PALETTE.length];
  });
}
