import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'signet-sections-navigator',
  templateUrl: './sections-navigator.component.html',
  styleUrl: './sections-navigator.component.less',
})
export class SectionsNavigatorComponent {
  @Input() navigationItems: { label: string; value: string }[] = [
    { label: 'Actuals', value: 'ACTUALS' },
    { label: 'Budgets', value: 'BUDGETS' },
    { label: 'Batches', value: 'BATCHES' },
  ];
  @Input() selectedItem: string = 'ACTUALS';
  @Input() activeBackgroundColour = '#0A0A0A';
  @Input() height = '36px';
  @Input() borderColor: string | null = null;
  @Input() backgroundColor = 'var(--color-surface)';
  @Output() selectedItemChange: EventEmitter<string> =
    new EventEmitter<string>();

  @HostBinding('style.--nav-height')
  get navHeight(): string {
    return this.height;
  }

  @HostBinding('style.--nav-border')
  get navBorder(): string {
    return this.borderColor ? `1px solid ${this.borderColor}` : 'none';
  }

  @HostBinding('style.--nav-bg')
  get navBg(): string {
    return this.backgroundColor;
  }

  @HostBinding('style.--nav-cols')
  get navCols(): number {
    return this.navigationItems?.length || 1;
  }

  @HostBinding('style.--nav-active-bg')
  get navActiveBg(): string {
    return this.activeBackgroundColour;
  }

  onSelect(value: string) {
    this.selectedItem = value;
    this.selectedItemChange.emit(value);
  }
}
