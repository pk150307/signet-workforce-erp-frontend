# Signet Workforce ERP - Frontend

Angular 18 frontend application for the Signet Workforce ERP system.

## Tech Stack

- Angular 18.2
- Angular Material 18.2
- Angular CDK 18.2
- Highcharts for data visualization
- ExcelJS for Excel export functionality

## Prerequisites

- Node.js 18+
- npm or yarn

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The application will be available at `http://localhost:4200/`

3. For production build:
```bash
npm run build:prod
```

## API Configuration

The frontend proxies API requests to the backend. Configure the backend URL in `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false
  }
}
```

## Docker Build

```bash
docker build -t signet-erp-frontend .
```

## Docker Compose

This frontend is orchestrated via Docker Compose from the backend repository. The backend repository's `docker-compose.yml` expects this frontend repository to be a sibling directory.

To run the full stack (database + backend + frontend), navigate to the backend repository and run:
```bash
cd ../signet-workforce-erp-backend
docker-compose up -d
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Run linting

## Project Architecture

### Directory Structure

```
src/
├── app/
│   ├── core/              # Core functionality and singletons
│   │   ├── constants/     # Application constants
│   │   ├── guards/        # Route guards (auth, guest)
│   │   ├── handlers/      # Global error handler
│   │   ├── interceptors/  # HTTP interceptors (auth, error)
│   │   ├── models/        # Shared data models
│   │   └── services/      # Core services (auth, notification, etc.)
│   ├── shared/            # Shared components and utilities
│   │   ├── components/    # Reusable UI components
│   │   ├── pipes/         # Custom pipes
│   │   └── utils/         # Utility functions
│   ├── auth/              # Authentication module
│   ├── dashboard/         # Dashboard module
│   ├── employees/         # Employee management module
│   ├── clients/           # Client management module
│   ├── sites/             # Site management module
│   ├── attendance/        # Attendance tracking module
│   ├── leave/             # Leave management module
│   ├── payroll/           # Payroll processing module
│   ├── billing/           # Billing and invoicing module
│   ├── reports/           # Reports and analytics module
│   ├── settings/          # Settings module
│   ├── layout/            # Layout components (shell, sidebar, topbar)
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/                # Static assets (images, favicon, etc.)
├── environments/          # Environment configurations
├── styles.scss            # Global styles
├── index.html             # HTML entry point
└── main.ts                # Application bootstrap
```

### Core Features

#### Error Handling
- **Global Error Handler**: Catches unhandled errors and displays user-friendly messages
- **HTTP Error Interceptor**: Handles API errors with automatic retry and notification
- **Bootstrap Error Handling**: Graceful error display if application fails to load

#### Authentication
- **Auth Interceptor**: Automatically adds JWT tokens to API requests
- **Auth Guard**: Protects routes requiring authentication
- **Guest Guard**: Prevents authenticated users from accessing login/register pages

#### Loading States
- **Loading Service**: Manages global and component-specific loading states
- **Loading Spinner Component**: Reusable loading indicator with customizable options

#### Utilities
- **DateUtils**: Date formatting, calculations, and comparisons
- **StringUtils**: String manipulation, validation, and formatting
- **Custom Pipes**: Safe HTML rendering, text truncation

#### Constants
- **API Endpoints**: Centralized API endpoint definitions
- **Application Config**: App-wide configuration values
- **Status Constants**: Employment types, leave types, invoice status, etc.

### Design System

The application uses a comprehensive design system defined in `styles.scss`:

- **CSS Custom Properties**: Consistent color palette, spacing, and typography
- **Angular Material Overrides**: Customized Material components
- **Layout Utilities**: Page containers, headers, cards, stat cards
- **Status Badges**: Color-coded status indicators
- **Responsive Design**: Mobile-first approach with breakpoints

### Component Architecture

#### Component Structure
- **Separation of Concerns**: HTML, SCSS, and TypeScript in separate files
- **Standalone Components**: Where appropriate for better tree-shaking
- **Shared Module**: Common components and utilities exported for reuse
- **Feature Modules**: Lazy-loaded modules for better performance

#### Best Practices
- **Signals**: Using Angular signals for reactive state management
- **Dependency Injection**: Constructor injection with inject() where appropriate
- **Type Safety**: Strong typing with TypeScript interfaces
- **Immutability**: Using signals and readonly properties

### HTTP Interceptors

1. **Auth Interceptor**: Adds authentication tokens to outgoing requests
2. **Error Interceptor**: Handles HTTP errors with user notifications

### Services

- **AuthService**: Authentication and authorization
- **NotificationService**: Toast notifications and alerts
- **LoadingService**: Global loading state management
- **EmployeeService**: Employee CRUD operations
- **DashboardService**: Dashboard statistics and charts
- Additional feature-specific services

### Environment Configuration

- **environment.ts**: Development environment variables
- **environment.prod.ts**: Production environment variables
- API URL, feature flags, and other configuration

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
