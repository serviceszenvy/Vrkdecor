import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';
import {
  contrastContract,
  glass,
  logoColors,
  minTouchTargetPx,
  palette,
  radii,
  semanticColors,
} from '@/lib/design-tokens';

const globalsCss = readFileSync(
  fileURLToPath(new URL('../../app/globals.css', import.meta.url)),
  'utf8',
);

function cssVar(name: string): string | undefined {
  const match = globalsCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1]?.trim();
}

describe('design tokens — logo fidelity', () => {
  it('anchors the accent scale to the lime measured in the logo wordmark', () => {
    expect(palette.accent[500].toLowerCase()).toBe(logoColors.lime.toLowerCase());
  });

  it('anchors the brand scale to the sage measured in the logo', () => {
    expect(palette.brand[700].toLowerCase()).toBe(logoColors.sage.toLowerCase());
  });
});

describe('design tokens — CSS parity', () => {
  it('mirrors every palette step into app/globals.css', () => {
    for (const [name, scale] of Object.entries(palette)) {
      for (const [step, hex] of Object.entries(scale)) {
        const declared = cssVar(`color-${name}-${step}`);
        expect(declared, `--color-${name}-${step} must be declared`).toBeDefined();
        expect(
          declared?.toLowerCase(),
          `--color-${name}-${step} must match lib/design-tokens.ts`,
        ).toBe(hex.toLowerCase());
      }
    }
  });

  it('declares the semantic surface and ink roles used by components', () => {
    const expected: Record<string, string> = {
      'color-surface': semanticColors.surface,
      'color-canvas': semanticColors.canvas,
      'color-canvas-deep': semanticColors.canvasDeep,
      'color-surface-tint': semanticColors.surfaceTint,
      'color-surface-subtle': semanticColors.surfaceSubtle,
      'color-surface-muted': semanticColors.surfaceMuted,
      'color-surface-inverse': semanticColors.surfaceInverse,
      'color-ink': semanticColors.ink,
      'color-ink-muted': semanticColors.inkMuted,
      'color-ink-soft': semanticColors.inkSoft,
      'color-ink-inverse': semanticColors.inkInverse,
      'color-line': semanticColors.border,
      'color-line-soft': semanticColors.borderSoft,
    };

    for (const [variable, hex] of Object.entries(expected)) {
      expect(cssVar(variable)?.toLowerCase(), `--${variable}`).toBe(hex.toLowerCase());
    }
  });

  it('declares the display and sans font stacks as the webfont swap point', () => {
    expect(cssVar('font-display')).toBeDefined();
    expect(cssVar('font-sans')).toBeDefined();
  });

  it('loads no third-party webfont, which is still an open client decision', () => {
    expect(globalsCss).not.toContain('@font-face');
    expect(globalsCss).not.toContain('fonts.googleapis.com');
    expect(globalsCss).not.toContain('fonts.gstatic.com');
  });

  it('mirrors every radius step into app/globals.css', () => {
    for (const [step, value] of Object.entries(radii)) {
      if (step === 'full') continue;
      expect(cssVar(`radius-${step}`), `--radius-${step}`).toBe(value);
    }
  });

  it('mirrors the glass tokens into app/globals.css', () => {
    const expected: Record<string, string> = {
      'glass-surface': glass.surface,
      'glass-surface-strong': glass.surfaceStrong,
      'glass-surface-tint': glass.surfaceTint,
      'glass-surface-inverse': glass.surfaceInverse,
      'glass-border': glass.border,
      'glass-border-soft': glass.borderSoft,
      'glass-highlight': glass.highlight,
      'glass-blur': glass.blur,
      'glass-blur-strong': glass.blurStrong,
    };

    for (const [variable, value] of Object.entries(expected)) {
      expect(cssVar(variable), `--${variable}`).toBe(value);
    }
  });

  it('keeps the backdrop blur radius small enough for a mid-range phone', () => {
    // A large backdrop-filter radius repaints on every scroll frame. The design
    // system commits to a ceiling rather than leaving it to taste.
    for (const value of [glass.blur, glass.blurStrong]) {
      expect(Number.parseFloat(value)).toBeLessThanOrEqual(24);
    }
  });

  it('degrades every glass surface to an opaque-enough panel without blur', () => {
    // The base rules must not depend on backdrop-filter; the translucent values
    // are applied only inside the @supports block.
    for (const rule of [
      '.glass-surface {',
      '.glass-surface-strong {',
      '.glass-surface-tint {',
    ]) {
      const start = globalsCss.indexOf(rule);
      expect(start, rule).toBeGreaterThan(-1);
      const block = globalsCss.slice(start, globalsCss.indexOf('}', start));
      expect(block, rule).toContain('background-color');
      expect(block, rule).not.toContain('backdrop-filter');
    }
  });
});

describe('design tokens — WCAG 2.1 contrast contract', () => {
  it.each(contrastContract.map((pair) => [pair.name, pair] as const))(
    'meets its required ratio: %s',
    (_name, pair) => {
      const ratio = contrastRatio(pair.fg, pair.bg);
      expect(
        Number(ratio.toFixed(2)),
        `${pair.fg} on ${pair.bg} was ${ratio.toFixed(2)}:1, needs ${pair.min}:1`,
      ).toBeGreaterThanOrEqual(pair.min);
    },
  );

  it('keeps the logo lime off white backgrounds for text use', () => {
    // Documented constraint: the logo lime is a highlight colour, not a text
    // colour on white. This test records why `accent-500` is never used for
    // small text on a light surface.
    expect(contrastRatio(palette.accent[500], '#FFFFFF')).toBeLessThan(4.5);
  });
});

describe('design tokens — interaction', () => {
  it('commits to a 44px minimum touch target', () => {
    expect(minTouchTargetPx).toBeGreaterThanOrEqual(44);
  });
});
