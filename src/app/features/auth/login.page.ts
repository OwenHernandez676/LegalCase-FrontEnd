import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { Role } from '@core/models';

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

  readonly roles: { id: Role; label: string; desc: string; icon: any }[] = [
    { id: 'administrador', label: 'Administrador', desc: 'Gestión integral del despacho', icon: 'shield' },
    { id: 'abogado', label: 'Abogado', desc: 'Casos, agenda y tareas', icon: 'briefcase' },
    { id: 'cliente', label: 'Cliente', desc: 'Seguimiento de mi caso', icon: 'user' },
  ];
  readonly selectedRole = signal<Role>('administrador');
  readonly loading = signal(false);
  email = '';
  password = '';

  select(role: Role): void {
    this.selectedRole.set(role);
    this.email = `${role === 'administrador' ? 'admin' : role}@legalcase.hn`;
    this.password = 'demo1234';
  }

  submit(): void {
    this.loading.set(true);
    this.auth.login({ correo: this.email, contrasena: this.password, rol: this.selectedRole() }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/app/dashboard']); },
      error: () => { this.loading.set(false); this.toast.show({ title: 'No se pudo iniciar sesión', tone: 'warn' }); },
    });
  }
}
