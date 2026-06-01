import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { TimelineComponent } from '../../shared/components/timeline/timeline';
import { Case, LegalEvent, LegalDocument } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, TimelineComponent],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-3xl font-display font-bold text-primary-deep">
            @if (role() === 'lawyer') { Dashboard Legal }
            @else if (role() === 'client') { Portal del Cliente }
            @else { Consola de Control Administrativo }
          </h1>
          <p class="text-slate-500 text-sm mt-1">
            @if (role() === 'lawyer') { Gestión de actividades, audiencias y expedientes para hoy. }
            @else if (role() === 'client') { Seguimiento transparente del progreso de tu caso legal en tiempo real. }
            @else { Resumen de operaciones y KPIs del bufete. }
          </p>
        </div>
        
        <!-- Date display -->
        <div class="text-right hidden md:block">
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hoy es</p>
          <p class="text-sm font-semibold text-slate-700">{{ today | date:'EEEE, d de MMMM yyyy' }}</p>
        </div>
      </div>

      <!-- 1. VISTA ABOGADO -->
      @if (role() === 'lawyer') {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Mis Casos Activos</p>
              <h3 class="text-3xl font-bold font-display text-slate-900 mt-1.5">{{ lawyerCasesCount() }}</h3>
              <p class="text-xs text-slate-500 mt-1">Asignados a mí</p>
            </div>
            <div class="bg-indigo-50 p-3 rounded-lg text-indigo-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Plazos Urgentes</p>
              <h3 class="text-3xl font-bold font-display text-rose-600 mt-1.5">{{ urgentPlazosCount() }}</h3>
              <p class="text-xs text-rose-500 font-semibold mt-1">Próximos 7 días</p>
            </div>
            <div class="bg-rose-50 p-3 rounded-lg text-rose-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Horas Registradas (Mes)</p>
              <h3 class="text-3xl font-bold font-display text-slate-900 mt-1.5">32.5h</h3>
              <p class="text-xs text-emerald-600 font-semibold mt-1">⚡ +12% vs. mes anterior</p>
            </div>
            <div class="bg-emerald-50 p-3 rounded-lg text-emerald-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Body Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendar hearings agenda -->
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h2 class="text-lg font-bold font-display text-slate-900 flex items-center">
              <span class="block h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              Agenda y Audiencias Recientes
            </h2>
            
            <div class="divide-y divide-slate-100">
              @for (ev of events(); track ev.id) {
                <div class="py-3.5 flex items-start justify-between group smooth-transition">
                  <div class="space-y-1">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
                            [ngClass]="{
                              'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10': ev.type === 'audiencia',
                              'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10': ev.type === 'plazo',
                              'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10': ev.type === 'reunion'
                            }">
                        {{ ev.type | uppercase }}
                      </span>
                      <h4 class="text-sm font-semibold text-slate-800">{{ ev.title }}</h4>
                    </div>
                    <p class="text-xs text-slate-500">{{ ev.caseTitle }}</p>
                    <p class="text-xs text-slate-400">{{ ev.description }}</p>
                  </div>
                  <div class="text-right flex-shrink-0 ml-4">
                    <span class="text-xs font-semibold text-slate-700 block">{{ ev.time }}</span>
                    <span class="text-[11px] text-slate-400 font-medium">{{ ev.date | date:'dd MMM' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Activity logs sidebar -->
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 class="text-lg font-bold font-display text-slate-900">Actividad Reciente</h2>
            <div class="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              @for (log of activityLogs(); track log.id) {
                <div class="flex items-start space-x-3 text-xs leading-normal">
                  <app-avatar [name]="log.user" size="sm"></app-avatar>
                  <div class="flex-1">
                    <p class="text-slate-800">
                      <span class="font-bold text-slate-900">{{ log.user }}</span> {{ log.action }}
                    </p>
                    <span class="text-[10px] text-slate-400 block mt-0.5">{{ log.time }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- 2. VISTA CLIENTE -->
      @else if (role() === 'client') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Left Panel: Case details and timeline -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Active Case Header -->
            @if (activeCase()) {
              <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-1">
                      Expediente: #{{ activeCase()!.id }}
                    </span>
                    <h2 class="text-xl font-bold font-display text-slate-900">{{ activeCase()!.title }}</h2>
                    <p class="text-sm text-slate-500 mt-1">Abogado Asignado: <span class="font-semibold text-slate-700">{{ activeCase()!.lawyerName }}</span></p>
                  </div>
                  
                  <div class="text-left sm:text-right">
                    <span class="text-xs text-slate-400 block">Siguiente Hito Crítico</span>
                    <span class="text-sm font-semibold text-rose-500">{{ activeCase()!.deadline | date:'dd de MMMM, yyyy' }}</span>
                  </div>
                </div>

                <hr class="border-slate-100" />

                <!-- Case Progress -->
                <div>
                  <div class="flex justify-between items-baseline mb-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Avance Legal</span>
                    <span class="text-sm font-bold text-indigo-600">{{ activeCase()!.progress }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" [style.width.%]="activeCase()!.progress"></div>
                  </div>
                </div>
              </div>

              <!-- Milestones Timeline Card -->
              <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
                <h3 class="text-lg font-bold font-display text-slate-900">Historial y Flujo del Juicio</h3>
                <app-timeline [caseId]="activeCase()!.id" [milestones]="activeCase()!.milestones" [editable]="false"></app-timeline>
              </div>
            } @else {
              <div class="bg-white p-6 rounded-xl border border-slate-200/80 text-center py-12 text-slate-400">
                No tienes casos asociados en este momento.
              </div>
            }
          </div>

          <!-- Right Sidebar Panel: Documents & Chat -->
          <div class="space-y-6">
            <!-- Pending Signature Docs -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Firma Digital Requerida</h3>
              
              @if (pendingClientDocs().length === 0) {
                <div class="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <svg class="h-5 w-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                  </svg>
                  <span>¡Todo al día! No tienes documentos pendientes de firma.</span>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (doc of pendingClientDocs(); track doc.id) {
                    <div class="p-3 bg-rose-50/50 rounded-lg border border-rose-100 flex flex-col space-y-2.5">
                      <div class="flex items-start justify-between gap-1.5">
                        <div class="min-w-0">
                          <p class="text-xs font-bold text-slate-900 truncate" [title]="doc.name">{{ doc.name }}</p>
                          <p class="text-[10px] text-slate-400">{{ doc.size }} | Subido: {{ doc.dateAdded }}</p>
                        </div>
                        <span class="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 flex-shrink-0">
                          Firma Pendiente
                        </span>
                      </div>
                      
                      <button type="button" 
                              class="w-full py-1.5 text-center text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg smooth-transition"
                              (click)="signDocument(doc)">
                        Firmar Digitalmente
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Client-Lawyer Chat Component -->
            <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[400px] overflow-hidden">
              <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
                <app-avatar name="María Elena" size="sm" status="online"></app-avatar>
                <div>
                  <h4 class="text-xs font-bold text-slate-800">Abog. María Elena</h4>
                  <span class="text-[10px] text-emerald-500 font-semibold flex items-center">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    En línea ahora
                  </span>
                </div>
              </div>
              
              <!-- Chat Area -->
              <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                @for (msg of chatMessages(); track msg.id) {
                  <div class="flex flex-col" [ngClass]="{ 'items-end': msg.sender === 'client', 'items-start': msg.sender !== 'client' }">
                    <div class="max-w-[80%] rounded-xl p-2.5 text-xs shadow-sm"
                         [ngClass]="{
                           'bg-indigo-600 text-white rounded-tr-none': msg.sender === 'client',
                           'bg-white text-slate-800 border border-slate-200 rounded-tl-none': msg.sender !== 'client'
                         }">
                      <p class="leading-normal">{{ msg.text }}</p>
                    </div>
                    <span class="text-[9px] text-slate-400 mt-1 font-medium px-1">{{ msg.time }}</span>
                  </div>
                }
              </div>

              <!-- Input Area -->
              <form (submit)="sendChatMessage($event)" class="p-3 border-t border-slate-200 flex space-x-2 bg-white">
                <input type="text"
                       name="messageInput"
                       [(ngModel)]="newChatMessage"
                       placeholder="Escribe tu consulta aquí..."
                       class="flex-1 border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       autocomplete="off" />
                <button type="submit" 
                        class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg smooth-transition">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- 3. VISTA ADMINISTRADOR -->
      @else {
        <!-- Global Stats KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Facturación Mensual</p>
            <h3 class="text-2xl font-bold font-display text-slate-900 mt-1.5">$128,450.00</h3>
            <p class="text-xs text-emerald-600 font-semibold mt-1">📈 +8.4% vs. mes anterior</p>
          </div>
          
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Casos Totales Activos</p>
            <h3 class="text-2xl font-bold font-display text-slate-900 mt-1.5">42 Casos</h3>
            <p class="text-xs text-slate-500 mt-1">12 en ingesta inicial</p>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider font-display">Tasa de Éxito Litigios</p>
            <h3 class="text-2xl font-bold font-display text-emerald-600 mt-1.5">92.4%</h3>
            <p class="text-xs text-slate-500 mt-1">Meta bufete: 85%</p>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Eficiencia de Abogados</p>
            <h3 class="text-2xl font-bold font-display text-indigo-600 mt-1.5">98.2%</h3>
            <p class="text-xs text-slate-500 mt-1">Horas productivas cargadas</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Workload distribution by lawyer -->
          <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-6">
            <h3 class="text-lg font-bold font-display text-slate-900 flex items-center">
              <span class="block h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
              Distribución de Casos y Capacidad de Abogados
            </h3>
            
            <div class="space-y-4">
              <!-- Lawyer 1 -->
              <div>
                <div class="flex justify-between items-baseline mb-1.5 text-xs font-semibold text-slate-700">
                  <div class="flex items-center space-x-2">
                    <app-avatar name="María Elena" size="sm"></app-avatar>
                    <span>Abog. María Elena (Socia Senior)</span>
                  </div>
                  <span>10 Casos (83% Capacidad)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="bg-rose-500 h-2.5 rounded-full transition-all" style="width: 83%"></div>
                </div>
              </div>

              <!-- Lawyer 2 -->
              <div>
                <div class="flex justify-between items-baseline mb-1.5 text-xs font-semibold text-slate-700">
                  <div class="flex items-center space-x-2">
                    <app-avatar name="Carlos Ruiz" size="sm"></app-avatar>
                    <span>Abog. Carlos Ruiz (Litigante)</span>
                  </div>
                  <span>8 Casos (66% Capacidad)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="bg-amber-500 h-2.5 rounded-full transition-all" style="width: 66%"></div>
                </div>
              </div>

              <!-- Lawyer 3 -->
              <div>
                <div class="flex justify-between items-baseline mb-1.5 text-xs font-semibold text-slate-700">
                  <div class="flex items-center space-x-2">
                    <app-avatar name="Juan Pérez" size="sm"></app-avatar>
                    <span>Abog. Juan Pérez (Junior)</span>
                  </div>
                  <span>6 Casos (50% Capacidad)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="bg-indigo-600 h-2.5 rounded-full transition-all" style="width: 50%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Global Reports -->
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Reportes Rápidos</h3>
            <div class="space-y-2">
              <a href="#" (click)="$event.preventDefault()" class="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 smooth-transition">
                <span>Descargar Balance del Mes</span>
                <span class="text-indigo-600">PDF →</span>
              </a>
              <a href="#" (click)="$event.preventDefault()" class="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 smooth-transition">
                <span>Rendimiento de Litigios</span>
                <span class="text-indigo-600">CSV →</span>
              </a>
              <a href="#" (click)="$event.preventDefault()" class="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 smooth-transition">
                <span>Auditoría de Acceso GDPR</span>
                <span class="text-indigo-600">XLSX →</span>
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  private readonly state = inject(StateService);

  protected readonly role = this.state.activeRole;
  protected readonly cases = this.state.cases;
  protected readonly events = this.state.events;
  protected readonly activityLogs = this.state.activityLogs;
  protected readonly activeCase = this.state.activeCase;
  protected readonly documents = this.state.documents;

  protected readonly today = new Date();

  // Chat signals
  protected readonly chatMessages = signal([
    { id: '1', sender: 'lawyer', text: 'Buenos días estimado Jorge, he terminado de revisar la contestación para la Inmobiliaria Varela.', time: 'Hace 4 horas' },
    { id: '2', sender: 'client', text: 'Excelente abogada, ¿se presentará esta semana?', time: 'Hace 3 horas' },
    { id: '3', sender: 'lawyer', text: 'Correcto, ya redacté el escrito. Solamente requiero que firmes digitalmente el Contrato de Honorarios adjunto a la derecha para proceder.', time: 'Hace 2 horas' }
  ]);
  protected newChatMessage = '';

  // Helpers
  protected lawyerCasesCount = computed(() => {
    return this.cases().filter(c => c.lawyerName === 'Abog. María Elena').length;
  });

  protected urgentPlazosCount = computed(() => {
    return this.events().filter(e => e.type === 'plazo' || e.type === 'audiencia').length;
  });

  protected pendingClientDocs = computed(() => {
    return this.documents().filter(d => d.caseId === '2026-902-A' && d.signatureStatus === 'pendiente');
  });

  signDocument(doc: LegalDocument) {
    this.state.signDocument(doc.id, 'Jorge Martínez');
  }

  sendChatMessage(event: Event) {
    event.preventDefault();
    if (!this.newChatMessage.trim()) return;

    // Add client message
    const clientMsg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: 'client',
      text: this.newChatMessage,
      time: 'Hace un momento'
    };
    this.chatMessages.update(all => [...all, clientMsg]);
    
    // Log active activity
    this.state.addActivityLog('Jorge Martínez (Cliente)', 'envió un mensaje de chat.');

    const tempText = this.newChatMessage;
    this.newChatMessage = '';

    // Simulate automated lawyer reply after 2 seconds
    setTimeout(() => {
      let replyText = 'Recibido. Lo reviso en breve y te respondo.';
      if (tempText.toLowerCase().includes('firma') || tempText.toLowerCase().includes('firmé')) {
        replyText = 'Perfecto, veo que has firmado el documento. Procederé a subir el escrito judicial firmado ante el Juzgado Civil hoy mismo.';
      }
      
      const lawyerMsg = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        sender: 'lawyer',
        text: replyText,
        time: 'Hace un momento'
      };
      
      this.chatMessages.update(all => [...all, lawyerMsg]);
      this.state.addNotification({
        title: 'Mensaje de Abogado',
        message: `La Abog. María Elena te envió un mensaje: "${replyText}"`,
        time: 'Hace un momento',
        priority: 'normal',
        caseId: '2026-902-A'
      });
      this.state.addActivityLog('Abog. María Elena', 'envió un mensaje de chat.');
    }, 2000);
  }
}
