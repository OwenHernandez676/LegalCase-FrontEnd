import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { RequestsService } from '@core/services/requests.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { apiErrorMessage } from '@core/utils/http-error.util';
import { CaseType, Priority } from '@core/models';

/** Campos de cada paso del wizard, para validar antes de avanzar/enviar. */
const STEP1 = ['cliente', 'correo', 'telefono'] as const;

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
  private readonly requests = inject(RequestsService);
  private readonly toast = inject(ToastService);

  readonly sending = signal(false);

  step = 1;
  readonly totalSteps = 2;

  readonly caseTypes: CaseType[] = ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'];
  readonly priorities: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

  /**
   * Formulario único del wizard: conserva los datos entre pasos.
   * Reglas alineadas con CreateRequestDto del backend (cliente 3-120,
   * correo email, teléfono 8-30, descripción 20-2000).
   */
  readonly form = this.fb.nonNullable.group({
    cliente: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    tipo: [this.caseTypes[0] as CaseType, [Validators.required]],
    prioridad: [this.priorities[1] as Priority, [Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
  });

  /** Pinta el error de un campo cuando es inválido y ya fue tocado. */
  invalid(control: 'cliente' | 'correo' | 'telefono' | 'descripcion'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  nextStep(): void {
    if (this.step >= this.totalSteps) return;
    // Valida el paso 1 antes de avanzar.
    if (STEP1.some((k) => this.form.controls[k].invalid)) {
      STEP1.forEach((k) => this.form.controls[k].markAsTouched());
      return;
    }
    this.step++;
  }

  previousStep(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    if (this.sending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Si el dato inválido está en el paso 1, regresa para mostrarlo.
      if (STEP1.some((k) => this.form.controls[k].invalid)) this.step = 1;
      return;
    }

    this.sending.set(true);
    this.requests.create(this.form.getRawValue()).subscribe({
      // Éxito solo tras respuesta 2xx del backend.
      next: (created) => {
        this.sending.set(false);
        this.toast.show({
          title: 'Solicitud enviada correctamente',
          msg: `${created.codigo ?? ''} · Le contactaremos a la brevedad`.trim(),
          tone: 'success',
        });
        this.close.emit();
      },
      // 400/409/500: muestra el mensaje real de la API (no un texto fijo).
      error: (err) => {
        this.sending.set(false);
        this.toast.show({ title: 'No se pudo enviar la solicitud', msg: apiErrorMessage(err), tone: 'warn' });
      },
    });
  }
}
