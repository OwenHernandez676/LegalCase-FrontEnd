import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CaseType, Priority } from '@core/models';

@Component({
  selector: 'app-request-modal',
  standalone: true,
  imports: [ModalComponent, ReactiveFormsModule],
  templateUrl: './request-modal.component.html',
  styleUrl: './request-modal.component.scss',
})
export class RequestModalComponent {
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  step = 1;
  readonly totalSteps = 2;

  readonly caseTypes: CaseType[] = ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'];
  readonly priorities: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

  /** Formulario único del wizard: conserva los datos en memoria entre pasos. */
  readonly form = this.fb.nonNullable.group({
    cliente: '',
    correo: '',
    telefono: '',
    tipo: this.caseTypes[0] as CaseType,
    prioridad: this.priorities[1] as Priority,
    descripcion: '',
  });

  nextStep(): void {
    if (this.step < this.totalSteps) this.step++;
  }

  previousStep(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    alert('Solicitud capturada correctamente');
    console.log('Solicitud lista para enviar', this.form.getRawValue());
    this.close.emit();
  }
}
