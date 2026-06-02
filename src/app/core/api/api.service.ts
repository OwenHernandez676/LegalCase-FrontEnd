import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import {
  AuthResponse, AuthUser, BackendActivity, BackendCase, BackendCaseStatus, BackendDocument,
  BackendEvent, BackendMessage, BackendNotification, BackendRequest, CreateCasePayload,
  CreateEventPayload, DashboardReport,
} from './backend.models';

/**
 * Capa de acceso HTTP al backend LEXVANTE.
 * Sólo construye peticiones; no contiene lógica de negocio ni de estado.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_URL;

  // ─── Auth ───
  login(correo: string, contrasena: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { correo, contrasena });
  }
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/auth/me`);
  }

  // ─── Cases ───
  listCases(): Observable<BackendCase[]> {
    return this.http.get<BackendCase[]>(`${this.base}/cases`);
  }
  createCase(payload: CreateCasePayload): Observable<BackendCase> {
    return this.http.post<BackendCase>(`${this.base}/cases`, payload);
  }
  updateCaseStatus(id: string, estado: BackendCaseStatus, progreso?: number): Observable<BackendCase> {
    return this.http.patch<BackendCase>(`${this.base}/cases/${id}/status`, { estado, progreso });
  }

  // ─── Documents ───
  listDocuments(): Observable<BackendDocument[]> {
    return this.http.get<BackendDocument[]>(`${this.base}/documents`);
  }
  uploadDocument(form: FormData): Observable<BackendDocument> {
    return this.http.post<BackendDocument>(`${this.base}/documents`, form);
  }
  signDocument(id: string): Observable<BackendDocument> {
    return this.http.patch<BackendDocument>(`${this.base}/documents/${id}/sign`, {});
  }
  deleteDocument(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/documents/${id}`);
  }

  // ─── Events ───
  listEvents(): Observable<BackendEvent[]> {
    return this.http.get<BackendEvent[]>(`${this.base}/events`);
  }
  createEvent(payload: CreateEventPayload): Observable<BackendEvent> {
    return this.http.post<BackendEvent>(`${this.base}/events`, payload);
  }

  // ─── Notifications ───
  listNotifications(): Observable<BackendNotification[]> {
    return this.http.get<BackendNotification[]>(`${this.base}/notifications`);
  }
  createNotification(tipo: string, mensaje: string): Observable<BackendNotification> {
    return this.http.post<BackendNotification>(`${this.base}/notifications`, { tipo, mensaje });
  }
  markAllNotificationsRead(): Observable<{ updated: number }> {
    return this.http.patch<{ updated: number }>(`${this.base}/notifications/read-all`, {});
  }

  // ─── Activities ───
  listActivities(limit = 12): Observable<BackendActivity[]> {
    return this.http.get<BackendActivity[]>(`${this.base}/activities?limit=${limit}`);
  }

  // ─── Reports ───
  dashboard(): Observable<DashboardReport> {
    return this.http.get<DashboardReport>(`${this.base}/reports/dashboard`);
  }

  // ─── Requests ───
  listRequests(): Observable<BackendRequest[]> {
    return this.http.get<BackendRequest[]>(`${this.base}/requests`);
  }

  // ─── Messages ───
  listMessages(expedienteId: string): Observable<BackendMessage[]> {
    return this.http.get<BackendMessage[]>(`${this.base}/messages/${expedienteId}`);
  }
  sendMessage(payload: { expedienteId: string; emisor: string; receptor: string; texto: string }): Observable<BackendMessage> {
    return this.http.post<BackendMessage>(`${this.base}/messages`, payload);
  }
}
