import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { Case, CaseStatus } from '../../core/models/models';
import { AvatarComponent } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-3xl font-display font-bold text-primary-deep">Tablero Kanban de Casos</h1>
          <p class="text-slate-500 text-sm mt-1">Arrastra y suelta expedientes para avanzar las etapas procesales jurídicas.</p>
        </div>
        
        <button type="button" 
                (click)="openCreateModal()"
                class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm smooth-transition">
          + Nuevo Caso Legal
        </button>
      </div>

      <!-- Filters Panel -->
      <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-72 relative">
          <input type="text"
                 [(ngModel)]="searchFilter"
                 placeholder="Buscar caso por título o id..."
                 class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          <span class="absolute left-3 top-2.5 text-slate-400">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <!-- Priority Filter -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prioridad:</span>
            <select [(ngModel)]="priorityFilter" 
                    class="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-600">
              <option value="todos">Todas</option>
              <option value="alta">Alta Priority</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo:</span>
            <select [(ngModel)]="typeFilter" 
                    class="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-600">
              <option value="todos">Todos los fueros</option>
              <option value="Civil">Civil</option>
              <option value="Laboral">Laboral</option>
              <option value="Mercantil">Mercantil</option>
              <option value="Familiar">Familiar</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- KANBAN BOARD -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        @for (col of columns; track col.status) {
          <div class="bg-slate-100/70 p-4 rounded-xl border border-slate-200/50 flex flex-col min-h-[500px]"
               (dragover)="onDragOver($event)"
               (drop)="onDrop($event, col.status)">
            
            <!-- Column Header -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                <span class="block h-2 w-2 rounded-full" [ngClass]="col.dotColorClass"></span>
                <h3 class="text-sm font-bold text-slate-800 font-display">{{ col.title }}</h3>
              </div>
              <span class="text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                {{ getCasesInColumn(col.status).length }}
              </span>
            </div>

            <!-- Case Cards Container -->
            <div class="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
              @if (getCasesInColumn(col.status).length === 0) {
                <div class="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                  Arrastra un expediente aquí
                </div>
              } @else {
                @for (c of getCasesInColumn(col.status); track c.id) {
                  <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:shadow-md smooth-transition active:cursor-grabbing group relative"
                       draggable="true"
                       (dragstart)="onDragStart(c)"
                       (click)="selectCase(c.id)">
                    
                    <!-- Top Info / Priority -->
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{{ c.id }}</span>
                      <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            [ngClass]="{
                              'bg-rose-50 text-rose-700': c.priority === 'alta',
                              'bg-amber-50 text-amber-700': c.priority === 'media',
                              'bg-slate-50 text-slate-600': c.priority === 'baja'
                            }">
                        {{ c.priority }}
                      </span>
                    </div>

                    <!-- Title & Type -->
                    <h4 class="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 smooth-transition">
                      {{ c.title }}
                    </h4>
                    
                    <span class="inline-block mt-2 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {{ c.type }}
                    </span>

                    <hr class="my-3 border-slate-100" />

                    <!-- Footer Metadata -->
                    <div class="flex items-center justify-between text-xs text-slate-400">
                      <div class="flex items-center space-x-1.5">
                        <app-avatar [name]="c.lawyerName" size="sm"></app-avatar>
                        <span class="font-medium text-slate-500 text-[10px] truncate max-w-[80px]" [title]="c.lawyerName">
                          {{ c.lawyerName.replace('Abog. ', '') }}
                        </span>
                      </div>
                      
                      <!-- Deadline indicator -->
                      <div class="flex items-center space-x-1 text-[10px] font-medium"
                           [ngClass]="{ 'text-rose-500 font-semibold': col.status !== 'sentencia' }">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{{ c.deadline | date:'d MMM' }}</span>
                      </div>
                    </div>

                    <!-- Quick Navigation Arrows for Mobile (where drag and drop is harder) -->
                    <div class="mt-3 flex justify-end space-x-1 md:hidden">
                      @if (col.status !== 'ingesta') {
                        <button (click)="moveStageMobile($event, c, 'prev')" class="p-1 text-slate-400 hover:text-slate-600 border rounded">←</button>
                      }
                      @if (col.status !== 'sentencia') {
                        <button (click)="moveStageMobile($event, c, 'next')" class="p-1 text-slate-400 hover:text-slate-600 border rounded">→</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>

      <!-- Add Case Modal Mock -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 class="font-bold text-slate-800 font-display">Crear Nuevo Caso Legal</h3>
              <button (click)="closeCreateModal()" class="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            
            <form (submit)="createCase($event)" class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título del Caso</label>
                <input type="text" name="title" [(ngModel)]="newCase.title" required
                       class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       placeholder="e.g. Martínez vs. Inmobiliaria" />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cliente</label>
                  <input type="text" name="clientName" [(ngModel)]="newCase.clientName" required
                         class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                         placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fuero / Tipo</label>
                  <select name="type" [(ngModel)]="newCase.type"
                          class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                    <option value="Civil">Civil</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Mercantil">Mercantil</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Prioridad</label>
                  <select name="priority" [(ngModel)]="newCase.priority"
                          class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Plazo Inicial</label>
                  <input type="date" name="deadline" [(ngModel)]="newCase.deadline" required
                         class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Breve Descripción</label>
                <textarea name="description" [(ngModel)]="newCase.description" rows="3"
                          class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Detalles sobre el conflicto legal..."></textarea>
              </div>

              <div class="flex justify-end space-x-3 pt-2">
                <button type="button" (click)="closeCreateModal()"
                        class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold smooth-transition">
                  Crear Caso
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CasesComponent {
  private readonly state = inject(StateService);

  // Filters State
  protected searchFilter = '';
  protected priorityFilter = 'todos';
  protected typeFilter = 'todos';

  // Modal State
  protected isModalOpen = signal(false);
  protected newCase = {
    title: '',
    clientName: '',
    type: 'Civil' as const,
    priority: 'media' as const,
    deadline: '',
    description: ''
  };

  // Drag and Drop active item
  private draggedCase: Case | null = null;

  // Kanban Columns configuration
  protected readonly columns = [
    { status: 'ingesta' as CaseStatus, title: 'Ingesta / Análisis', dotColorClass: 'bg-slate-400' },
    { status: 'demanda' as CaseStatus, title: 'Prep. Demanda', dotColorClass: 'bg-amber-400' },
    { status: 'proceso' as CaseStatus, title: 'Proceso Judicial', dotColorClass: 'bg-indigo-500' },
    { status: 'sentencia' as CaseStatus, title: 'Sentencia / Fallo', dotColorClass: 'bg-emerald-500' }
  ];

  protected getCasesInColumn(status: CaseStatus): Case[] {
    const query = this.searchFilter.toLowerCase().trim();
    const priority = this.priorityFilter;
    const type = this.typeFilter;

    return this.state.cases().filter(c => {
      // Correct column status
      if (c.status !== status) return false;
      
      // Filter text
      if (query && !c.title.toLowerCase().includes(query) && !c.id.toLowerCase().includes(query) && !c.clientName.toLowerCase().includes(query)) {
        return false;
      }
      
      // Filter priority
      if (priority !== 'todos' && c.priority !== priority) {
        return false;
      }
      
      // Filter type
      if (type !== 'todos' && c.type !== type) {
        return false;
      }

      return true;
    });
  }

  // HTML5 Drag and Drop events
  onDragStart(c: Case) {
    this.draggedCase = c;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Required to allow dropping!
  }

  onDrop(event: DragEvent, status: CaseStatus) {
    event.preventDefault();
    if (this.draggedCase && this.draggedCase.status !== status) {
      this.state.updateCaseStatus(this.draggedCase.id, status);
    }
    this.draggedCase = null;
  }

  moveStageMobile(event: Event, c: Case, direction: 'prev' | 'next') {
    event.stopPropagation();
    const statuses: CaseStatus[] = ['ingesta', 'demanda', 'proceso', 'sentencia'];
    const currentIndex = statuses.indexOf(c.status);
    
    if (direction === 'prev' && currentIndex > 0) {
      this.state.updateCaseStatus(c.id, statuses[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < statuses.length - 1) {
      this.state.updateCaseStatus(c.id, statuses[currentIndex + 1]);
    }
  }

  selectCase(id: string) {
    this.state.selectedCaseId.set(id);
  }

  // Modal Actions
  openCreateModal() {
    // Set default deadline to today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    this.newCase.deadline = tomorrow.toISOString().substring(0, 10);
    this.isModalOpen.set(true);
  }

  closeCreateModal() {
    this.isModalOpen.set(false);
    this.newCase = {
      title: '',
      clientName: '',
      type: 'Civil',
      priority: 'media',
      deadline: '',
      description: ''
    };
  }

  createCase(event: Event) {
    event.preventDefault();
    if (!this.newCase.title.trim() || !this.newCase.clientName.trim() || !this.newCase.deadline) return;

    const newId = '2026-' + Math.floor(100 + Math.random() * 900) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26));

    const finalCase: Case = {
      id: newId,
      title: this.newCase.title,
      clientName: this.newCase.clientName,
      lawyerName: 'Abog. María Elena',
      type: this.newCase.type,
      status: 'ingesta',
      priority: this.newCase.priority,
      deadline: this.newCase.deadline,
      docsCount: 0,
      docsTotal: 3,
      commentsCount: 0,
      progress: 0,
      description: this.newCase.description || 'Sin descripción adicional.',
      recentActivity: 'Caso registrado en sistema. Fase de ingesta y análisis.',
      milestones: [
        { id: 'm_' + Math.random().toString(36).substring(2, 5), title: 'Ingesta y Análisis de Documentación', date: this.newCase.deadline, completed: false, description: 'Revisión preliminar del expediente y pruebas.' },
        { id: 'm_' + Math.random().toString(36).substring(2, 5), title: 'Formulación Jurídica e Instrucción', date: '', completed: false, description: 'Estudio de fundamentos y preparación de defensa.' }
      ]
    };

    this.state.addCase(finalCase);
    
    // Add real-time notification
    this.state.addNotification({
      title: 'Nuevo Caso Registrado',
      message: `Se registró el Caso "${finalCase.title}" (#${finalCase.id}) de fuero ${finalCase.type} asignado a Abog. María Elena.`,
      time: 'Hace un momento',
      priority: 'normal',
      caseId: finalCase.id
    });

    this.closeCreateModal();
  }
}
