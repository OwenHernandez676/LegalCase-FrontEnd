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
