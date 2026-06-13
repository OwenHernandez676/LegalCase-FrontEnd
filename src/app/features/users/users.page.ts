import { Component, computed, inject, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CatalogService, LawyerInput } from '@core/services/catalog.service';
import { CasesService } from '@core/services/cases.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { apiErrorMessage } from '@core/utils/http-error.util';
import { User } from '@core/models';
import { LawyerFormModalComponent } from './components/lawyer-form-modal/lawyer-form-modal.component';

@Component({
  selector: 'lex-users',
  standalone: true,
  imports: [PageHeadComponent, AvatarComponent, IconComponent, ChipComponent, ModalComponent, LawyerFormModalComponent],
  templateUrl: './users.page.html',
})
export class UsersPage {
  private readonly catalog = inject(CatalogService);
  private readonly cases = inject(CasesService);
  private readonly toast = inject(ToastService);

  /**
   * Abogados con su número de casos activos calculado en vivo desde el store
   * de expedientes: al asignar/finalizar un caso la tarjeta se actualiza sola.
   */
  readonly lawyers = computed(() =>
    this.catalog.lawyers().map((l) => ({
      ...l,
      casos: this.cases.cases().filter((c) => c.abogado === l.nombre && c.estado !== 'Finalizado').length,
    })));

  readonly showForm = signal(false);
  readonly editing = signal<User | null>(null);
  readonly viewing = signal<User | null>(null);
  /** En curso un POST/PATCH: deshabilita el botón de guardar del modal. */
  readonly saving = signal(false);

  openNew(): void { this.editing.set(null); this.showForm.set(true); }
  openEdit(l: User): void { this.editing.set(l); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.editing.set(null); }

  openView(l: User): void { this.viewing.set(l); }
  closeView(): void { this.viewing.set(null); }

  onSave(data: LawyerInput): void {
    if (this.saving()) return;
    const current = this.editing();
    const op$ = current
      ? this.catalog.updateLawyer(current.id, data)
      : this.catalog.addLawyer(data);

    this.saving.set(true);
    op$.subscribe({
      // Éxito solo tras respuesta 2xx del backend.
      next: () => {
        this.saving.set(false);
        this.toast.show({
          title: current ? 'Abogado actualizado correctamente' : 'Abogado guardado correctamente',
          tone: 'success',
        });
        this.closeForm();
      },
      // 400/401/403/404/409/500: muestra el mensaje real de la API y conserva el formulario abierto.
      error: (err) => {
        this.saving.set(false);
        this.toast.show({ title: 'No se pudo guardar el abogado', msg: apiErrorMessage(err), tone: 'warn' });
      },
    });
  }

  toggleActive(l: User): void {
    const willBeActive = !l.activo;
    this.catalog.setLawyerActive(l.id, willBeActive).subscribe({
      next: () => this.toast.show({
        title: willBeActive ? 'Abogado rehabilitado' : 'Abogado inhabilitado',
        msg: l.nombre,
        tone: willBeActive ? 'success' : 'warn',
      }),
      error: (err) => {
        this.catalog.loadLawyers(); // revierte el cambio optimista desde la BD
        this.toast.show({ title: 'No se pudo cambiar el estado', msg: apiErrorMessage(err), tone: 'warn' });
      },
    });
  }
}
