import { Injectable, signal, computed } from '@angular/core';
import { Role, Case, LegalEvent, LegalDocument, SystemNotification, ActivityLog, CaseStatus } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Active role of the logged in user: 'lawyer', 'client', 'admin'
  readonly activeRole = signal<Role>('lawyer');
  
  // Selected items for detail views
  readonly selectedCaseId = signal<string | null>(null);
  readonly selectedFolder = signal<string>('pruebas');
  readonly searchQuery = signal<string>('');

  // Pre-seeded Cases list
  readonly cases = signal<Case[]>([
    {
      id: '2026-902-A',
      title: 'Martínez vs. Inmobiliaria Varela',
      clientName: 'Jorge Martínez',
      lawyerName: 'Abog. María Elena',
      type: 'Civil',
      status: 'proceso',
      priority: 'alta',
      deadline: '2026-06-15',
      docsCount: 8,
      docsTotal: 12,
      commentsCount: 5,
      progress: 60,
      description: 'Demanda civil por incumplimiento de contrato de compraventa y daños y perjuicios de inmueble residencial.',
      recentActivity: 'Audiencia de proposición de pruebas programada.',
      milestones: [
        { id: 'm1', title: 'Ingesta y Análisis de Documentación', date: '2026-03-10', completed: true, description: 'Revisión preliminar de escrituras y pagos.' },
        { id: 'm2', title: 'Redacción y Presentación de Demanda', date: '2026-04-05', completed: true, description: 'Demanda admitida por el Juzgado Civil.' },
        { id: 'm3', title: 'Audiencia de Conciliación', date: '2026-05-12', completed: true, description: 'Intento de acuerdo fallido por inasistencia de la contraparte.' },
        { id: 'm4', title: 'Audiencia de Pruebas (Juicio)', date: '2026-06-15', completed: false, description: 'Evacuación de testimonios y peritaje constructivo.' },
        { id: 'm5', title: 'Sentencia de Primera Instancia', date: '2026-07-20', completed: false, description: 'Emisión de fallo judicial.' }
      ]
    },
    {
      id: '2026-104-B',
      title: 'Despido Injustificado - Caso Pérez',
      clientName: 'Juan Pérez',
      lawyerName: 'Abog. María Elena',
      type: 'Laboral',
      status: 'ingesta',
      priority: 'alta',
      deadline: '2026-05-26',
      docsCount: 2,
      docsTotal: 4,
      commentsCount: 3,
      progress: 15,
      description: 'Reclamación de indemnización laboral por despido sin causa justificada en empresa de telecomunicaciones.',
      recentActivity: 'Cálculo de prestaciones sociales efectuado.',
      milestones: [
        { id: 'p1', title: 'Cálculo de Prestaciones e Ingesta', date: '2026-05-10', completed: true, description: 'Cálculo actuarial y recolección de contratos de trabajo.' },
        { id: 'p2', title: 'Conciliación Prejudicial', date: '2026-05-26', completed: false, description: 'Audiencia ante la Secretaría del Trabajo para conciliación.' },
        { id: 'p3', title: 'Presentación formal de Demanda', date: '2026-06-20', completed: false, description: 'Radicación de la demanda ante el Tribunal de Trabajo.' }
      ]
    },
    {
      id: '2026-098-C',
      title: 'Restructuración de Gómez Corp',
      clientName: 'Alejandro Gómez',
      lawyerName: 'Abog. Carlos Ruiz',
      type: 'Mercantil',
      status: 'demanda',
      priority: 'media',
      deadline: '2026-05-30',
      docsCount: 5,
      docsTotal: 5,
      commentsCount: 0,
      progress: 40,
      description: 'Reestructuración societaria, fusión de filiales y preparación de actas de asambleas extraordinarias de accionistas.',
      recentActivity: 'Redacción de las bases de fusión de Gomez Corp con Inversiones G.',
      milestones: [
        { id: 'g1', title: 'Auditoría Legal (Due Diligence)', date: '2026-04-10', completed: true, description: 'Análisis de pasivos y cumplimiento fiscal.' },
        { id: 'g2', title: 'Borrador de Acuerdo de Fusión', date: '2026-05-20', completed: true, description: 'Aprobado por el comité directivo.' },
        { id: 'g3', title: 'Asamblea de Accionistas', date: '2026-05-30', completed: false, description: 'Firma de actas solemnes de fusión.' }
      ]
    },
    {
      id: '2026-112-D',
      title: 'Divorcio Mutuo Acuerdo - Silva',
      clientName: 'Laura Silva',
      lawyerName: 'Abog. Juan Pérez',
      type: 'Familiar',
      status: 'ingesta',
      priority: 'media',
      deadline: '2026-06-04',
      docsCount: 1,
      docsTotal: 5,
      commentsCount: 2,
      progress: 10,
      description: 'Disolución del vínculo matrimonial de mutuo acuerdo y liquidación de sociedad conyugal con menores de edad.',
      recentActivity: 'Esperando actas de nacimiento originales y títulos de bienes.',
      milestones: [
        { id: 's1', title: 'Recopilación Documental Conyugal', date: '2026-05-18', completed: true, description: 'Obtención de actas y copias certificadas.' },
        { id: 's2', title: 'Convenio de Custodia y Alimentos', date: '2026-06-04', completed: false, description: 'Redacción del convenio regulador de menores.' },
        { id: 's3', title: 'Presentación ante Juzgado de Familia', date: '2026-06-25', completed: false, description: 'Radicación del acuerdo homologado.' }
      ]
    },
    {
      id: '2026-052-E',
      title: 'Conflicto Colectivo - Sindicato Textil',
      clientName: 'Sindicato Unificado',
      lawyerName: 'Abog. María Elena',
      type: 'Administrativo',
      status: 'proceso',
      priority: 'alta',
      deadline: '2026-06-05',
      docsCount: 12,
      docsTotal: 20,
      commentsCount: 10,
      progress: 75,
      description: 'Impugnación administrativa de resoluciones de inspección del trabajo que declararon legal el paro empresarial.',
      recentActivity: 'Escrito de conclusiones finales presentado ante la Secretaría.',
      milestones: [
        { id: 'sd1', title: 'Inspección Ocular de Seguridad', date: '2026-02-15', completed: true, description: 'Levantamiento de acta de hechos.' },
        { id: 'sd2', title: 'Recurso de Alzada Administrativo', date: '2026-03-20', completed: true, description: 'Interposición de apelación en sede administrativa.' },
        { id: 'sd3', title: 'Fase de Evacuación de Pruebas', date: '2026-05-10', completed: true, description: 'Testimoniales e informes técnicos.' },
        { id: 'sd4', title: 'Resolución de Secretaría de Trabajo', date: '2026-06-05', completed: false, description: 'Fecha máxima para la resolución definitiva.' }
      ]
    },
    {
      id: '2026-012-F',
      title: 'Juicio Ejecutivo López Corp',
      clientName: 'Jorge López',
      lawyerName: 'Abog. Carlos Ruiz',
      type: 'Civil',
      status: 'sentencia',
      priority: 'alta',
      deadline: '2026-05-22',
      docsCount: 15,
      docsTotal: 15,
      commentsCount: 4,
      progress: 100,
      description: 'Demanda ejecutiva civil orientada al cobro de pagarés mercantiles firmados en garantía de suministros comerciales.',
      recentActivity: 'Caso ganado. Sentencia firme de primera instancia ejecutable.',
      milestones: [
        { id: 'l1', title: 'Presentación de Demanda Ejecutiva', date: '2025-11-05', completed: true, description: 'Demanda admitida con embargo precautorio.' },
        { id: 'l2', title: 'Traba de Embargo de Cuentas', date: '2025-12-10', completed: true, description: 'Retención judicial de fondos por el juzgado.' },
        { id: 'l3', title: 'Sentencia de Primera Instancia', date: '2026-05-22', completed: true, description: 'Fallo favorable ordenando el pago total del adeudo.' }
      ]
    }
  ]);

  // Pre-seeded Events list
  readonly events = signal<LegalEvent[]>([
    {
      id: 'e1',
      title: 'Conciliación Prejudicial obligatoria',
      caseId: '2026-104-B',
      caseTitle: 'Despido Injustificado - Caso Pérez',
      date: '2026-05-26',
      time: '10:00 AM',
      type: 'reunion',
      description: 'Reunión conciliadora en la Dirección General de Trabajo para mediación con patrono.'
    },
    {
      id: 'e2',
      title: 'Firma de Acta Fusión Gómez Corp',
      caseId: '2026-098-C',
      caseTitle: 'Restructuración de Gómez Corp',
      date: '2026-05-30',
      time: '02:30 PM',
      type: 'reunion',
      description: 'Asamblea solemnizada por Notario Público en oficinas del bufete.'
    },
    {
      id: 'e3',
      title: 'Audiencia de Proposición de Pruebas',
      caseId: '2026-902-A',
      caseTitle: 'Martínez vs. Inmobiliaria Varela',
      date: '2026-06-15',
      time: '09:00 AM',
      type: 'audiencia',
      description: 'Comparecencia oral ante el Juez Tercero de lo Civil de lo de Francisco Morazán.'
    },
    {
      id: 'e4',
      title: 'Fecha Límite - Presentar Apelación',
      caseId: '2026-052-E',
      caseTitle: 'Conflicto Colectivo - Sindicato Textil',
      date: '2026-06-05',
      time: '11:59 PM',
      type: 'plazo',
      description: 'Último día para interponer escrito contra resolución denegatoria del Juez Laboral.'
    }
  ]);

  // Pre-seeded Documents list
  readonly documents = signal<LegalDocument[]>([
    {
      id: 'd1',
      name: 'Contestacion_Demanda_v2.pdf',
      caseId: '2026-902-A',
      caseTitle: 'Martínez vs. Inmobiliaria Varela',
      folder: 'escritos',
      size: '2.4 MB',
      dateAdded: '2026-05-23',
      uploadedBy: 'Abog. María Elena',
      signatureStatus: 'firmado'
    },
    {
      id: 'd2',
      name: 'Contrato_Prestacion_Servicios.pdf',
      caseId: '2026-902-A',
      caseTitle: 'Martínez vs. Inmobiliaria Varela',
      folder: 'contratos',
      size: '1.1 MB',
      dateAdded: '2026-05-22',
      uploadedBy: 'Abog. María Elena',
      signatureStatus: 'pendiente'
    },
    {
      id: 'd3',
      name: 'Prueba_Pericial_Calidad_Estructura.pdf',
      caseId: '2026-902-A',
      caseTitle: 'Martínez vs. Inmobiliaria Varela',
      folder: 'pruebas',
      size: '4.8 MB',
      dateAdded: '2026-05-15',
      uploadedBy: 'Abog. María Elena',
      signatureStatus: 'no_requerida'
    },
    {
      id: 'd4',
      name: 'Acta_Embargo_Bienes_Firmada.pdf',
      caseId: '2026-012-F',
      caseTitle: 'Juicio Ejecutivo López Corp',
      folder: 'resoluciones',
      size: '3.1 MB',
      dateAdded: '2026-05-10',
      uploadedBy: 'Abog. Carlos Ruiz',
      signatureStatus: 'firmado'
    },
    {
      id: 'd5',
      name: 'Calculo_Indemnizacion_Prejudicial.xlsx',
      caseId: '2026-104-B',
      caseTitle: 'Despido Injustificado - Caso Pérez',
      folder: 'pruebas',
      size: '850 KB',
      dateAdded: '2026-05-21',
      uploadedBy: 'Abog. María Elena',
      signatureStatus: 'no_requerida'
    }
  ]);

  // Pre-seeded Notifications list
  readonly notifications = signal<SystemNotification[]>([
    {
      id: 'n1',
      title: 'Plazo Urgente Laboral',
      message: 'La audiencia de conciliación prejudicial del Caso Pérez (#2026-104-B) vence en 3 días (26-Mayo).',
      time: 'Hace 10 min',
      read: false,
      priority: 'urgente',
      caseId: '2026-104-B'
    },
    {
      id: 'n2',
      title: 'Contrato Firmado por Cliente',
      message: 'El cliente Jorge Martínez firmó digitalmente el Contrato de Honorarios Profesionales.',
      time: 'Hace 2 horas',
      read: false,
      priority: 'normal',
      caseId: '2026-902-A'
    },
    {
      id: 'n3',
      title: 'Resolución Notificada',
      message: 'Se notificó la sentencia de primera instancia del Caso López (#2026-012-F). ¡Fallo Favorable!',
      time: 'Hace 1 día',
      read: true,
      priority: 'urgente',
      caseId: '2026-012-F'
    }
  ]);

  // Pre-seeded Activity Logs
  readonly activityLogs = signal<ActivityLog[]>([
    {
      id: 'a1',
      user: 'Abog. María Elena',
      action: 'cargó Contestacion_Demanda_v2.pdf en escritos judiciales.',
      time: 'Hace 2 horas',
      avatar: 'ME'
    },
    {
      id: 'a2',
      user: 'Jorge Martínez (Cliente)',
      action: 'firmó digitalmente Contrato_Prestacion_Servicios.pdf.',
      time: 'Hace 4 horas',
      avatar: 'JM'
    },
    {
      id: 'a3',
      user: 'Abog. Carlos Ruiz',
      action: 'actualizó el estado del Caso López a [Favorable / Sentencia].',
      time: 'Hace 1 día',
      avatar: 'CR'
    },
    {
      id: 'a4',
      user: 'Sindicato Unificado',
      action: 'escribió un nuevo mensaje en el panel de consultas.',
      time: 'Hace 2 días',
      avatar: 'SU'
    }
  ]);

  // COMPUTED STATES for simplified selectors
  readonly activeCase = computed(() => {
    const id = this.selectedCaseId();
    return id ? this.cases().find(c => c.id === id) || null : null;
  });

  readonly unreadNotificationsCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  // Filtered lists based on search query
  readonly filteredCases = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.cases();
    return this.cases().filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.type.toLowerCase().includes(query)
    );
  });

  readonly activeClientCase = computed(() => {
    // For client view: we assume client is 'Jorge Martínez' for testing purposes
    return this.cases().find(c => c.clientName === 'Jorge Martínez') || this.cases()[0];
  });

  // Actions
  changeRole(role: Role) {
    this.activeRole.set(role);
    // Set a default selected case based on the role to populate views
    if (role === 'client') {
      this.selectedCaseId.set(this.activeClientCase()?.id || null);
    } else {
      this.selectedCaseId.set(this.cases()[0]?.id || null);
    }
  }

  updateCaseStatus(caseId: string, status: CaseStatus) {
    this.cases.update(all => all.map(c => {
      if (c.id === caseId) {
        let recentAct = '';
        switch(status) {
          case 'ingesta': recentAct = 'Caso devuelto a análisis e ingesta de expedientes.'; break;
          case 'demanda': recentAct = 'Caso avanzado a etapa de preparación y redacción de demanda.'; break;
          case 'proceso': recentAct = 'Litigio en marcha. Audiencias y proposición de medios de prueba.'; break;
          case 'sentencia': recentAct = 'Concluido el debate. Esperando resolución final o sentencia.'; break;
        }
        
        // Add activity log
        this.addActivityLog(
          this.activeRole() === 'lawyer' ? 'Abog. María Elena' : 'Administrador',
          `movió el caso "${c.title}" a la columna [${status.toUpperCase()}].`
        );

        return { ...c, status, recentActivity: recentAct };
      }
      return c;
    }));
  }

  updateMilestone(caseId: string, milestoneId: string, completed: boolean) {
    this.cases.update(all => all.map(c => {
      if (c.id === caseId) {
        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId) {
            return { ...m, completed };
          }
          return m;
        });
        
        // Calculate progress percentage based on completed milestones
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);

        this.addActivityLog(
          'Sistema',
          `marcó el hito "${c.milestones.find(m => m.id === milestoneId)?.title}" como ${completed ? 'completado' : 'pendiente'}.`
        );

        return { ...c, milestones: updatedMilestones, progress };
      }
      return c;
    }));
  }

  addCase(newCase: Case) {
    this.cases.update(all => [newCase, ...all]);
    this.addActivityLog('Administrador', `registró un nuevo caso legal: "${newCase.title}".`);
  }

  addDocument(doc: LegalDocument) {
    this.documents.update(all => [doc, ...all]);
    
    // Increment case document counts
    this.cases.update(all => all.map(c => {
      if (c.id === doc.caseId) {
        return { 
          ...c, 
          docsCount: c.docsCount + 1, 
          docsTotal: c.docsTotal + 1,
          recentActivity: `Nuevo archivo subido: ${doc.name}`
        };
      }
      return c;
    }));

    this.addActivityLog(
      doc.uploadedBy, 
      `subió "${doc.name}" en la sección [${doc.folder.toUpperCase()}].`
    );
  }

  addEvent(event: LegalEvent) {
    this.events.update(all => [...all, event]);
    this.addActivityLog(
      'Sistema', 
      `agendó nuevo evento: "${event.title}" para el día ${event.date}.`
    );
  }

  addNotification(notif: Omit<SystemNotification, 'id' | 'read'>) {
    const fullNotif: SystemNotification = {
      ...notif,
      id: 'n_' + Math.random().toString(36).substring(2, 9),
      read: false
    };
    this.notifications.update(all => [fullNotif, ...all]);
  }

  markNotificationAsRead(id: string) {
    this.notifications.update(all => all.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllNotificationsAsRead() {
    this.notifications.update(all => all.map(n => ({ ...n, read: true })));
  }

  addActivityLog(user: string, action: string) {
    const newLog: ActivityLog = {
      id: 'a_' + Math.random().toString(36).substring(2, 9),
      user,
      action,
      time: 'Hace un momento',
      avatar: user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
    this.activityLogs.update(all => [newLog, ...all]);
  }

  signDocument(docId: string, user: string) {
    this.documents.update(all => all.map(d => {
      if (d.id === docId) {
        this.addActivityLog(user, `firmó digitalmente el documento "${d.name}".`);
        
        // Notify lawyer
        this.addNotification({
          title: 'Documento Firmado',
          message: `${user} firmó digitalmente el documento "${d.name}".`,
          time: 'Hace un momento',
          priority: 'normal',
          caseId: d.caseId
        });

        return { ...d, signatureStatus: 'firmado' };
      }
      return d;
    }));
  }
}
