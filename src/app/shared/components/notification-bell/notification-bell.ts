import { Component, HostListener, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../core/services/state.service';
import { SystemNotification } from '../../../core/models/models';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Bell Icon Button -->
      <button type="button"
              class="relative p-1.5 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 smooth-transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              (click)="toggleDropdown()">
        <span class="sr-only">Ver Notificaciones</span>
        <!-- SVG Bell -->
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        
        <!-- Red Badge Count -->
        @if (unreadCount() > 0) {
          <span class="absolute top-0 right-0 block h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center translate-x-1/3 -translate-y-1/3 animate-pulse">
            {{ unreadCount() }}
          </span>
        }
      </button>

      <!-- Glassmorphic Dropdown Menu -->
      @if (isOpen()) {
        <div class="absolute right-0 mt-2.5 w-80 md:w-96 rounded-xl shadow-lg border border-slate-200/60 bg-white/95 backdrop-blur-md ring-1 ring-black/5 focus:outline-none z-50 divide-y divide-slate-100 overflow-hidden transform origin-top-right transition duration-200 ease-out">
          <!-- Header -->
          <div class="p-3.5 flex justify-between items-center bg-slate-50/50">
            <h3 class="text-sm font-semibold text-slate-800">Centro de Notificaciones</h3>
            @if (unreadCount() > 0) {
              <button (click)="markAllAsRead($event)" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                Marcar todo como leído
              </button>
            }
          </div>

          <!-- Notification Feed -->
          <div class="max-h-72 overflow-y-auto divide-y divide-slate-50">
            @if (notifications().length === 0) {
              <div class="p-6 text-center text-sm text-slate-400">
                No tienes notificaciones en este momento.
              </div>
            } @else {
              @for (n of notifications(); track n.id) {
                <div class="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start space-x-3 cursor-pointer"
                     [ngClass]="{ 'bg-indigo-50/20 font-medium': !n.read }"
                     (click)="handleNotificationClick(n)">
                  <!-- Status Indicator dot -->
                  <div class="flex-shrink-0 mt-1.5">
                    <span class="block h-2.5 w-2.5 rounded-full"
                          [ngClass]="{
                            'bg-rose-500': n.priority === 'urgente',
                            'bg-indigo-500': n.priority === 'normal' && !n.read,
                            'bg-slate-200': n.read
                          }">
                    </span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-0.5">
                      <span class="text-xs font-semibold text-slate-700">{{ n.title }}</span>
                      <span class="text-[10px] text-slate-400 font-medium">{{ n.time }}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-normal">{{ n.message }}</p>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          @if (notifications().length > 0) {
            <div class="p-2.5 text-center bg-slate-50/30">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">WebSockets SignalR Habilitado</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class NotificationBellComponent {
  private readonly state = inject(StateService);
  private readonly elementRef = inject(ElementRef);

  protected readonly isOpen = signal(false);
  protected readonly notifications = this.state.notifications;
  protected readonly unreadCount = this.state.unreadNotificationsCount;

  toggleDropdown() {
    this.isOpen.update(val => !val);
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.state.markAllNotificationsAsRead();
  }

  handleNotificationClick(n: SystemNotification) {
    this.state.markNotificationAsRead(n.id);
    if (n.caseId) {
      this.state.selectedCaseId.set(n.caseId);
    }
    this.isOpen.set(false);
  }

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
