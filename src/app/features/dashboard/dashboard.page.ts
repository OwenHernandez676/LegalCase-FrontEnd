import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '@shared/components/priority-chip/priority-chip.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { AuthStore } from '@core/store/auth.store';
import { CasesService } from '@core/services/cases.service';
import { RequestsService } from '@core/services/requests.service';
import { CatalogService } from '@core/services/catalog.service';
import { EventsService, monthShort } from '@core/services/events.service';
import { MessagesService } from '@core/services/messages.service';
import { CaseStatus, LegalCase, LegalDocument, Priority, RequestStatus } from '@core/models';
import { CaseTimelineComponent } from '@features/cases/components/case-timeline/case-timeline.component';

/** Respaldo visual mientras cargan los expedientes del backend. */
const EMPTY_CASE: LegalCase = {
  id: '', codigo: '—', titulo: 'Sin expediente asignado', cliente: '', abogado: 'Sin asignar',
  tipo: 'Otro', estado: 'Pendiente', prioridad: 'Baja', progreso: 0, docs: 0,
  opened: '—', due: '—', next: '—',
};

const PRIORITY_DEFS: { label: Priority; color: string }[] = [
  { label: 'Crítica', color: '#6B5599' },
  { label: 'Alta', color: '#BB4138' },
  { label: 'Media', color: '#C07E25' },
  { label: 'Baja', color: '#2E6CA8' },
];
const DONUT_R = 54;
const DONUT_C = 2 * Math.PI * DONUT_R;

@Component({
  selector: 'lex-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeadComponent, PanelComponent, KpiCardComponent, AvatarComponent,
            IconComponent, StatusChipComponent, PriorityChipComponent, ChipComponent, CaseTimelineComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly auth = inject(AuthStore);
  readonly cases = inject(CasesService);
  readonly requests = inject(RequestsService);
  readonly catalog = inject(CatalogService);
  readonly eventsSvc = inject(EventsService);
  private readonly messages = inject(MessagesService);
  private readonly router = inject(Router);

  readonly role = this.auth.role;
  readonly recentCases = computed(() => this.cases.cases().slice(0, 4));
  readonly recentRequests = computed(() => this.requests.requests().slice(0, 4));

  // ---- Dashboard del abogado — KPIs reales ----
  /** Expedientes del abogado en estado "En proceso" (avance real, sin tareas). */
  readonly casesInProgress = computed(() =>
    this.cases.cases().filter((c) => c.estado === ('En proceso' as CaseStatus)).length);

  /** Audiencias de esta semana vinculadas a los expedientes del abogado. */
  readonly audienciasWeek = computed(() => {
    const today = new Date();
    const dayN = today.getDay(); // 0=Dom
    const startMs = new Date(today).setHours(0, 0, 0, 0) - dayN * 86400000;
    const endMs = startMs + 7 * 86400000;
    const myCaseIds = new Set(this.cases.cases().map((c) => c.id));
    return this.eventsSvc.events().filter((e) => {
      if (!e.caseId || !myCaseIds.has(e.caseId)) return false;
      if (e.type !== 'Audiencia') return false;
      const d = new Date(2026, e.month - 1, e.day).getTime();
      return d >= startMs && d < endMs;
    }).length;
  });

  /** Próximos eventos solo de los expedientes asignados al abogado. */
  readonly lawyerEvents = computed(() => {
    const myCaseIds = new Set(this.cases.cases().map((c) => c.id));
    return [...this.eventsSvc.events()]
      .filter((e) => e.caseId && myCaseIds.has(e.caseId))
      .sort((a, b) => (a.month - b.month) || (a.day - b.day))
      .slice(0, 5);
  });

  // ---- Portal del cliente ----
  /** Expediente del cliente autenticado (por nombre); nunca lanza con lista vacía. */
  readonly clientCase = computed<LegalCase>(() => {
    const all = this.cases.cases();
    const me = this.auth.user()?.nombre ?? '';
    return all.find((c) => c.cliente === me) ?? all[0] ?? EMPTY_CASE;
  });
  /** Documentos compartidos por el abogado en el caso del cliente. */
  readonly clientDocs = computed(() =>
    this.catalog.documents().filter((d) => d.caseId === this.clientCase().id));

  /** Descarga real de un documento del expediente del cliente. */
  downloadDoc(doc: LegalDocument): void { this.catalog.download(doc).subscribe({ error: () => {} }); }
  /** Abogado asignado al caso del cliente (datos completos del catálogo). */
  readonly assignedLawyer = computed(() => {
    const name = this.clientCase().abogado;
    return this.catalog.lawyers().find((l) => name.includes(l.nombre));
  });

  /** Va a Mensajes y abre la conversación con el abogado asignado. */
  sendMessage(): void {
    const conv = this.messages.forRole('cliente')[0];
    if (conv) this.messages.open(conv.id);
    this.router.navigate(['/app/messages']);
  }

  monthShort(m: number): string { return monthShort(m); }

  /** Abogados activos con su carga de casos, para el panel "Ocupación de abogados". */
  readonly lawyerLoad = computed(() =>
    this.catalog.activeLawyers().map((l) => ({
      ...l,
      casos: this.cases.cases().filter((c) => c.abogado === l.nombre).length,
    })));

  /** Color de chip para el estado de una solicitud (no de un caso). */
  reqChipKind(estado: RequestStatus): 'c-gray' | 'c-green' | 'c-red' {
    return estado === 'Pendiente' ? 'c-gray' : estado === 'Aprobada' ? 'c-green' : 'c-red';
  }

  /** Distribución de expedientes por prioridad para el gráfico de dona. */
  readonly priorityDist = computed(() => {
    const all = this.cases.cases();
    const total = all.length || 1;
    let acc = 0;
    return PRIORITY_DEFS.map((d) => {
      const value = all.filter((c) => c.prioridad === d.label).length;
      const len = (value / total) * DONUT_C;
      const seg = { ...d, value, dash: `${len} ${DONUT_C - len}`, offset: -acc };
      acc += len;
      return seg;
    });
  });
}
