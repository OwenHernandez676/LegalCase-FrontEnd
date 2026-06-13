import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'lex-login',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  email = '';
  password = '';

  /**
   * Inicio de sesión solo con correo y contraseña. El rol lo determina el
   * backend a partir del usuario; tras autenticar, el dashboard se adapta al
   * rol recibido (administrador/abogado/cliente) automáticamente.
   */
  submit(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.auth.login({ correo: this.email.trim(), contrasena: this.password }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/app/dashboard']); },
      error: () => { this.loading.set(false); this.toast.show({ title: 'No se pudo iniciar sesión', msg: 'Verifique su correo y contraseña', tone: 'warn' }); },
    });
  }
}
