import { Component, Input } from '@angular/core';

@Component({
  selector: 'signet-spacer',
  templateUrl: './spacer.component.html',
  styleUrl: './spacer.component.less',
})
export class SpacerComponent {
  @Input() height: number = 0;
  @Input() heightUnit: 'px' | '%' | 'rem' | 'em' = 'px';

  @Input() width: number = 100;
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = '%';

  @Input() showDivider: boolean = false;
}