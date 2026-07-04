import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/app');
const UI_IMPORT_PATH = '../../shared/ui/ui.imports';
const UI_IMPORT_PATH_FEATURES = '../../../shared/ui/ui.imports';
const UI_IMPORT_PATH_DEEP = '../../../../shared/ui/ui.imports';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'library' || entry.name === 'node_modules') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.component.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

function relativeUiImport(file) {
  const depth = file.replace(ROOT + path.sep, '').split(path.sep).length - 1;
  if (depth <= 2) return UI_IMPORT_PATH;
  if (depth <= 4) return UI_IMPORT_PATH_FEATURES;
  return UI_IMPORT_PATH_DEEP;
}

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('UI_IMPORTS') || content.includes('LibraryModule')) {
    if (!content.includes('UI_IMPORTS')) return false;
    return false;
  }
  if (!content.includes('standalone: true')) return false;

  const importPath = relativeUiImport(file);
  const importLine = `import { UI_IMPORTS } from '${importPath}';\n`;

  const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
  if (!importsMatch) return false;

  if (!content.includes("from '@angular/core'")) return false;

  content = content.replace(
    /import \{([^}]+)\} from '@angular\/core';/,
    (m, names) => {
      if (names.includes('UI_IMPORTS')) return m;
      return m + importLine;
    }
  );

  const currentImports = importsMatch[1];
  if (currentImports.includes('UI_IMPORTS')) return false;

  const newImportsBlock = `imports: [\n    ...UI_IMPORTS,${currentImports.trim() ? '\n' + currentImports.trim().replace(/^/gm, '    ') : ''}\n  ]`;
  content = content.replace(/imports:\s*\[[\s\S]*?\]/, newImportsBlock);

  fs.writeFileSync(file, content);
  return true;
}

const files = walk(ROOT);
let count = 0;
for (const file of files) {
  if (patchFile(file)) {
    count++;
    console.log('Patched:', file);
  }
}
console.log(`Done. Patched ${count} files.`);
