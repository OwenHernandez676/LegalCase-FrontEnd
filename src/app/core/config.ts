/** Configuración central del backend LEXVANTE. */
export const BACKEND_ORIGIN = 'http://localhost:3000';
export const API_URL = `${BACKEND_ORIGIN}/api`;
/** Socket.IO se sirve en el namespace /realtime. */
export const WS_NAMESPACE = `${BACKEND_ORIGIN}/realtime`;

/** Construye la URL absoluta de descarga para un archivo subido. */
export function fileUrl(relative?: string): string {
  if (!relative) return '#';
  return relative.startsWith('http') ? relative : `${BACKEND_ORIGIN}${relative}`;
}
