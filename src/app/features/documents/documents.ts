import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { LegalDocument, Case } from '../../core/models/models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-3xl font-display font-bold text-primary-deep">Bóveda Documental</h1>
          <p class="text-slate-500 text-sm mt-1">Expedientes digitalizados, pruebas y contratos con firma electrónica legal.</p>
        </div>
        
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <!-- Case Selector dropdown -->
          <div class="flex items-center space-x-2 w-full sm:w-auto">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Caso:</span>
            <select [ngModel]="selectedCaseId()"
                    (ngModelChange)="onCaseChange($event)"
                    class="border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 bg-white font-semibold text-slate-700 w-full sm:w-auto">
              @for (c of cases(); track c.id) {
                <option [value]="c.id">{{ c.title }} (#{{ c.id }})</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Search & Controls -->
      <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-80 relative">
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Buscar documentos en este caso..."
                 class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          <span class="absolute left-3 top-2.5 text-slate-400">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Auditoría en Cadena de Bloques Activa
          </span>
        </div>
      </div>

      <!-- Main Layout: Folder tree & File List -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <!-- Folders Sidebar -->
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estructura de Carpetas</h3>
          
          <nav class="space-y-1">
            @for (f of folders; track f.id) {
              <button (click)="selectFolder(f.id)"
                      class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg smooth-transition"
                      [ngClass]="{
                        'bg-indigo-50 text-indigo-700': activeFolder() === f.id,
                        'text-slate-600 hover:bg-slate-50 hover:text-slate-900': activeFolder() !== f.id
                      }">
                <div class="flex items-center space-x-2">
                  <!-- Folder icon svg -->
                  <svg class="h-4.5 w-4.5 text-slate-400 group-hover:text-slate-500"
                       [ngClass]="{ 'text-indigo-600': activeFolder() === f.id }"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>{{ f.name }}</span>
                </div>
                
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      [ngClass]="activeFolder() === f.id ? 'bg-indigo-200/50 text-indigo-800' : 'bg-slate-100 text-slate-400'">
                  {{ getDocCountByFolder(f.id) }}
                </span>
              </button>
            }
          </nav>
        </div>

        <!-- File List Panel -->
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm md:col-span-3 space-y-5">
          <!-- Folder Title and Actions -->
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-md font-bold font-display text-slate-800 flex items-center">
              📁 {{ getActiveFolderName() }}
            </h3>
            
            <button (click)="fileInput.click()" 
                    class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg smooth-transition">
              <span>Subir Archivo</span>
              <input #fileInput type="file" (change)="onFileUploaded($event)" class="hidden" />
            </button>
          </div>

          <!-- Document List Table -->
          <div class="overflow-x-auto">
            @if (filteredDocuments().length === 0) {
              <div class="text-center py-12 text-slate-400 space-y-3">
                <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p class="text-sm">No se encontraron documentos en esta carpeta.</p>
              </div>
            } @else {
              <table class="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr class="text-left text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th class="py-3 px-3">Nombre</th>
                    <th class="py-3 px-3">Tamaño</th>
                    <th class="py-3 px-3">Subido por</th>
                    <th class="py-3 px-3">Fecha</th>
                    <th class="py-3 px-3 text-right">Firma Digital</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 font-medium text-slate-700">
                  @for (doc of filteredDocuments(); track doc.id) {
                    <tr class="hover:bg-slate-50/50 smooth-transition">
                      <!-- Name and Extension Icon -->
                      <td class="py-3.5 px-3 flex items-center space-x-2">
                        <!-- File Icon -->
                        <span class="p-1.5 rounded bg-indigo-50 text-indigo-600">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </span>
                        
                        <div class="truncate max-w-[150px] sm:max-w-[250px]">
                          <p class="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer" [title]="doc.name">{{ doc.name }}</p>
                          <p class="text-[10px] text-slate-400">ID: {{ doc.id }}</p>
                        </div>
                      </td>

                      <!-- Size -->
                      <td class="py-3.5 px-3 text-slate-500">{{ doc.size }}</td>

                      <!-- Uploaded By -->
                      <td class="py-3.5 px-3 text-slate-600">{{ doc.uploadedBy }}</td>

                      <!-- Date -->
                      <td class="py-3.5 px-3 text-slate-500">{{ doc.dateAdded | date:'dd MMM yyyy' }}</td>

                      <!-- Signature status & action -->
                      <td class="py-3.5 px-3 text-right">
                        @if (doc.signatureStatus === 'firmado') {
                          <span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                            ✔ Firmado Digital
                          </span>
                        } @else if (doc.signatureStatus === 'pendiente') {
                          @if (role() === 'client') {
                            <!-- Client can click to sign -->
                            <button type="button" 
                                    (click)="signDocument(doc)"
                                    class="inline-flex items-center justify-center px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded smooth-transition">
                              Firmar Digitalmente
                            </button>
                          } @else {
                            <!-- Lawyer sees pending badge and can mock request it -->
                            <span class="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/10 cursor-pointer"
                                  (click)="requestClientSignature(doc)"
                                  title="Haga clic para simular solicitud de firma">
                              ✍ Pendiente Firma
                            </span>
                          }
                        } @else {
                          <span class="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            No Requerida
                          </span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <!-- Drag and Drop Mock Zone -->
          <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50/50 hover:border-indigo-300 smooth-transition group cursor-pointer relative"
               (dragover)="onDragOver($event)"
               (drop)="onDropUpload($event)">
            <svg class="mx-auto h-8 w-8 text-slate-400 group-hover:text-indigo-500 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-xs font-bold text-slate-700 mt-2">Arrastra y suelta expedientes para cargarlos en esta carpeta</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Soporta PDF, DOCX, XLSX hasta 25MB por archivo</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DocumentsComponent {
  private readonly state = inject(StateService);

  protected readonly cases = this.state.cases;
  protected readonly selectedCaseId = this.state.selectedCaseId;
  protected readonly activeFolder = this.state.selectedFolder;
  protected readonly documents = this.state.documents;
  protected readonly role = this.state.activeRole;

  protected searchQuery = '';

  // Folders list definition
  protected readonly folders = [
    { id: 'pruebas', name: 'Pruebas Presentadas' },
    { id: 'escritos', name: 'Escritos Judiciales' },
    { id: 'contratos', name: 'Contratos e Instrumentos' },
    { id: 'resoluciones', name: 'Resoluciones y Sentencias' }
  ];

  protected getActiveFolderName(): string {
    return this.folders.find(f => f.id === this.activeFolder())?.name || 'Documentos';
  }

  protected getDocCountByFolder(folderId: string): number {
    return this.documents().filter(d => d.caseId === this.selectedCaseId() && d.folder === folderId).length;
  }

  protected readonly filteredDocuments = computed<LegalDocument[]>(() => {
    const caseId = this.selectedCaseId();
    const folder = this.activeFolder();
    const query = this.searchQuery.toLowerCase().trim();

    return this.documents().filter(d => {
      if (d.caseId !== caseId) return false;
      if (d.folder !== folder) return false;
      if (query && !d.name.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  onCaseChange(newCaseId: string) {
    this.selectedCaseId.set(newCaseId);
  }

  selectFolder(folderId: string) {
    this.activeFolder.set(folderId);
  }

  signDocument(doc: LegalDocument) {
    this.state.signDocument(doc.id, this.role() === 'client' ? 'Jorge Martínez' : 'Abog. María Elena');
  }

  requestClientSignature(doc: LegalDocument) {
    // Simulator trigger: alerts client
    this.state.addNotification({
      title: 'Firma Solicitada',
      message: `Se ha notificado al cliente Jorge Martínez para que firme el documento "${doc.name}".`,
      time: 'Hace un momento',
      priority: 'normal',
      caseId: doc.caseId
    });

    this.state.addActivityLog('Abog. María Elena', `solicitó la firma digital del contrato "${doc.name}".`);
  }

  onFileUploaded(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.simulateUpload(file.name, file.size);
    }
  }

  // HTML5 drag and drop upload simulation
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDropUpload(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.simulateUpload(file.name, file.size);
    }
  }

  private simulateUpload(fileName: string, sizeBytes: number) {
    const activeCaseObj = this.cases().find(c => c.id === this.selectedCaseId());
    if (!activeCaseObj) return;

    // Convert size to human readable
    const sizeKB = sizeBytes / 1024;
    const sizeStr = sizeKB > 1024 
      ? (sizeKB / 1024).toFixed(1) + ' MB'
      : Math.round(sizeKB) + ' KB';

    const newDoc: LegalDocument = {
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      name: fileName,
      caseId: activeCaseObj.id,
      caseTitle: activeCaseObj.title,
      folder: this.activeFolder() as any,
      size: sizeStr,
      dateAdded: new Date().toISOString().substring(0, 10),
      uploadedBy: this.role() === 'client' ? 'Jorge Martínez (Cliente)' : 'Abog. María Elena',
      signatureStatus: this.activeFolder() === 'contratos' ? 'pendiente' : 'no_requerida'
    };

    this.state.addDocument(newDoc);

    // Notify role
    this.state.addNotification({
      title: 'Archivo Cargado',
      message: `Se cargó el documento "${newDoc.name}" en la carpeta ${this.getActiveFolderName()}.`,
      time: 'Hace un momento',
      priority: 'normal',
      caseId: activeCaseObj.id
    });
  }
}
