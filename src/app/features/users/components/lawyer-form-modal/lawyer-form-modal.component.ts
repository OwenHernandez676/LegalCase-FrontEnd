import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { LawyerInput } from '@core/services/catalog.service';
import { User } from '@core/models';

@Component({
  selector: 'app-lawyer-form-modal',
  standalone: true,
  imports: [ModalComponent, ReactiveFormsModule],
  templateUrl: './lawyer-form-modal.component.html',
})
export class LawyerFormModalComponent {
  /** Si se recibe un abogado, el modal opera en modo edición. */
  @Input() lawyer: User | null = null;
  /** El padre indica si hay un POST/PATCH en curso (deshabilita el guardar). */
  @Input() saving = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LawyerInput>();

  private readonly fb = inject(FormBuilder);

  readonly specialties = [
    'Derecho Civil',
    'Derecho Penal',
    'Derecho Laboral',
    'Derecho Mercantil',
    'Derecho de Familia',
  ];

  // Reglas alineadas con CreateUserDto del backend (nombre 3-120, correo email).
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    especialidad: [this.specialties[0], [Validators.required]],
    activo: [true],
  });

  ngOnInit(): void {
    if (this.lawyer) {
      this.form.patchValue({
        nombre: this.lawyer.nombre,
        correo: this.lawyer.correo,
        telefono: this.lawyer.telefono ?? '',
        especialidad: this.lawyer.especialidad ?? this.specialties[0],
        activo: this.lawyer.activo,
      });
    }
  }

  get isEdit(): boolean { return this.lawyer !== null; }

  /** Marca un control como inválido y tocado para pintar el error en la plantilla. */
  invalid(control: 'nombre' | 'correo' | 'telefono' | 'especialidad'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  submit(): void {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // valida ANTES de enviar; muestra los errores
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
