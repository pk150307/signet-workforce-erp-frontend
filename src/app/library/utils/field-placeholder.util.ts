export type FieldPlaceholderKind = 'enter' | 'select' | 'search';

export function resolveFieldPlaceholder(
  fieldTitle?: string | null,
  placeholder?: string | null,
  kind: FieldPlaceholderKind = 'enter',
): string {
  const explicit = placeholder?.trim();
  if (explicit) return explicit;

  const title = fieldTitle?.trim();
  if (title) {
    if (kind === 'select') return `Select ${title}`;
    if (kind === 'search') return `Search ${title.toLowerCase()}`;
    return `Enter ${title.toLowerCase()}`;
  }

  if (kind === 'select') return 'Select an option';
  if (kind === 'search') return 'Search...';
  return 'Enter value';
}
