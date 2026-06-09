import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'lex-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet />\n<lex-toast />`,
})
export class AppComponent {}
