import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CasesService } from '@core/services/cases.service';
import { EventInput, MONTHS_ES } from '@core/services/events.service';

@Component({
  selector: 'app-event-form-modal',
  standalone: true,
  imports: [ModalComponent, ReactiveFormsModule],
  templateUrl: './event-form-modal.component.html',
})
export class EventFormModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EventInput>();

  private readonly fb = inject(FormBuilder);
  readonly cases = inject(CasesService).cases;

  readonly months = MONTHS_ES;
  readonly types: ('Audiencia' | 'Reunión' | 'Vencimiento')[] = ['Audiencia', 'Reunión', 'Vencimiento'];

  readonly form = this.fb.nonNullable.group({
    title: '',
    type: 'Reunión' as 'Audiencia' | 'Reunión' | 'Vencimiento',
    description: '',
    month: 5,
    day: 1,
    time: '09:00',
    caseId: '',
  });

  /** Días válidos del mes seleccionado (año 2026). */
  days(): number[] {
    const m = Number(this.form.controls.month.value);
    const total = new Date(2026, m, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  submit(): void {
    const v = this.form.getRawValue();
    if (!v.title.trim()) return;
    const month = Number(v.month);
    const day = Math.min(Number(v.day), this.days().length);
    this.save.emit({
      title: v.title.trim(), type: v.type, description: v.description.trim(),
      month, day, time: v.time, caseId: v.caseId,
    });
  }
}
