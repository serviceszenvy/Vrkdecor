import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, relativeLuminance } from '@/lib/contrast';

describe('contrast utilities', () => {
  it('parses six- and three-digit hex colours', () => {
    expect(hexToRgb('#8EC840')).toEqual([142, 200, 64]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
  });

  it('rejects malformed hex colours', () => {
    expect(() => hexToRgb('#ZZZZZZ')).toThrow();
    expect(() => hexToRgb('#12345')).toThrow();
  });

  it('computes the known luminance bounds', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('computes the known maximum contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#61764B', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#61764B'),
      10,
    );
  });
});
