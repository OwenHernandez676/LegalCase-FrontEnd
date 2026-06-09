import { FileType } from './enums';
export interface LegalDocument {
  id: string;
  name: string;
  ext: FileType;
  size: string;
  caseId: string;
  by: string;
  date: string;
}
