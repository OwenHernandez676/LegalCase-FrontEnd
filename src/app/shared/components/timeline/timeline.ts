import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Milestone } from '../../../core/models/models';
import { StateService } from '../../../core/services/state.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flow-root">
      <ul role="list" class="-mb-8">
        @for (milestone of milestones; track milestone.id; let isLast = $last) {
          <li>
            <div class="relative pb-8">
              <!-- Connector line -->
              @if (!isLast) {
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
              }
              
              <div class="relative flex space-x-3">
                <!-- Milestone node indicator -->
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white cursor-pointer smooth-transition"
                        [ngClass]="{
                          'bg-emerald-500 text-white hover:bg-emerald-600': milestone.completed,
                          'bg-indigo-100 text-indigo-600 border border-indigo-300 hover:bg-indigo-200': !milestone.completed
                        }"
                        (click)="toggleMilestone(milestone)">
                    @if (milestone.completed) {
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                      </svg>
                    } @else {
                      <span class="h-2 w-2 rounded-full bg-indigo-600"></span>
                    }
                  </span>
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm font-semibold" [ngClass]="milestone.completed ? 'text-slate-800 line-through decoration-slate-400' : 'text-slate-900'">
                      {{ milestone.title }}
                    </p>
                    <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ milestone.description }}</p>
                  </div>
                  <div class="text-right text-xs whitespace-nowrap text-slate-400 font-medium">
                    <time [dateTime]="milestone.date">{{ milestone.date | date:'dd MMM yyyy' }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        }
      </ul>
    </div>
  `
})
export class TimelineComponent {
  @Input({ required: true }) caseId!: string;
  @Input({ required: true }) milestones: Milestone[] = [];
  @Input() editable = true;

  private readonly state = inject(StateService);

  toggleMilestone(milestone: Milestone) {
    if (!this.editable) return;
    this.state.updateMilestone(this.caseId, milestone.id, !milestone.completed);
  }
}
