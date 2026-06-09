import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'lex-page-head',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (crumbs.length) {
      <div class="crumbs">
        @for (c of crumbs; track c; let i = $index) {
          @if (i > 0) { <span class="sep"><lex-icon name="chevR" [size]="12" /></span> }
          <span [style.color]="i === crumbs.length - 1 ? 'var(--ink)' : ''"
                [style.fontWeight]="i === crumbs.length - 1 ? 700 : 600">{{ c }}</span>
        }
      </div>
    }
    <div class="page-head">
      <div><h1>{{ title }}</h1>@if (sub) { <p>{{ sub }}</p> }</div>
      <div class="page-actions"><ng-content /></div>
    </div>`,
})
export class PageHeadComponent {
  @Input({ required: true }) title = '';
  @Input() sub = '';
  @Input() crumbs: string[] = [];
}
