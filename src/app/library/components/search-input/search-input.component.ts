import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, fromEvent, map } from 'rxjs';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'signet-search-input',
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.less',
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @HostListener('mouseleave') onMouseLeave() {
    this.showFilters = false;
  }
  subscriptions: Subscription[] = [];
  @Input() disabled: boolean = false;
  @Input() searchValue: string = '';
  @Input() delay: number = 300;
  @Output() searchValueChange = new EventEmitter();
  @Input() filters?: {
    key: string;
    displayValue: string;
    placeholder: string;
  }[];
  @Input() filter: string = '';
  @Output() filterChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() showSearchSelectLoader: boolean = false;
  @Input() searchDropdownOptions = [
    { key: 'abc', value: 'ABC' },
    { key: 'def', value: 'DEF' },
    { key: 'ghi', value: 'GHI' },
  ];
  @Input() showSearchDropdown: boolean = false;
  @Input() placeholder: string = 'Search...';
  @Output() emitSearchSelectionOption = new EventEmitter();
  @Input() width: string = '260px';
  showFilters: boolean = false;
  getGenericLabels: any;
  constructor(public elementRef: ElementRef) {
    const eventStream = fromEvent(elementRef.nativeElement, 'keyup')
      .pipe(
        map(() => this.searchValue),
        debounceTime(this.delay)
      )
      .subscribe((input) => {
        this.searchValueChange.emit(input.trim());
      });
    this.subscriptions.push(eventStream);
  }
  emitSearchSelection(event: any): void {
    this.searchValue = event.value;
    this.emitSearchSelectionOption.emit(event.key);
  }
  ngOnInit(): void {
    this.getGenericLabels = JSON.parse(
      localStorage.getItem('genericLabels') || '{}'
    );
  }
  toggleFilters() {
    if (!this.showSearchDropdown) {
      this.showFilters = !this.showFilters;
    }
  }

  applyFilter(filter: string) {
    this.showFilters = false;
    if (filter != this.filter) {
      this.filter = filter;
      this.filterChange.emit(filter);
      this.searchReset();
    }
  }

  get formattedPlaceHolder(): string {
    if (this.filters && this.filter) {
      const appliedFilter = this.filters.find(
        (filter) => filter.key == this.filter
      );
      if (appliedFilter) {
        return appliedFilter.placeholder;
      }
    }
    return this.placeholder;
  }
  searchReset() {
    this.searchValue = '';
    this.searchValueChange.emit('');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }
}
