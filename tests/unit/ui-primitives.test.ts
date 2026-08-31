import { describe, expect, it } from 'vitest';
import { buttonClassNames } from '@/components/ui/button';
import { cn } from '@/lib/cn';

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('button variants', () => {
  it('applies a distinct class set per variant', () => {
    const primary = buttonClassNames('primary', 'md', false);
    const outline = buttonClassNames('outline', 'md', false);

    expect(primary).toContain('bg-brand-800');
    expect(outline).toContain('border-brand-700');
    expect(primary).not.toBe(outline);
  });

  it('never drops below the 44px minimum touch target', () => {
    // min-h-11 = 2.75rem = 44px; larger sizes use min-h-12 and min-h-14.
    for (const size of ['sm', 'md', 'lg'] as const) {
      const classes = buttonClassNames('primary', size, false);
      const match = classes.match(/min-h-(\d+)/);
      expect(match?.[1], size).toBeDefined();
      expect(Number(match?.[1]), size).toBeGreaterThanOrEqual(11);
    }
  });

  it('adds a full-width class only when requested', () => {
    expect(buttonClassNames('primary', 'md', true)).toContain('w-full');
    expect(buttonClassNames('primary', 'md', false)).not.toContain('w-full');
  });

  it('appends caller class names last so they can override', () => {
    expect(buttonClassNames('primary', 'md', false, 'custom-class')).toMatch(
      /custom-class$/,
    );
  });
});
