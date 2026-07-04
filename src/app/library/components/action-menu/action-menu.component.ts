import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActionMenuTriggerDirective } from './action-menu-trigger.directive';
import { ActionMenuItem } from './action-menu.types';

@Component({
  selector: 'signet-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrl: './action-menu.component.less',
})
export class ActionMenuComponent implements OnDestroy {
  private static activeInstance: ActionMenuComponent | null = null;

  @Input() items: ActionMenuItem[] = [];
  @Input() triggerIcon = 'more_vert';
  @Input() triggerLabel = '';
  @Input() triggerType: 'icon' | 'button' | 'custom' = 'icon';
  @Input() ariaLabel = 'More actions';
  @Input() align: 'start' | 'end' = 'end';
  @Input() stopPropagation = true;
  @Input() panelClass = '';

  @Output() itemSelected = new EventEmitter<ActionMenuItem>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ContentChild(ActionMenuTriggerDirective) customTrigger?: ActionMenuTriggerDirective;

  isOpen = false;
  panelStyles: Record<string, string> = {};

  private ignoreDocumentClick = false;
  private positionFrame: number | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly router: Router,
  ) {}

  get hasCustomTrigger(): boolean {
    return this.triggerType === 'custom' || !!this.customTrigger;
  }

  get visibleItems(): ActionMenuItem[] {
    return (this.items ?? []).filter(item => item.visible !== false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen || this.ignoreDocumentClick) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen) this.schedulePosition();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isOpen) this.schedulePosition();
  }

  ngOnDestroy(): void {
    if (ActionMenuComponent.activeInstance === this) {
      ActionMenuComponent.activeInstance = null;
    }
    if (this.positionFrame != null) {
      cancelAnimationFrame(this.positionFrame);
    }
  }

  toggle(event?: Event): void {
    if (this.stopPropagation) {
      event?.preventDefault();
      event?.stopPropagation();
    }
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (ActionMenuComponent.activeInstance && ActionMenuComponent.activeInstance !== this) {
      ActionMenuComponent.activeInstance.close();
    }

    this.isOpen = true;
    this.ignoreDocumentClick = true;
    ActionMenuComponent.activeInstance = this;
    this.opened.emit();

    setTimeout(() => {
      this.positionPanel();
      this.ignoreDocumentClick = false;
    });
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panelStyles = {};
    if (ActionMenuComponent.activeInstance === this) {
      ActionMenuComponent.activeInstance = null;
    }
    this.closed.emit();
  }

  onPanelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[actionMenuKeepOpen]')) {
      return;
    }
    if (target.closest('button, a, [actionMenuItem]')) {
      this.close();
    }
  }

  onItemClick(item: ActionMenuItem, event?: Event): void {
    event?.stopPropagation();
    if (item.disabled) return;

    if (item.route) {
      void this.router.navigate(
        Array.isArray(item.route) ? item.route : [item.route],
        item.queryParams ? { queryParams: item.queryParams } : undefined,
      );
    }

    this.itemSelected.emit(item);
    this.close();
  }

  private schedulePosition(): void {
    if (this.positionFrame != null) {
      cancelAnimationFrame(this.positionFrame);
    }
    this.positionFrame = requestAnimationFrame(() => this.positionPanel());
  }

  private positionPanel(): void {
    const host = this.elementRef.nativeElement;
    const trigger = host.querySelector('.action-menu__trigger') as HTMLElement | null;
    const panel = host.querySelector('.action-menu__panel') as HTMLElement | null;
    if (!trigger || !panel || !this.isOpen) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(panel.offsetWidth || 0, 180);
    const panelHeight = Math.max(panel.offsetHeight || 0, 40);
    const gap = 4;
    const viewportPadding = 8;

    let top = triggerRect.bottom + gap;
    let left = this.align === 'end'
      ? triggerRect.right - panelWidth
      : triggerRect.left;

    if (left < viewportPadding) {
      left = viewportPadding;
    }
    if (left + panelWidth > window.innerWidth - viewportPadding) {
      left = Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding);
    }

    if (top + panelHeight > window.innerHeight - viewportPadding) {
      const above = triggerRect.top - panelHeight - gap;
      top = above >= viewportPadding
        ? above
        : Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding);
    }

    this.panelStyles = {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      right: 'auto',
      bottom: 'auto',
      zIndex: '9999',
    };
  }
}
