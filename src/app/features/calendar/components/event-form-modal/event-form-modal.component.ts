import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CasesService } from '@core/services/cases.service';
import { EventInput } from '@core/services/events.service';
import { EventType } from '@core/models';

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

  readonly types: EventType[] = ['Audiencia', 'Reunión', 'Vencimiento', 'Seguimiento'];
  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);

  readonly form = this.fb.nonNullable.group({
    title: '',
    type: 'Audiencia' as EventType,
    day: 1,
    time: '09:00',
    caseId: '',
  });

  submit(): void {
    const v = this.form.getRawValue();
    if (!v.title.trim()) return;
    this.save.emit({ ...v, day: Number(v.day), title: v.title.trim() });
  }
}
