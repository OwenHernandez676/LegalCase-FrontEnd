import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'lex-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="dialog" [class.lg]="lg" (click)="$event.stopPropagation()">
        <div class="m-head">
          <div><h3>{{ title }}</h3>@if (sub) { <p>{{ sub }}</p> }</div>
          <button class="xb" (click)="close.emit()"><lex-icon name="x" [size]="18" /></button>
        </div>
        <div class="m-body"><ng-content /></div>
        <ng-content select="[footer]" />
      </div>
    </div>`,
  styles: [`
    .overlay{position:fixed;inset:0;background:rgba(8,15,24,.55);display:grid;place-items:center;z-index:200;padding:20px;animation:fade .2s}
    .dialog{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);width:100%;max-width:520px;box-shadow:var(--shadow-lg);max-height:90vh;overflow:auto;animation:pop .25s}
    .dialog.lg{max-width:720px}
    .m-head{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 22px;border-bottom:1px solid var(--line)}
    .m-head h3{font-size:18px}.m-head p{font-size:12.5px;color:var(--ink-soft);margin-top:2px}
    .xb{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:var(--ink-soft)}
    .xb:hover{background:var(--surface-3)}
    .m-body{padding:22px}
    @keyframes fade{from{opacity:0}}@keyframes pop{from{opacity:0;transform:scale(.96)}}
  `],
})
export class ModalComponent {
  @Input() title = '';
  @Input() sub = '';
  @Input() lg = false;
  @Output() close = new EventEmitter<void>();
}
