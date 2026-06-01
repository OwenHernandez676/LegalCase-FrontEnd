import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { LegalEvent } from '../../core/models/models';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
  events: LegalEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-3xl font-display font-bold text-primary-deep">Calendario de Audiencias y Plazos</h1>
          <p class="text-slate-500 text-sm mt-1">Control de fechas límites críticas y audiencias judiciales programadas.</p>
        </div>
        
        <div class="flex items-center space-x-3">
          <span class="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sync Google/Outlook Habilitada
          </span>
          <button type="button" 
                  (click)="openAddEventModal()"
                  class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm smooth-transition">
            + Agendar Evento
          </button>
        </div>
      </div>

      <!-- Calendar Controls & Legend -->
      <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex items-center space-x-4">
          <button (click)="prevMonth()" class="p-1.5 hover:bg-slate-100 rounded border border-slate-200 smooth-transition text-sm font-bold">‹</button>
          <h2 class="text-lg font-bold font-display text-slate-800">{{ currentMonthYear() }}</h2>
          <button (click)="nextMonth()" class="p-1.5 hover:bg-slate-100 rounded border border-slate-200 smooth-transition text-sm font-bold">›</button>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <span class="flex items-center"><span class="h-2.5 w-2.5 rounded-full bg-rose-500 mr-1.5"></span> Audiencias</span>
          <span class="flex items-center"><span class="h-2.5 w-2.5 rounded-full bg-amber-500 mr-1.5"></span> Plazos Límites</span>
          <span class="flex items-center"><span class="h-2.5 w-2.5 rounded-full bg-indigo-500 mr-1.5"></span> Reuniones</span>
        </div>
      </div>

      <!-- Main Calendar Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Calendar Grid -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-3">
          <!-- Days of Week Headers -->
          <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
          </div>

          <!-- Day Cells Grid -->
          <div class="grid grid-cols-7 grid-rows-5 border-slate-200 divide-x divide-y divide-slate-100">
            @for (day of calendarDays(); track day.dateString) {
              <div class="min-h-[100px] p-2 hover:bg-slate-50/50 smooth-transition flex flex-col group cursor-pointer"
                   [ngClass]="{
                     'bg-slate-50/30 text-slate-400': !day.isCurrentMonth,
                     'bg-indigo-50/20': day.isToday
                   }"
                   (click)="selectDay(day)">
                
                <!-- Day Number -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs font-bold" 
                        [ngClass]="{
                          'bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center': day.isToday,
                          'text-slate-700': day.isCurrentMonth && !day.isToday
                        }">
                    {{ day.dayNumber }}
                  </span>
                </div>

                <!-- Day Events List -->
                <div class="space-y-1 overflow-y-auto flex-1 max-h-[80px] pr-1">
                  @for (ev of day.events; track ev.id) {
                    <div class="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate"
                         [ngClass]="{
                           'bg-rose-50 text-rose-700 border-l-2 border-rose-500': ev.type === 'audiencia',
                           'bg-amber-50 text-amber-700 border-l-2 border-amber-500': ev.type === 'plazo',
                           'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500': ev.type === 'reunion'
                         }"
                         [title]="ev.title + ' - ' + ev.time">
                      {{ ev.title }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Selected Day Details Sidebar -->
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col space-y-4">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Eventos del {{ selectedDate() | date:'d de MMMM' }}
          </h3>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[450px]">
            @if (selectedDayEvents().length === 0) {
              <p class="text-xs text-slate-400 text-center py-8">No hay eventos ni plazos agendados para este día.</p>
            } @else {
              @for (ev of selectedDayEvents(); track ev.id) {
                <div class="p-3.5 rounded-lg border border-slate-100 space-y-2 hover:border-slate-200 smooth-transition"
                     [ngClass]="{
                       'bg-rose-50/30': ev.type === 'audiencia',
                       'bg-amber-50/30': ev.type === 'plazo',
                       'bg-indigo-50/30': ev.type === 'reunion'
                     }">
                  <div class="flex justify-between items-start gap-1">
                    <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                          [ngClass]="{
                            'bg-rose-500': ev.type === 'audiencia',
                            'bg-amber-500': ev.type === 'plazo',
                            'bg-indigo-500': ev.type === 'reunion'
                          }">
                      {{ ev.type }}
                    </span>
                    <span class="text-xs font-bold text-slate-600">{{ ev.time }}</span>
                  </div>
                  
                  <h4 class="text-xs font-bold text-slate-900 leading-snug">{{ ev.title }}</h4>
                  <p class="text-[10px] text-slate-500">Caso: {{ ev.caseTitle }}</p>
                  <p class="text-[10px] text-slate-400 leading-normal">{{ ev.description }}</p>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Add Event Modal Mock -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 class="font-bold text-slate-800 font-display">Agendar Evento Legal</h3>
              <button (click)="closeAddEventModal()" class="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            
            <form (submit)="createEvent($event)" class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título del Evento / Plazo</label>
                <input type="text" name="title" [(ngModel)]="newEvent.title" required
                       class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       placeholder="e.g. Presentar Escrito de Apelación" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Caso Asociado</label>
                <select name="caseId" [(ngModel)]="newEvent.caseIndex"
                        class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                  @for (c of cases(); track c.id; let idx = $index) {
                    <option [value]="idx">{{ c.title }} (#{{ c.id }})</option>
                  }
                </select>
              </div>
              
              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fecha</label>
                  <input type="date" name="date" [(ngModel)]="newEvent.date" required
                         class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hora</label>
                  <input type="text" name="time" [(ngModel)]="newEvent.time" required
                         class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                         placeholder="10:00 AM" />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo de Evento</label>
                  <select name="type" [(ngModel)]="newEvent.type"
                          class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                    <option value="audiencia">Audiencia Judicial</option>
                    <option value="plazo">Plazo Límite Procesal</option>
                    <option value="reunion">Reunión de Trabajo</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descripción Detallada</label>
                <textarea name="description" [(ngModel)]="newEvent.description" rows="2"
                          class="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Instrucciones adicionales para el equipo..."></textarea>
              </div>

              <div class="flex justify-end space-x-3 pt-2">
                <button type="button" (click)="closeAddEventModal()"
                        class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold smooth-transition">
                  Agendar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CalendarComponent {
  private readonly state = inject(StateService);

  protected readonly cases = this.state.cases;
  protected readonly events = this.state.events;

  // Selected Date state
  protected readonly selectedDate = signal<Date>(new Date(2026, 4, 23)); // Set to May 23, 2026 to match mock timeframe
  protected readonly isModalOpen = signal(false);

  // Form State
  protected newEvent = {
    title: '',
    caseIndex: 0,
    date: '',
    time: '10:00 AM',
    type: 'audiencia' as const,
    description: ''
  };

  // Month tracking state (fixed for demo to May 2026)
  protected readonly demoYear = signal(2026);
  protected readonly demoMonth = signal(4); // 0-indexed (4 = May)

  // Current Month Text
  protected readonly currentMonthYear = computed(() => {
    const d = new Date(this.demoYear(), this.demoMonth(), 1);
    const monthText = d.toLocaleString('es-ES', { month: 'long' });
    return monthText.charAt(0).toUpperCase() + monthText.slice(1) + ' ' + d.getFullYear();
  });

  // Calculate grid days for the month of May 2026 (or demo Month)
  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.demoYear();
    const month = this.demoMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Day of the week of first day (0 = Sunday, ..., 6 = Saturday)
    const startOffset = firstDay.getDay(); 
    
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: CalendarDay[] = [];
    
    // Previous month filler days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push(this.createCalendarDayObj(d, false));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDayObj(d, true));
    }
    
    // Next month filler days to complete rows (7 * 5 = 35 or 7 * 6 = 42 cells)
    const cellsTotal = days.length <= 35 ? 35 : 42;
    const nextMonthFiller = cellsTotal - days.length;
    for (let i = 1; i <= nextMonthFiller; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDayObj(d, false));
    }
    
    return days;
  });

  protected readonly selectedDayEvents = computed<LegalEvent[]>(() => {
    const selDateStr = this.selectedDate().toISOString().substring(0, 10);
    return this.events().filter(e => e.date === selDateStr);
  });

  private createCalendarDayObj(date: Date, isCurrentMonth: boolean): CalendarDay {
    const dateString = date.toISOString().substring(0, 10);
    
    // Check if it matches today (hardcoding today as 2026-05-23 for demo consistency)
    const isToday = dateString === '2026-05-23';

    // Find events on this date
    const dayEvents = this.events().filter(e => e.date === dateString);

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday,
      dateString,
      events: dayEvents
    };
  }

  selectDay(day: CalendarDay) {
    this.selectedDate.set(day.date);
  }

  prevMonth() {
    this.demoMonth.update(m => {
      if (m === 0) {
        this.demoYear.update(y => y - 1);
        return 11;
      }
      return m - 1;
    });
    // Update selected date to 1st of the new month
    this.selectedDate.set(new Date(this.demoYear(), this.demoMonth(), 1));
  }

  nextMonth() {
    this.demoMonth.update(m => {
      if (m === 11) {
        this.demoYear.update(y => y + 1);
        return 0;
      }
      return m + 1;
    });
    // Update selected date to 1st of the new month
    this.selectedDate.set(new Date(this.demoYear(), this.demoMonth(), 1));
  }

  // Modal Actions
  openAddEventModal() {
    this.newEvent.date = this.selectedDate().toISOString().substring(0, 10);
    this.newEvent.caseIndex = 0;
    this.isModalOpen.set(true);
  }

  closeAddEventModal() {
    this.isModalOpen.set(false);
    this.newEvent = {
      title: '',
      caseIndex: 0,
      date: '',
      time: '10:00 AM',
      type: 'audiencia',
      description: ''
    };
  }

  createEvent(event: Event) {
    event.preventDefault();
    if (!this.newEvent.title.trim() || !this.newEvent.date || !this.newEvent.time) return;

    const associatedCase = this.cases()[this.newEvent.caseIndex];

    const addedEvent: LegalEvent = {
      id: 'e_' + Math.random().toString(36).substring(2, 9),
      title: this.newEvent.title,
      caseId: associatedCase.id,
      caseTitle: associatedCase.title,
      date: this.newEvent.date,
      time: this.newEvent.time,
      type: this.newEvent.type,
      description: this.newEvent.description || 'Sin detalles adicionales.'
    };

    this.state.addEvent(addedEvent);

    // Notify lawyer
    this.state.addNotification({
      title: 'Nuevo Evento Agendado',
      message: `Se programó [${addedEvent.type.toUpperCase()}] "${addedEvent.title}" para el ${addedEvent.date} a las ${addedEvent.time}.`,
      time: 'Hace un momento',
      priority: addedEvent.type === 'plazo' || addedEvent.type === 'audiencia' ? 'urgente' : 'normal',
      caseId: associatedCase.id
    });

    this.closeAddEventModal();
  }
}
