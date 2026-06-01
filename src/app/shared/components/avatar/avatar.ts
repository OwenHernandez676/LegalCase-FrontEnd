import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center rounded-full text-white font-semibold select-none smooth-transition"
         [ngClass]="[sizeClasses(), bgClass()]"
         [title]="name">
      <span>{{ initials() }}</span>
      
      <!-- Status Badge -->
      @if (status !== 'none') {
        <span class="absolute bottom-0 right-0 block rounded-full ring-2 ring-white"
              [ngClass]="{
                'bg-emerald-500': status === 'online',
                'bg-slate-400': status === 'offline',
                'h-2.5 w-2.5': size === 'sm',
                'h-3 w-3': size === 'md',
                'h-4 w-4': size === 'lg'
              }">
        </span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AvatarComponent {
  @Input({ required: true }) name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() status: 'online' | 'offline' | 'none' = 'none';

  protected readonly initials = computed(() => {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected readonly sizeClasses = computed(() => {
    switch (this.size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-10 h-10 text-sm';
    }
  });

  protected readonly bgClass = computed(() => {
    // Generate a stable color based on name string hash
    const nameStr = this.name || 'User';
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 6;
    const colors = [
      'bg-indigo-600',
      'bg-slate-700',
      'bg-violet-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-amber-600'
    ];
    return colors[index];
  });
}
