import { Injectable, signal, computed } from '@angular/core';
import { AuthSession, Role, User } from '../models';
import { environment } from '@env/environment';

const USER_KEY = environment.tokenKey + '.user';

/** Restaura el usuario persistido para sobrevivir recargas de página. */
function restoreUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Estado global de autenticación con Signals.
 * Es la única fuente de verdad de la sesión: el token, el usuario y el rol.
 * El resto de la app deriva su comportamiento de estos selectores.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(restoreUser());
  private readonly _token = signal<string | null>(localStorage.getItem(environment.tokenKey));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly role = computed<Role | null>(() => this._user()?.rol ?? null);

  setSession(session: AuthSession): void {
    this._user.set(session.user);
    this._token.set(session.token);
    localStorage.setItem(environment.tokenKey, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }

  clear(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(USER_KEY);
  }
}
