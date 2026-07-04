#!/usr/bin/env node
/**
 * Generate minimal *.component.spec.ts for components that don't have one.
 * Usage: node scripts/generate-component-specs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'app');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') walk(full, files);
    } else if (entry.name.endsWith('.component.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

function toClassName(filePath) {
  const base = path.basename(filePath, '.component.ts');
  return base
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Component';
}

function specContent(className, importPath) {
  return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ${className} } from '${importPath}';

describe('${className}', () => {
  let component: ${className};
  let fixture: ComponentFixture<${className}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [${className}],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(${className});
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`;
}

const components = walk(root);
let created = 0;
let skipped = 0;

for (const componentPath of components) {
  const specPath = componentPath.replace(/\.component\.ts$/, '.component.spec.ts');
  if (fs.existsSync(specPath)) {
    skipped++;
    continue;
  }

  const className = toClassName(componentPath);
  const importPath = './' + path.basename(componentPath, '.ts');
  fs.writeFileSync(specPath, specContent(className, importPath));
  created++;
}

console.log(`Created ${created} spec files, skipped ${skipped} existing.`);
