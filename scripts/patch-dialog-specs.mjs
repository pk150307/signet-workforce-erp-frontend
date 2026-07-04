#!/usr/bin/env node
/**
 * Patch dialog component specs with required Material dialog providers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'app');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('-dialog.component.spec.ts')) files.push(full);
  }
  return files;
}

for (const specPath of walk(root)) {
  let content = fs.readFileSync(specPath, 'utf8');
  if (content.includes('MAT_DIALOG_DATA')) continue;

  content = content.replace(
    "import { NO_ERRORS_SCHEMA } from '@angular/core';",
    `import { NO_ERRORS_SCHEMA } from '@angular/core';\nimport { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';`,
  );

  content = content.replace(
    'schemas: [NO_ERRORS_SCHEMA],',
    `providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],`,
  );

  fs.writeFileSync(specPath, content);
}

console.log('Patched dialog component specs.');
