// Global type definitions for the application

declare global {
  interface Window {
    logErrorToService?: (error: Error) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {};
