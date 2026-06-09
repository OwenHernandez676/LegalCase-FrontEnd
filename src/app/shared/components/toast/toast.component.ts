import { Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'lex-toast',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast {{ t.tone }}">
          <span class="ti"><lex-icon [name]="t.tone === 'warn' ? 'flag' : 'check'" [size]="16" /></span>
          <div><b>{{ t.title }}</b>@if (t.msg) { <span>{{ t.msg }}</span> }</div>
        </div>
      }
    </div>`,
  styles: [`
    .stack{position:fixed;bottom:22px;right:22px;display:flex;flex-direction:column;gap:10px;z-index:400}
    .toast{display:flex;gap:11px;align-items:center;background:var(--surface);border:1px solid var(--line);
      border-left:4px solid var(--gold);border-radius:12px;padding:12px 16px;box-shadow:var(--shadow-lg);
      min-width:260px;max-width:340px;animation:slide .28s}
    .toast.success{border-left-color:var(--success)}.toast.warn{border-left-color:var(--danger)}
    .toast.info{border-left-color:var(--blue)}.toast.gold{border-left-color:var(--gold)}
    .ti{width:30px;height:30px;border-radius:8px;background:var(--surface-3);display:grid;place-items:center;color:var(--ink-2);flex:none}
    .toast b{font-size:13px;display:block}.toast span{font-size:11.5px;color:var(--ink-soft)}
    @keyframes slide{from{opacity:0;transform:translateX(20px)}}
  `],
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
