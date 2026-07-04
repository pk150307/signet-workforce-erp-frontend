import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'signet-info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrl: './info-tooltip.component.less',
})
export class InfoTooltipComponent {
  @ViewChild('tooltipButton', { static: false }) button!: ElementRef;
  @ViewChild('tooltip', { static: false }) tooltip!: ElementRef;
  @ViewChild('tooltipArrow', { static: false }) arrow!: ElementRef;
  @Input() iconUrl: string = '/assets/images/icons/user-access/info_button.png';
  @Input() iconSize: number = 20;
  @Input() tooltipWidth: number = 306;
  @Input() tooltipHeight: number = 55;
  @Input() showLoader: boolean = false;
  @Input() info: InfoTooltipPayload[][] = [
    [
      { label: 'Created by', value: 'sample@gmail.com' },
      { label: 'Created by', value: 'sample@gmail.com' },
    ],
    [
      { label: 'Created by', value: 'sample@gmail.com' },
      { label: 'Created by', value: 'sample@gmail.com' },
    ],
  ];
  @Output() open: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Input() side: 'top' | 'bottom' | 'right' | 'left' = 'bottom';
  @Input() enableCustomDesign: boolean = false;
  @Input() disabled: boolean = false;
  @Input() keyValyePair: boolean = false;
  @Input() labelColor: string = '#AAADB5';
  @Input() fontStyle: string = 'normal';
  @Input() maxWidth: string = '324px';

  showToolTip: boolean = false;

  tooltipTop = 0;

  tooltipLeft = 0;

  constructor() {}

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      if (this.showToolTip) {
        this.updateTooltipPosition();
      }
    });
  }
  onOpen() {
    this.open.emit();
  }
  onClose() {
    this.close.emit();
  }

  showTooltip() {
    this.showToolTip = true;
    this.tooltip.nativeElement.style.visibility = 'visible';
    this.updateTooltipPosition();
  }
  updateTooltipPosition() {
    if (!this.button || !this.tooltip || !this.showToolTip || !this.arrow)
      return;

    const buttonRect = this.button.nativeElement.getBoundingClientRect();
    const tooltipEl = this.tooltip.nativeElement;
    const arrowEl = this.arrow.nativeElement;

    tooltipEl.style.display = 'block';

    const tooltipRect = tooltipEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 8;

    let top = 0;
    let left = 0;

    tooltipEl.classList.remove(
      'info-tooltip__wrapper-top',
      'info-tooltip__wrapper-right',
      'info-tooltip__wrapper-left'
    );

    if (this.side === 'right') {
      left = buttonRect.right + GAP;
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;

      tooltipEl.classList.add('info-tooltip__wrapper-right');
    } else if (this.side === 'left') {
      left = buttonRect.left - tooltipRect.width - GAP;
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;

      tooltipEl.classList.add('info-tooltip__wrapper-left');
    } else if (this.side === 'top') {
      top = buttonRect.top - tooltipRect.height - GAP;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
      tooltipEl.classList.add('info-tooltip__wrapper-top');
    } else {
      top = buttonRect.bottom + GAP;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

      const spaceBelow = vh - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (
        spaceBelow < tooltipRect.height + GAP &&
        spaceAbove > tooltipRect.height + GAP
      ) {
        top = buttonRect.top - tooltipRect.height - GAP;
        tooltipEl.classList.add('info-tooltip__wrapper-top');
      }
    }

    top = Math.max(GAP, Math.min(top, vh - tooltipRect.height - GAP));
    left = Math.max(GAP, Math.min(left, vw - tooltipRect.width - GAP));

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.zIndex = '9999';

    if (this.side === 'right') {
      arrowEl.style.left = `-5px`;
      arrowEl.style.top = `${tooltipRect.height / 2 - 5}px`;
      arrowEl.style.transform = 'rotate(-45deg)';
    } else if (this.side === 'left') {
      arrowEl.style.left = `${tooltipRect.width - 5}px`;
      arrowEl.style.top = `${tooltipRect.height / 2 - 5}px`;
      arrowEl.style.transform = 'rotate(135deg)';
    } else if (this.side === 'top') {
      arrowEl.style.left = `${tooltipRect.width / 2 - 6}px`;
      arrowEl.style.top = `${tooltipRect.height - 7}px`;
      arrowEl.style.transform = 'rotate(-135deg)';
    } else {
      const iconCenterX = buttonRect.left + buttonRect.width / 2;
      const tooltipLeft = tooltipEl.getBoundingClientRect().left;

      let arrowLeft = iconCenterX - tooltipLeft - 5;
      arrowLeft = Math.max(12, Math.min(arrowLeft, tooltipRect.width - 22));

      arrowEl.style.left = `${arrowLeft}px`;
      arrowEl.style.top = '';
      arrowEl.style.transform = '';
    }
  }

  hideTooltip() {
    this.showToolTip = false;
    if (this.tooltip) {
      this.tooltip.nativeElement.style.visibility = 'hidden';
    }
  }
}

export interface InfoTooltipPayload {
  label: string;
  value: string;
  type?: string;
}