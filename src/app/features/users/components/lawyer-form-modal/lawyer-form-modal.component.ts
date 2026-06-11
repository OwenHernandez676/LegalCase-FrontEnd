import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

  readonly form = this.fb.nonNullable.group({
    nombre: '',
    correo: '',
    telefono: '',
    especialidad: this.specialties[0],
    activo: true,
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

  submit(): void {
    this.save.emit(this.form.getRawValue());
  }
}
