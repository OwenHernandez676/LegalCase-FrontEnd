export type Role = 'lawyer' | 'client' | 'admin';

export type CaseStatus = 'ingesta' | 'demanda' | 'proceso' | 'sentencia';

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface Case {
  id: string;
  title: string;
  clientName: string;
  lawyerName: string;
  type: 'Laboral' | 'Civil' | 'Mercantil' | 'Familiar' | 'Prop. Intelectual' | 'Administrativo';
  status: CaseStatus;
  priority: 'baja' | 'media' | 'alta';
  deadline: string;
  docsCount: number;
  docsTotal: number;
  commentsCount: number;
  progress: number;
  description: string;
  recentActivity?: string;
  milestones: Milestone[];
}

export interface LegalEvent {
  id: string;
  title: string;
  caseId: string;
  caseTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  type: 'audiencia' | 'plazo' | 'reunion';
  description: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  caseId: string;
  caseTitle: string;
  folder: 'pruebas' | 'escritos' | 'contratos' | 'resoluciones';
  size: string;
  dateAdded: string;
  uploadedBy: string;
  signatureStatus: 'firmado' | 'pendiente' | 'no_requerida';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'urgente' | 'normal';
  caseId?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
}
