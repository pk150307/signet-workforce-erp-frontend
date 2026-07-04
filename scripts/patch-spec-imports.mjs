#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'app');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.component.spec.ts')) files.push(full);
  }
  return files;
}

for (const specPath of walk(root)) {
  let content = fs.readFileSync(specPath, 'utf8');
  if (content.includes('RouterTestingModule')) continue;

  content = content.replace(
    "import { ReactiveFormsModule } from '@angular/forms';",
    `import { ReactiveFormsModule } from '@angular/forms';\nimport { RouterTestingModule } from '@angular/router/testing';\nimport { HttpClientTestingModule } from '@angular/common/http/testing';`,
  );

  content = content.replace(
    'imports: [ReactiveFormsModule],',
    'imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],',
  );

  fs.writeFileSync(specPath, content);
}

console.log('Patched component specs with router/http testing modules.');
