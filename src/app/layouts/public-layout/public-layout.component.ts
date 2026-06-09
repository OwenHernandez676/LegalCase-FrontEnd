import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell público (landing y login): sin barra lateral. */
@Component({
  selector: 'lex-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class PublicLayoutComponent {}
