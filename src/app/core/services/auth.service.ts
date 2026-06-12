import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { AuthSession, LoginCredentials } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(AuthStore);
  private readonly api = inject(ApiService);

  login(creds: LoginCredentials): Observable<AuthSession> {
    return this.api.post<AuthSession>('auth/login', {
      correo: creds.correo,
      contrasena: creds.contrasena
    }).pipe(
      tap(session => this.store.setSession(session))
    );
  }

  logout(): void { this.store.clear(); }
}
