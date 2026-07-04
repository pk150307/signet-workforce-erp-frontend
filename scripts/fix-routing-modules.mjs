#!/usr/bin/env node
/** Regenerate *-routing.module.ts from legacy *.routes.ts files */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/app/features');

const FEATURES = [
  ['auth', 'AuthModule'],
  ['dashboard', 'DashboardModule'],
  ['employees', 'EmployeesModule'],
  ['clients', 'ClientsModule'],
  ['sites', 'SitesModule'],
  ['attendance', 'AttendanceModule'],
  ['leave', 'LeaveModule'],
  ['payroll', 'PayrollModule'],
  ['payroll/payslips', 'PayslipsModule'],
  ['billing', 'BillingModule'],
  ['reports', 'ReportsModule'],
  ['settings', 'SettingsModule'],
  ['company', 'CompanyModule'],
  ['department', 'DepartmentModule'],
  ['designation', 'DesignationModule'],
  ['shift', 'ShiftModule'],
  ['statutory/pf-esic', 'PfEsicModule'],
];

function convertRoutesContent(content, featureDir) {
  const headerImports = new Set();
  let body = content;

  // Extract and preserve top-level imports from routes file (guards, constants)
  const preservedImports = [];
  const importRegex = /^import .+;$/gm;
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    if (!m[0].includes('@angular/router')) preservedImports.push(m[0]);
  }

  body = body.replace(/^import .+;\n?/gm, '');
  body = body.replace(/export const \w+: Routes = /, 'const routes: Routes = ');

  body = body.replace(
    /loadComponent:\s*\(\)\s*=>\s*import\(['"](\.\/[^'"]+)['"]\)\.then\(\s*m\s*=>\s*m\.(\w+)\s*\)/g,
    (_, rel, cls) => {
      headerImports.add(`import { ${cls} } from '${rel}';`);
      return `component: ${cls}`;
    }
  );

  body = body.replace(
    /loadChildren:\s*\(\)\s*=>\s*import\(['"](\.\/[^'"]+)['"]\)\.then\(\s*m\s*=>\s*m\.(\w+)\s*\)/g,
    (_, rel, exportName) => {
      const mod =
        exportName === 'PAYSLIP_ROUTES'
          ? 'PayslipsModule'
          : exportName.replace('_ROUTES', 'Module').replace(/Routes$/, 'Module');
      const modPath = rel.replace('.routes', '.module');
      return `loadChildren: () => import('${modPath}').then(m => m.${mod})`;
    }
  );

  const routingClass = FEATURES.find(([, mod]) => featureDir.endsWith(mod.replace('Module', '').toLowerCase()))?.[1];
  const moduleName = FEATURES.find((f) => path.join(ROOT, f[0]) === featureDir)?.[1] || 'FeatureModule';

  const importsBlock = [...preservedImports, ...headerImports].join('\n');

  return `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
${importsBlock ? importsBlock + '\n' : ''}
${body.trim()}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ${moduleName}RoutingModule {}
`;
}

for (const [rel, moduleName] of FEATURES) {
  const dir = path.join(ROOT, rel);
  const routesFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.routes.ts'));
  if (!routesFiles.length) continue;
  const routesPath = path.join(dir, routesFiles[0]);
  const content = fs.readFileSync(routesPath, 'utf8');
  const out = convertRoutesContent(content, dir);
  const outPath = path.join(dir, `${moduleName.replace('Module', '').toLowerCase()}-routing.module.ts`.replace('pf-esic', 'pf-esic').replace('payslips', 'payslips'));
  // Fix naming: auth -> auth-routing, pf-esic -> pf-esic-routing
  const baseName = path.basename(dir);
  const routingFile = path.join(dir, `${baseName}-routing.module.ts`);
  fs.writeFileSync(routingFile, out.replace(`export class ${moduleName}RoutingModule`, `export class ${moduleName.replace('PfEsic', 'PfEsic').replace('Payslips', 'Payslips')}RoutingModule`));
  console.log('Wrote', routingFile);

  // Fix module import to use *RoutingModule not *ModuleRoutingModule
  const moduleFile = path.join(dir, `${baseName}.module.ts`);
  if (fs.existsSync(moduleFile)) {
    let mod = fs.readFileSync(moduleFile, 'utf8');
    mod = mod.replace(/from '\.\/[^']+-routing\.module'/, `from './${baseName}-routing.module'`);
    mod = mod.replace(/\w+ModuleRoutingModule/g, `${moduleName}RoutingModule`);
    fs.writeFileSync(moduleFile, mod);
  }
}

console.log('Routing modules regenerated.');
