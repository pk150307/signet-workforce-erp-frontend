#!/usr/bin/env node
/**
 * Migrates standalone components to NgModule architecture.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/app');

function walk(dir, pattern = /\.component\.ts$/, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full, pattern, files);
    } else if (pattern.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

function walkPipes(dir, files = []) {
  return walk(dir, /\.pipe\.ts$/, files);
}

function getExportedClass(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export class (\w+)/);
  return match ? match[1] : null;
}

function stripStandaloneFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('standalone: true')) return false;

  content = content.replace(/\s*standalone:\s*true,?\r?\n/g, '\n');

  // Remove imports array from @Component / @Pipe decorator
  content = content.replace(
    /imports:\s*\[(?:[^\[\]]|\[[^\]]*\])*\],?\s*\r?\n/g,
    ''
  );

  // Remove now-unused UI_IMPORTS import lines
  content = content.replace(/import \{ UI_IMPORTS \} from ['"][^'"]+['"];\s*\r?\n/g, '');

  // Remove duplicate material imports that SharedModule provides - keep for now, TS will warn unused
  fs.writeFileSync(filePath, content);
  return true;
}

function parseRoutesFile(routesPath) {
  const content = fs.readFileSync(routesPath, 'utf8');
  const routes = [];
  const routeBlocks = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];

  for (const block of routeBlocks) {
    const pathMatch = block.match(/path:\s*['"]([^'"]*)['"]/);
    const redirectMatch = block.match(/redirectTo:\s*['"]([^'"]+)['"]/);
    const loadCompMatch = block.match(
      /import\(['"](\.\/[^'"]+)['"]\)\.then\(\s*m\s*=>\s*m\.(\w+)\s*\)/
    );
    const loadChildMatch = block.match(
      /import\(['"](\.\/[^'"]+)['"]\)\.then\(\s*m\s*=>\s*m\.(\w+)\s*\)/
    );
    const dataMatch = block.match(/data:\s*(\{[\s\S]*?\}|['"][^'"]+['"])/);
    const canActivateMatch = block.match(/canActivate:\s*\[[^\]]+\]/);

    if (pathMatch) {
      const route = { path: pathMatch[1] };
      if (redirectMatch) {
        route.redirectTo = redirectMatch[1];
        route.pathMatch = block.includes("pathMatch: 'full'") ? 'full' : undefined;
      } else if (block.includes('loadChildren') && loadChildMatch) {
        route.loadChildrenModule = loadChildMatch[2];
        route.loadChildrenPath = loadChildMatch[1];
      } else if (loadCompMatch) {
        route.componentClass = loadCompMatch[2];
        route.componentPath = loadCompMatch[1];
      }
      if (dataMatch) route.dataRaw = dataMatch[1];
      if (canActivateMatch) route.canActivateRaw = canActivateMatch[0];
      routes.push(route);
    }
  }
  return routes;
}

function toImportPath(fromDir, componentRelPath) {
  const withoutExt = componentRelPath.replace(/\.component$/, '.component');
  return withoutExt.startsWith('.') ? withoutExt : `./${withoutExt}`;
}

function generateRoutingModule(featureDir, moduleBaseName, routesPath, routes) {
  const routingFileName = `${kebab(moduleBaseName)}-routing.module.ts`;
  const routingPath = path.join(featureDir, routingFileName);

  const componentImports = new Map();
  for (const r of routes) {
    if (r.componentClass && r.componentPath) {
      componentImports.set(r.componentClass, toImportPath(featureDir, r.componentPath));
    }
  }

  let importsSection = '';
  for (const [cls, imp] of componentImports) {
    const rel = path.relative(featureDir, path.resolve(featureDir, imp)).replace(/\\/g, '/');
    const importPath = rel.startsWith('.') ? rel : `./${rel}`;
    importsSection += `import { ${cls} } from '${importPath.replace('.ts', '')}';\n`;
  }

  let routesBody = 'const routes: Routes = [\n';
  for (const r of routes) {
    routesBody += '  {\n';
    routesBody += `    path: '${r.path}',\n`;
    if (r.redirectTo) {
      routesBody += `    redirectTo: '${r.redirectTo}',\n`;
      if (r.pathMatch) routesBody += `    pathMatch: 'full',\n`;
    } else if (r.loadChildrenModule) {
      const modName = r.loadChildrenModule.replace('_ROUTES', 'Module').replace(/Routes$/, 'Module');
      const childPath = r.loadChildrenPath.replace('.routes', '.module').replace('payslips.routes', 'payslips.module');
      const fixedModule =
        r.loadChildrenModule === 'PAYSLIP_ROUTES' ? 'PayslipsModule' : modName;
      const fixedPath =
        r.loadChildrenModule === 'PAYSLIP_ROUTES'
          ? './payslips/payslips.module'
          : r.loadChildrenPath.replace('.routes', '.module');
      routesBody += `    loadChildren: () => import('${fixedPath}').then(m => m.${fixedModule}),\n`;
    } else if (r.componentClass) {
      routesBody += `    component: ${r.componentClass},\n`;
    }
    if (r.dataRaw) routesBody += `    data: ${r.dataRaw},\n`;
    if (r.canActivateRaw) routesBody += `    ${r.canActivateRaw},\n`;
    routesBody += '  },\n';
  }
  routesBody += '];\n';

  const content = `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
${importsSection}
${routesBody}
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ${moduleBaseName}RoutingModule {}
`;

  fs.writeFileSync(routingPath, content);
  return routingFileName;
}

function kebab(name) {
  return name.replace(/Module$/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function sharedModuleImport(fromDir) {
  const rel = path
    .relative(fromDir, path.join(ROOT, 'shared/shared.module.ts'))
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

function generateFeatureModule(featureDir, moduleName, routingModuleName, componentFiles) {
  const declarations = componentFiles.map((f) => getExportedClass(f)).filter(Boolean);

  let importSection = '';
  for (const file of componentFiles) {
    const cls = getExportedClass(file);
    if (!cls) continue;
    const rel = path.relative(featureDir, file).replace(/\\/g, '/').replace('.ts', '');
    importSection += `import { ${cls} } from './${rel}';\n`;
  }

  const declList = declarations.map((d) => `    ${d},`).join('\n');
  const sharedImport = sharedModuleImport(featureDir);

  const content = `import { NgModule } from '@angular/core';
import { SharedModule } from '${sharedImport}';
import { ${moduleName}RoutingModule } from './${routingModuleName.replace('.ts', '')}';
${importSection}
@NgModule({
  declarations: [
${declList}
  ],
  imports: [
    SharedModule,
    ${moduleName}RoutingModule,
  ],
})
export class ${moduleName} {}
`;

  fs.writeFileSync(path.join(featureDir, `${kebab(moduleName)}.module.ts`), content);
}

const FEATURE_CONFIG = [
  { dir: 'features/auth', moduleName: 'AuthModule', routesFile: 'auth.routes.ts' },
  { dir: 'features/dashboard', moduleName: 'DashboardModule', routesFile: 'dashboard.routes.ts' },
  { dir: 'features/employees', moduleName: 'EmployeesModule', routesFile: 'employees.routes.ts' },
  { dir: 'features/clients', moduleName: 'ClientsModule', routesFile: 'clients.routes.ts' },
  { dir: 'features/sites', moduleName: 'SitesModule', routesFile: 'sites.routes.ts' },
  { dir: 'features/attendance', moduleName: 'AttendanceModule', routesFile: 'attendance.routes.ts' },
  { dir: 'features/leave', moduleName: 'LeaveModule', routesFile: 'leave.routes.ts' },
  { dir: 'features/payroll', moduleName: 'PayrollModule', routesFile: 'payroll.routes.ts' },
  { dir: 'features/payroll/payslips', moduleName: 'PayslipsModule', routesFile: 'payslips.routes.ts' },
  { dir: 'features/billing', moduleName: 'BillingModule', routesFile: 'billing.routes.ts' },
  { dir: 'features/reports', moduleName: 'ReportsModule', routesFile: 'reports.routes.ts' },
  { dir: 'features/settings', moduleName: 'SettingsModule', routesFile: 'settings.routes.ts' },
  { dir: 'features/company', moduleName: 'CompanyModule', routesFile: 'company.routes.ts' },
  { dir: 'features/department', moduleName: 'DepartmentModule', routesFile: 'department.routes.ts' },
  { dir: 'features/designation', moduleName: 'DesignationModule', routesFile: 'designation.routes.ts' },
  { dir: 'features/shift', moduleName: 'ShiftModule', routesFile: 'shift.routes.ts' },
  { dir: 'features/statutory/pf-esic', moduleName: 'PfEsicModule', routesFile: 'pf-esic.routes.ts' },
];

// 1. Strip standalone from all components and pipes (except library)
const componentFiles = walk(ROOT).filter((f) => !f.includes('/library/components/'));
const pipeFiles = walkPipes(ROOT);
let stripped = 0;
for (const f of [...componentFiles, ...pipeFiles]) {
  if (stripStandaloneFromFile(f)) stripped++;
}
console.log(`Stripped standalone from ${stripped} files`);

// 2. Generate feature modules
for (const cfg of FEATURE_CONFIG) {
  const featureDir = path.join(ROOT, cfg.dir);
  const routesPath = path.join(featureDir, cfg.routesFile);
  if (!fs.existsSync(routesPath)) {
    console.warn('Skip missing routes:', routesPath);
    continue;
  }
  const routes = parseRoutesFile(routesPath);
  const comps = walk(featureDir).filter((f) => !f.includes('.spec.'));
  const routingFile = generateRoutingModule(featureDir, cfg.moduleName, routesPath, routes);
  generateFeatureModule(featureDir, cfg.moduleName, routingFile, comps);
  console.log('Generated', cfg.moduleName);
}

console.log('Done. Run manual steps for AppModule, LayoutModule, SharedModule.');
