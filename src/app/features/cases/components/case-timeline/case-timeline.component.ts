import { Component, Input, computed, inject } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CaseActivityService } from '@core/services/case-activity.service';
import { CaseActivityType } from '@core/models';

const ACTIVITY_META: Record<CaseActivityType, { icon: any; color: string }> = {
  observacion: { icon: 'msg', color: '#6B5599' },
  documento: { icon: 'doc', color: '#2E6CA8' },
  estado: { icon: 'flag', color: '#C07E25' },
  evento: { icon: 'cal', color: '#BB4138' },
  creacion: { icon: 'check', color: '#2C7A57' },
};

/**
 * Línea de tiempo de un expediente (solo lectura). Lee de la fuente central
 * `CaseActivityService`, por lo que es la misma cronología que ve el abogado.
 * Se reutiliza en el modal del expediente y en el portal del cliente.
 */
@Component({
  selector: 'app-case-timeline',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="tl">
      @for (e of timeline(); track e.id; let last = $last) {
        <div class="tl-item" [class.last]="last">
          <span class="tl-dot" [style.background]="meta(e.tipo).color">
            <lex-icon [name]="meta(e.tipo).icon" [size]="13" color="#fff" /></span>
          <div class="tl-body">
            <b>{{ e.titulo }}</b>
            <span class="tl-time">{{ e.time }} · {{ e.autor }}</span>
            <p>{{ e.detalle }}</p>
          </div>
        </div>
      } @empty {
        <div class="empty"><div class="empty-ic"><lex-icon name="clock" [size]="28" /></div>
          <h3>Sin actividad</h3><p>Este expediente aún no registra movimientos.</p></div>
      }
    </div>
  `,
  styles: [`
    .tl-item{display:flex;gap:13px;position:relative;padding-bottom:18px}
    .tl-item:not(.last)::before{content:'';position:absolute;left:15px;top:30px;bottom:0;width:2px;background:var(--line)}
    .tl-dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:none;z-index:1}
    .tl-body{display:flex;flex-direction:column;gap:1px}
    .tl-body b{font-size:13.5px}
    .tl-time{font-size:11px;color:var(--ink-faint);font-weight:600}
    .tl-body p{font-size:12.5px;color:var(--ink-soft);margin-top:3px}
  `],
})
export class CaseTimelineComponent {
  @Input({ required: true }) caseId!: string;

  private readonly activity = inject(CaseActivityService);

  readonly timeline = computed(() => {
    this.activity.items(); // dependencia reactiva
    return this.activity.byCase(this.caseId);
  });

  meta(tipo: CaseActivityType): { icon: any; color: string } { return ACTIVITY_META[tipo]; }
}
