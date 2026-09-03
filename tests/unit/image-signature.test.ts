import { describe, expect, it } from 'vitest';
import { probeImage } from '@/lib/uploads/image-signature';
import {
  HOSTILE_FILES,
  REAL_IMAGES,
  fixtureImage,
  pngWithDeclaredSize,
} from '../fixtures/images';

/**
 * The content probe.
 *
 * A browser's `Content-Type` is a claim. Requirements & SOW section 13 and the
 * Technical Development Specification section 11 require content validation, so
 * this module answers what a file actually is by reading its bytes.
 *
 * The accepted cases are real files produced by a real encoder. Verifying a
 * parser against bytes written to satisfy it proves nothing.
 */

describe('recognising real images', () => {
  for (const [label, image] of Object.entries(REAL_IMAGES)) {
    it(`reads the format and dimensions of a ${label} file`, () => {
      const probe = probeImage(fixtureImage(image.file));
      expect(probe).not.toBeNull();
      expect(probe!.width).toBe(image.width);
      expect(probe!.height).toBe(image.height);
    });
  }

  it('reports the format the bytes actually are', () => {
    expect(probeImage(fixtureImage(REAL_IMAGES.jpeg.file))?.format).toBe('image/jpeg');
    expect(probeImage(fixtureImage(REAL_IMAGES.png.file))?.format).toBe('image/png');
    expect(probeImage(fixtureImage(REAL_IMAGES.webpLossy.file))?.format).toBe(
      'image/webp',
    );
    expect(probeImage(fixtureImage(REAL_IMAGES.webpLossless.file))?.format).toBe(
      'image/webp',
    );
  });
});

describe('refusing everything else', () => {
  for (const [label, bytes] of Object.entries(HOSTILE_FILES)) {
    it(`refuses ${label}`, () => {
      expect(probeImage(bytes)).toBeNull();
    });
  }

  it('refuses a file that only starts like a JPEG', () => {
    // The magic bytes are right and nothing else is. A probe that stopped at
    // the first three bytes would accept a script here.
    expect(probeImage(HOSTILE_FILES.jpegPrefixedScript)).toBeNull();
  });

  it('refuses a PNG signature with a corrupted header', () => {
    const png = fixtureImage(REAL_IMAGES.png.file);
    const damaged = png.slice();
    damaged[13] = 0x00; // break "IHDR"
    expect(probeImage(damaged)).toBeNull();
  });

  it('refuses a RIFF container that is not WebP', () => {
    const wav = new Uint8Array(64);
    wav.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
    wav.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
    expect(probeImage(wav)).toBeNull();
  });

  it('terminates on a JPEG made of nothing but marker padding', () => {
    const hostile = new Uint8Array(4096).fill(0xff);
    hostile[0] = 0xff;
    hostile[1] = 0xd8;
    expect(probeImage(hostile)).toBeNull();
  });
});

describe('decompression bombs', () => {
  it('reports the declared canvas rather than trusting the file size', () => {
    const bomb = pngWithDeclaredSize(20_000, 20_000);
    // A few hundred bytes on disk, 400 megapixels once decoded. The probe
    // reports the truth so the caller can refuse it.
    expect(bomb.byteLength).toBeLessThan(1024);
    expect(probeImage(bomb)).toEqual({
      format: 'image/png',
      width: 20_000,
      height: 20_000,
    });
  });
});
