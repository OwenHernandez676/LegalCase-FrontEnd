import { Component, computed, input } from '@angular/core';
import { ChipComponent } from '../chip/chip.component';
import { CaseStatus } from '@core/models';

const MAP: Record<CaseStatus, { kind: any; dot: string }> = {
  'Pendiente': { kind: 'c-gray', dot: '#9AA3B0' },
  'En proceso': { kind: 'c-blue', dot: '#2E6CA8' },
  'En revisión': { kind: 'c-gold', dot: '#C07E25' },
  'Finalizado': { kind: 'c-green', dot: '#2C7A57' },
};

@Component({
  selector: 'lex-status-chip',
  standalone: true,
  imports: [ChipComponent],
  template: `<lex-chip [label]="status()" [kind]="meta().kind" [dot]="meta().dot" />`,
})
export class StatusChipComponent {
  readonly status = input.required<CaseStatus>();
  readonly meta = computed(() => MAP[this.status()] ?? { kind: 'c-gray', dot: '#9AA3B0' });
}
