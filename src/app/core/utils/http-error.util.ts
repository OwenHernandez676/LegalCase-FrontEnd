import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae el mensaje de error real que devuelve la API.
 * El backend responde { statusCode, path, timestamp, message } para
 * 400/401/403/404/409 y un mensaje genérico para 500. Esta función
 * desempaqueta ese `message` y cubre además el caso sin conexión (status 0).
 */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
    }
    const body = err.error as { message?: unknown } | string | null;
    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body === 'string' && body.trim()) return body;
    return `Error ${err.status}: ${err.statusText || 'la solicitud fue rechazada'}`;
  }
  return 'Ocurrió un error inesperado.';
}
