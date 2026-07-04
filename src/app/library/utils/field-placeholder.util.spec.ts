import { resolveFieldPlaceholder } from './field-placeholder.util';

describe('resolveFieldPlaceholder', () => {
  it('returns explicit placeholder when provided', () => {
    expect(resolveFieldPlaceholder('Client', 'All clients', 'select')).toBe('All clients');
  });

  it('derives select placeholder from field title', () => {
    expect(resolveFieldPlaceholder('Status', '', 'select')).toBe('Select Status');
  });

  it('derives enter placeholder from field title', () => {
    expect(resolveFieldPlaceholder('Company Name', '', 'enter')).toBe('Enter company name');
  });

  it('falls back to generic values', () => {
    expect(resolveFieldPlaceholder(undefined, '', 'search')).toBe('Search...');
  });
});
