import { Component, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { LegalTask } from '@core/models';

@Component({
  selector: 'lex-tasks',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, IconComponent, PriorityChipComponent],
  templateUrl: './tasks.page.html',
})
export class TasksPage {
  readonly tasks = signal<LegalTask[]>([
    { id: 't1', titulo: 'Preparar pruebas documentales', caseId: 'EXP-2047', prioridad: 'Crítica', due: '28 May', completada: false },
    { id: 't2', titulo: 'Redactar escrito de constitución', caseId: 'EXP-2048', prioridad: 'Alta', due: '30 May', completada: false },
    { id: 't3', titulo: 'Revisar contrato de suministro', caseId: 'EXP-2046', prioridad: 'Media', due: '02 Jun', completada: false },
    { id: 't4', titulo: 'Solicitar audiencia de registro', caseId: 'EXP-2048', prioridad: 'Alta', due: '03 Jun', completada: false },
    { id: 't5', titulo: 'Archivar expediente finalizado', caseId: 'EXP-2045', prioridad: 'Baja', due: '20 May', completada: true },
  ]);
  toggle(id: string): void {
    this.tasks.update((list) => list.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)));
  }
}
