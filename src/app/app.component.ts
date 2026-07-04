import { Component, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent {
  // Ensure theme is applied before any routed view renders
  private readonly _theme = inject(ThemeService);
}
