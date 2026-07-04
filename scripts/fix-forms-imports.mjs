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
    else if (entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const uses = {
    FormControl: /\bFormControl\b/.test(content),
    FormGroup: /\bFormGroup\b/.test(content),
    FormArray: /\bFormArray\b/.test(content),
    Validators: /\bValidators\b/.test(content),
    FormBuilder: /\bFormBuilder\b/.test(content),
  };

  const needed = Object.entries(uses).filter(([, v]) => v).map(([k]) => k);
  if (!needed.length) return false;

  const hasFormsImport = /from '@angular\/forms'/.test(content);
  if (hasFormsImport) {
    const match = content.match(/import \{([^}]+)\} from '@angular\/forms';/);
    if (match) {
      const existing = match[1].split(',').map(s => s.trim()).filter(Boolean);
      const merged = [...new Set([...existing, ...needed])].sort();
      const replacement = `import { ${merged.join(', ')} } from '@angular/forms';`;
      content = content.replace(/import \{[^}]+\} from '@angular\/forms';/, replacement);
    }
  } else {
    const importLine = `import { ${needed.join(', ')} } from '@angular/forms';\n`;
    const idx = content.indexOf('@Component');
    const insertAt = idx > 0 ? content.lastIndexOf('\n', idx) + 1 : 0;
    content = content.slice(0, insertAt) + importLine + content.slice(insertAt);
  }

  fs.writeFileSync(file, content);
  return true;
}

let fixed = 0;
for (const file of walk(root)) {
  if (fixFile(file)) fixed++;
}
console.log(`Fixed forms imports in ${fixed} files.`);
