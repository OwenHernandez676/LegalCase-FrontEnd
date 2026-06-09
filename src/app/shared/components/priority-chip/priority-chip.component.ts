import { Component, computed, input } from '@angular/core';
import { ChipComponent } from '../chip/chip.component';
import { Priority } from '@core/models';

const MAP: Record<Priority, { kind: any; dot: string }> = {
  'Baja': { kind: 'c-blue', dot: '#2E6CA8' },
  'Media': { kind: 'c-gold', dot: '#C07E25' },
  'Alta': { kind: 'c-red', dot: '#BB4138' },
  'Crítica': { kind: 'c-violet', dot: '#6B5599' },
};

@Component({
  selector: 'lex-priority-chip',
  standalone: true,
  imports: [ChipComponent],
  template: `<lex-chip [label]="priority()" [kind]="meta().kind" [dot]="meta().dot" />`,
})
export class PriorityChipComponent {
  readonly priority = input.required<Priority>();
  readonly meta = computed(() => MAP[this.priority()]);
}
