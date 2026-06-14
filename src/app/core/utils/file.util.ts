import { FileType } from '../models';

const EXT_MAP: Record<string, FileType> = {
  pdf: 'PDF', docx: 'DOCX', doc: 'DOCX', xlsx: 'XLSX', xls: 'XLSX',
  png: 'IMG', jpg: 'IMG', jpeg: 'IMG', gif: 'IMG', webp: 'IMG',
};

/** Categoría de archivo a partir de su extensión. */
export function fileExt(name: string): FileType {
  return EXT_MAP[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'OTRO';
}

/** Tamaño legible (KB/MB) a partir de los bytes del archivo. */
export function fileSize(bytes: number): string {
  return bytes >= 1_048_576
    ? (bytes / 1_048_576).toFixed(1) + ' MB'
    : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

/** Lee un File y lo devuelve como data URL base64 (para enviarlo en el JSON). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Dispara la descarga de un Blob en el navegador con el nombre indicado. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
