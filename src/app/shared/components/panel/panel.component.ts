import { Component, Input } from '@angular/core';

/** Contenedor de sección reutilizable con cabecera opcional y slot de acciones. */
@Component({
  selector: 'lex-panel',
  standalone: true,
  template: `
    @if (title) {
      <div class="panel-head">
        <div><h3>{{ title }}</h3>@if (sub) { <div class="sub">{{ sub }}</div> }</div>
        <ng-content select="[actions]" />
      </div>
    }
    <div [class.panel-body]="!noPad"><ng-content /></div>`,
  host: { class: 'panel' },
})
export class PanelComponent {
  @Input() title = '';
  @Input() sub = '';
  @Input() noPad = false;
}
