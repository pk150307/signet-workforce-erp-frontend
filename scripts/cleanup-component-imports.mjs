#!/usr/bin/env node
/**
 * Remove unused standalone-era Material imports from NgModule component files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'app');

const unusedImportPatterns = [
  /^import \{[^}]*MatFormFieldModule[^}]*\} from '@angular\/material\/form-field';\n/gm,
  /^import \{[^}]*MatSelectModule[^}]*\} from '@angular\/material\/select';\n/gm,
  /^import \{[^}]*MatProgressSpinnerModule[^}]*\} from '@angular\/material\/progress-spinner';\n/gm,
  /^import \{[^}]*MatTableModule[^}]*\} from '@angular\/material\/table';\n/gm,
  /^import \{[^}]*SkeletonLoaderComponent[^}]*\} from '[^']+skeleton-loader[^']+';\n/gm,
  /^import \{ NgFor, NgIf \} from '@angular\/common';\n/gm,
  /^import \{ RouterLink, RouterLinkActive \} from '@angular\/router';\n/gm,
  /^import \{[^}]*ReactiveFormsModule[^}]*\} from '@angular\/forms';\n/gm,
  /^import \{ NgClass, NgFor, NgIf \} from '@angular\/common';\n/gm,
  /^import \{ DecimalPipe, NgClass \} from '@angular\/common';\n/gm,
  /^import \{ DatePipe, NgClass \} from '@angular\/common';\n/gm,
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.component.ts')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const pattern of unusedImportPatterns) {
    content = content.replace(pattern, '');
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    updated++;
  }
}

console.log(`Cleaned unused imports in ${updated} component files.`);
