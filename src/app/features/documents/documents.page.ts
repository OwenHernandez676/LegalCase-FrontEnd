import { Component, inject } from '@angular/core';
import { PageHeadComponent } from '@shared/components/page-head/page-head.component';
import { PanelComponent } from '@shared/components/panel/panel.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { CatalogService } from '@core/services/catalog.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { FileType } from '@core/models';

@Component({
  selector: 'lex-documents',
  standalone: true,
  imports: [PageHeadComponent, PanelComponent, IconComponent, ChipComponent],
  templateUrl: './documents.page.html',
})
export class DocumentsPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  readonly docs = this.catalog.documents;

  kind(ext: FileType): any { return ext === 'PDF' ? 'c-red' : ext === 'DOCX' ? 'c-blue' : 'c-green'; }
  upload(): void { this.toast.show({ title: 'Subir documento', msg: 'Demo: integración con backend pendiente', tone: 'info' }); }
  download(name: string): void { this.toast.show({ title: 'Descargando', msg: name, tone: 'gold' }); }
}
