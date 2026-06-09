import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

/**
 * Cliente HTTP genérico y tipado contra la API NestJS.
 * Centraliza la URL base y simplifica el consumo desde los servicios de dominio.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) for (const [k, v] of Object.entries(params)) httpParams = httpParams.set(k, String(v));
    return this.http.get<T>(`${this.base}/${path}`, { params: httpParams });
  }
  post<T>(path: string, body: unknown): Observable<T> { return this.http.post<T>(`${this.base}/${path}`, body); }
  put<T>(path: string, body: unknown): Observable<T> { return this.http.put<T>(`${this.base}/${path}`, body); }
  patch<T>(path: string, body: unknown): Observable<T> { return this.http.patch<T>(`${this.base}/${path}`, body); }
  delete<T>(path: string): Observable<T> { return this.http.delete<T>(`${this.base}/${path}`); }
}
