import { Component, Input } from '@angular/core';

@Component({
  selector: 'lex-chip',
  standalone: true,
  template: `<span class="chip {{ kind }}">
      @if (dot) { <span class="dot" [style.background]="dot"></span> }{{ label }}</span>`,
})
export class ChipComponent {
  @Input({ required: true }) label = '';
  @Input() kind: 'c-gray' | 'c-green' | 'c-red' | 'c-blue' | 'c-gold' | 'c-violet' = 'c-gray';
  @Input() dot = '';
}
