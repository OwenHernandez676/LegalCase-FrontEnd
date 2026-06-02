import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthResponse, AuthUser, BackendRole } from '../api/backend.models';
import { Role } from '../models/models';

const TOKEN_KEY = 'lexflow_token';
const USER_KEY = 'lexflow_user';

/** Traduce el rol del backend al rol que entiende la UI. */
export function toUiRole(rol: BackendRole): Role {
  if (rol === 'administrador') return 'admin';
  if (rol === 'cliente') return 'client';
  return 'lawyer';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  readonly isAuthenticated = computed(() => !!this.token());
  readonly role = computed<Role>(() => {
    const u = this.user();
    return u ? toUiRole(u.rol) : 'lawyer';
  });

  login(correo: string, contrasena: string): Observable<AuthResponse> {
    return this.api.login(correo, contrasena).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.token.set(res.token);
        this.user.set(res.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
