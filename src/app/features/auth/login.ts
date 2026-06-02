import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <!-- Brand header -->
        <div class="bg-indigo-600 px-8 py-7 text-white flex items-center gap-3">
          <span class="p-2 bg-white/15 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </span>
          <div>
            <h1 class="font-display font-bold text-xl tracking-tight">LexFlow</h1>
            <p class="text-indigo-200 text-xs">Plataforma jurídica · LEXVANTE</p>
          </div>
        </div>

        <form (ngSubmit)="submit()" class="px-8 py-7 space-y-5">
          <h2 class="text-lg font-bold text-slate-800">Iniciar sesión</h2>

          @if (error()) {
            <div class="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-3 py-2">
              {{ error() }}
            </div>
          }

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico</label>
            <input type="email" name="correo" [(ngModel)]="correo" required autocomplete="username"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="admin@lexvante.hn" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
            <input type="password" name="contrasena" [(ngModel)]="contrasena" required autocomplete="current-password"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="••••••••" />
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg smooth-transition">
            {{ loading() ? 'Ingresando…' : 'Ingresar' }}
          </button>

          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-4 leading-relaxed">
            <p class="font-semibold text-slate-500 mb-1">Cuentas de prueba (contraseña: demo1234)</p>
            <button type="button" (click)="fill('admin@lexvante.hn')" class="block text-indigo-600 hover:underline">admin@lexvante.hn — Administrador</button>
            <button type="button" (click)="fill('abogado@lexvante.hn')" class="block text-indigo-600 hover:underline">abogado@lexvante.hn — Abogado</button>
            <button type="button" (click)="fill('cliente@lexvante.hn')" class="block text-indigo-600 hover:underline">cliente@lexvante.hn — Cliente</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected correo = '';
  protected contrasena = '';
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected fill(correo: string): void {
    this.correo = correo;
    this.contrasena = 'demo1234';
  }

  protected submit(): void {
    if (!this.correo || !this.contrasena) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.correo.trim().toLowerCase(), this.contrasena).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Credenciales inválidas. Verifica tu correo y contraseña.');
      },
    });
  }
}
