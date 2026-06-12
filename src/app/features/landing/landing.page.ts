import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { RequestModalComponent } from '@features/requests/components/request-modal/request-modal.component';

@Component({
  selector: 'lex-landing',
  standalone: true,
  imports: [RouterLink, IconComponent, RequestModalComponent],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
})
export class LandingPage {
  showRequestModal = false;

  openRequestModal(): void { this.showRequestModal = true; }
  closeRequestModal(): void { this.showRequestModal = false; }

  readonly services = [
    { icon: 'inbox', title: 'Solicitudes legales', desc: 'Recepción y evaluación de consultas desde un formulario en línea.' },
    { icon: 'folder', title: 'Gestión de expedientes', desc: 'Todo el ciclo de vida del caso en un expediente centralizado.' },
    { icon: 'layers', title: 'Tablero Kanban', desc: 'Avance visual de los casos por estado, de un vistazo.' },
    { icon: 'cal', title: 'Calendario legal', desc: 'Audiencias, reuniones y vencimientos siempre a la vista.' },
    { icon: 'doc', title: 'Gestión documental', desc: 'Repositorio seguro organizado por expediente.' },
  ];
  readonly stats = [
    { v: '94%', l: 'Casos resueltos a favor' },
    { v: '42 min', l: 'Tiempo de respuesta' },
    { v: '500+', l: 'Expedientes gestionados' },
    { v: '98%', l: 'Satisfacción del cliente' },
  ];
}
