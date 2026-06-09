import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, tap, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { AuthSession, LoginCredentials, Role } from '../models';
import { MOCK_USERS } from './mock-data';

/**
 * Servicio de autenticación.
 * MODO DEMO: valida contra usuarios de muestra y emite un token simulado.
 * MODO REAL: descomentar la llamada a ApiService.post('auth/login', creds)
 * y eliminar la rama mock — el AuthStore y los guards no cambian.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(AuthStore);
  // private readonly api = inject(ApiService); // ← activar al conectar NestJS

  login(creds: LoginCredentials): Observable<AuthSession> {
    const user = MOCK_USERS.find((u) => u.rol === creds.rol);
    if (!user) return throwError(() => new Error('Credenciales inválidas'));

    const session: AuthSession = { user, token: this.fakeJwt(user.rol) };
    // return this.api.post<AuthSession>('auth/login', creds).pipe(tap(s => this.store.setSession(s)));
    return of(session).pipe(delay(450), tap((s) => this.store.setSession(s)));
  }

  logout(): void { this.store.clear(); }

  private fakeJwt(rol: Role): string {
    const payload = btoa(JSON.stringify({ rol, iat: Date.now() }));
    return `demo.${payload}.legalcase`;
  }
}
