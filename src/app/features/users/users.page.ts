import { Component, inject, signal } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CatalogService, LawyerInput } from '@core/services/catalog.service';
import { ToastService } from '@shared/components/toast/toast.service';
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
  private readonly toast = inject(ToastService);
  readonly lawyers = this.catalog.lawyers;

  readonly showForm = signal(false);
  readonly editing = signal<User | null>(null);
  readonly viewing = signal<User | null>(null);

  openNew(): void { this.editing.set(null); this.showForm.set(true); }
  openEdit(l: User): void { this.editing.set(l); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.editing.set(null); }

  openView(l: User): void { this.viewing.set(l); }
  closeView(): void { this.viewing.set(null); }

  onSave(data: LawyerInput): void {
    const current = this.editing();
    if (current) {
      this.catalog.updateLawyer(current.id, data);
      this.toast.show({ title: 'Abogado actualizado correctamente', tone: 'success' });
    } else {
      this.catalog.addLawyer(data);
      this.toast.show({ title: 'Abogado guardado correctamente', tone: 'success' });
    }
    this.closeForm();
  }

  toggleActive(l: User): void {
    this.catalog.setLawyerActive(l.id, !l.activo);
    this.toast.show({
      title: l.activo ? 'Abogado inhabilitado' : 'Abogado rehabilitado',
      msg: l.nombre,
      tone: l.activo ? 'warn' : 'success',
    });
  }
}
