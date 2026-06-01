import { Injectable, inject } from '@angular/core';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly state = inject(StateService);
  private simulationInterval: any = null;

  // Real-time event mock data
  private readonly mockAlerts = [
    {
      title: 'Resolución de Juzgado Civil',
      message: 'El Juzgado de Letras de lo Civil ha emitido el auto de admisión de pruebas para el Caso Martínez (#2026-902-A).',
      priority: 'urgente' as const,
      caseId: '2026-902-A',
      user: 'Juzgado Civil',
      action: 'notificó auto de admisión de pruebas.'
    },
    {
      title: 'Cliente Subió Documento',
      message: 'El cliente Juan Pérez cargó "Constancia_Medica_Despido.pdf" en la sección de Pruebas.',
      priority: 'normal' as const,
      caseId: '2026-104-B',
      user: 'Juan Pérez (Cliente)',
      action: 'subió Constancia_Medica_Despido.pdf en carpeta pruebas.'
    },
    {
      title: 'Audiencia de Conciliación Convocada',
      message: 'Se ha agendado una sesión extraordinaria de conciliación para el Caso Hnos. Silva el 12-Junio.',
      priority: 'normal' as const,
      caseId: '2026-112-D',
      user: 'Mediador Familiar',
      action: 'convocó a audiencia extraordinaria de alimentos.'
    },
    {
      title: 'Sentencia Apelada por Contraparte',
      message: 'La contraparte interpuso recurso de apelación contra la sentencia ejecutable del Caso López (#2026-012-F).',
      priority: 'urgente' as const,
      caseId: '2026-012-F',
      user: 'Contraparte López Corp',
      action: 'presentó recurso de apelación de sentencia.'
    }
  ];

  startAutoSimulation() {
    if (this.simulationInterval) return;
    
    // Simulate an event every 90 seconds
    this.simulationInterval = setInterval(() => {
      this.triggerRandomSimulation();
    }, 90000);
  }

  stopAutoSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  triggerRandomSimulation() {
    const randomIndex = Math.floor(Math.random() * this.mockAlerts.length);
    const alert = this.mockAlerts[randomIndex];
    
    // 1. Add notification
    this.state.addNotification({
      title: alert.title,
      message: alert.message,
      time: 'Ahora mismo',
      priority: alert.priority,
      caseId: alert.caseId
    });

    // 2. Add activity log
    this.state.addActivityLog(alert.user, alert.action);

    // 3. (Optional) If the document is uploaded by client, add it to documents
    if (alert.title === 'Cliente Subió Documento') {
      this.state.addDocument({
        id: 'd_sim_' + Math.random().toString(36).substring(2, 9),
        name: 'Constancia_Medica_Despido.pdf',
        caseId: '2026-104-B',
        caseTitle: 'Despido Injustificado - Caso Pérez',
        folder: 'pruebas',
        size: '1.2 MB',
        dateAdded: '2026-05-23',
        uploadedBy: 'Juan Pérez (Cliente)',
        signatureStatus: 'no_requerida'
      });
    }
  }
}
