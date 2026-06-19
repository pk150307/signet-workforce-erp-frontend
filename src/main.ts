import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  console.error('Application bootstrap failed:', err);

  const errorElement = document.createElement('div');
  errorElement.style.cssText = `
    position: fixed; inset: 0; background: #f5f5f5;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 20px; text-align: center; z-index: 9999;
  `;
  errorElement.innerHTML = `
    <div style="max-width: 500px;">
      <h1 style="color: #c62828; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #5a6478; margin-bottom: 24px;">
        Failed to load the application. Please refresh the page or contact support if the problem persists.
      </p>
      <button onclick="window.location.reload()" style="
        background: #1565C0; color: white; border: none; padding: 12px 24px;
        border-radius: 6px; font-size: 14px; cursor: pointer;
      ">Refresh Page</button>
    </div>
  `;
  document.body.appendChild(errorElement);
});
