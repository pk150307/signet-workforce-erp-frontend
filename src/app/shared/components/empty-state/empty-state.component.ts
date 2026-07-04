import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
    templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.less',
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() description = 'There are no records to display at the moment.';
  @Input() actionLabel?: string;
}
