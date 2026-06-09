import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'lex-kpi-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="kpi-top">
      <div class="kpi-ic" [style.background]="iconBg" [style.color]="iconColor">
        <lex-icon [name]="icon" [size]="21" />
      </div>
      @if (delta) { <span class="kpi-delta" [class.up]="up" [class.down]="!up">
        <lex-icon name="trend" [size]="13" /> {{ delta }}</span> }
    </div>
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-val">{{ value }}</div>`,
  host: { class: 'kpi' },
})
export class KpiCardComponent {
  @Input({ required: true }) icon: any = 'folder';
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() delta = '';
  @Input() up = true;
  @Input() iconBg = 'var(--gold-wash)';
  @Input() iconColor = 'var(--gold)';
}
