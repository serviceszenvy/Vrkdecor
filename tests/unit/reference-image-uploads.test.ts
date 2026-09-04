import { describe, expect, it } from 'vitest';
import { MAX_REFERENCE_IMAGES_PER_ENQUIRY } from '@/lib/storage/buckets';
import {
  MAX_REFERENCE_IMAGE_BYTES,
  MAX_REFERENCE_IMAGE_EDGE,
  MIN_REFERENCE_IMAGE_EDGE,
} from '@/lib/uploads/limits';
import {
  safeOriginalFilename,
  validateReferenceImageUploads,
} from '@/lib/uploads/reference-images';
import {
  HOSTILE_FILES,
  REAL_IMAGES,
  asUpload,
  fixtureImage,
  pngWithDeclaredSize,
} from '../fixtures/images';

/**
 * Secure upload validation — Requirements & SOW section 13, CLAUDE.md
 * ("Secure uploads", "File type/content/size/dimension validation").
 *
 * Every test here posts through the same `FormData` the Server Action receives,
 * because that is the only entry point: there is no other way for a file to
 * reach storage, and no code path that skips this function.
 */

const jpeg = () => fixtureImage(REAL_IMAGES.jpeg.file);
const png = () => fixtureImage(REAL_IMAGES.png.file);

function form(...files: File[]): FormData {
  const data = new FormData();
  data.set('name', 'Meena Rajan');
  for (const file of files) data.append('referenceImages', file);
  return data;
}

describe('an enquiry with no images', () => {
  it('is accepted, because the field is optional', async () => {
    const result = await validateReferenceImageUploads(new FormData());
    expect(result).toEqual({ success: true, images: [] });
  });

  it('ignores the empty part a browser posts for an untouched input', async () => {
    // Through a Server Action the placeholder arrives named "undefined"; a
    // plain HTML POST sends it with an empty name. Neither is an attachment,
    // and neither may turn an ordinary submission into an error.
    for (const name of ['undefined', '']) {
      const result = await validateReferenceImageUploads(
        form(asUpload(new Uint8Array(0), name, 'application/octet-stream')),
      );
      expect(result, name).toEqual({ success: true, images: [] });
    }
  });

  it('still refuses an empty file the customer really did choose', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(new Uint8Array(0), 'photo.jpg', 'image/jpeg')),
    );
    expect(result.success).toBe(false);
  });
});

describe('the three-image ceiling', () => {
  it('accepts three', async () => {
    const result = await validateReferenceImageUploads(
      form(
        asUpload(jpeg(), 'a.jpg', 'image/jpeg'),
        asUpload(png(), 'b.png', 'image/png'),
        asUpload(fixtureImage(REAL_IMAGES.webpLossy.file), 'c.webp', 'image/webp'),
      ),
    );
    expect(result.success).toBe(true);
    expect(result.success && result.images).toHaveLength(3);
  });

  it('refuses a fourth rather than silently dropping it', async () => {
    const result = await validateReferenceImageUploads(
      form(
        asUpload(jpeg(), 'a.jpg', 'image/jpeg'),
        asUpload(jpeg(), 'b.jpg', 'image/jpeg'),
        asUpload(jpeg(), 'c.jpg', 'image/jpeg'),
        asUpload(jpeg(), 'd.jpg', 'image/jpeg'),
      ),
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toContain(
      String(MAX_REFERENCE_IMAGES_PER_ENQUIRY),
    );
  });

  it('is the approved maximum of three', () => {
    expect(MAX_REFERENCE_IMAGES_PER_ENQUIRY).toBe(3);
  });
});

describe('content validation, not label validation', () => {
  const disguises: [string, Uint8Array][] = [
    ['an SVG', HOSTILE_FILES.svg],
    ['an HTML page', HOSTILE_FILES.html],
    ['a PHP script', HOSTILE_FILES.php],
    ['a ZIP archive', HOSTILE_FILES.zip],
    ['a GIF', HOSTILE_FILES.gif],
    ['a PDF', HOSTILE_FILES.pdf],
    ['a script behind JPEG magic bytes', HOSTILE_FILES.jpegPrefixedScript],
  ];

  for (const [label, bytes] of disguises) {
    it(`refuses ${label} claiming to be a JPEG`, async () => {
      const result = await validateReferenceImageUploads(
        form(asUpload(bytes, 'holiday.jpg', 'image/jpeg')),
      );
      expect(result.success).toBe(false);
    });
  }

  it('refuses a real image whose declared type is a lie', async () => {
    // A genuine PNG announced as a JPEG. The file is harmless; the disagreement
    // is not, because everything downstream stores and serves the declared type.
    const result = await validateReferenceImageUploads(
      form(asUpload(png(), 'photo.jpg', 'image/jpeg')),
    );
    expect(result.success).toBe(false);
  });

  it('refuses an accepted image announced with an unaccepted type', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(png(), 'photo.svg', 'image/svg+xml')),
    );
    expect(result.success).toBe(false);
  });

  it('refuses an empty file', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(HOSTILE_FILES.empty, 'empty.jpg', 'image/jpeg')),
    );
    expect(result.success).toBe(false);
  });

  it('records the proven type, never the claimed one', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(png(), 'photo.png', 'image/png')),
    );
    expect(result.success && result.images[0]?.mimeType).toBe('image/png');
  });
});

describe('size limits', () => {
  it('refuses a file over the 5 MB per-image limit', async () => {
    const oversized = new Uint8Array(MAX_REFERENCE_IMAGE_BYTES + 1);
    oversized.set(jpeg(), 0);
    const result = await validateReferenceImageUploads(
      form(asUpload(oversized, 'big.jpg', 'image/jpeg')),
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toMatch(/MB or smaller/);
  });

  it('accepts a file exactly at the limit', async () => {
    // Padding after EOI is legal in a JPEG and does not change what it is.
    const padded = new Uint8Array(MAX_REFERENCE_IMAGE_BYTES);
    padded.set(jpeg(), 0);
    const result = await validateReferenceImageUploads(
      form(asUpload(padded, 'exact.jpg', 'image/jpeg')),
    );
    expect(result.success).toBe(true);
  });
});

describe('dimension limits', () => {
  it('refuses an image below the minimum edge', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(fixtureImage(REAL_IMAGES.tooSmall.file), 'tiny.png', 'image/png')),
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toContain(
      String(MIN_REFERENCE_IMAGE_EDGE),
    );
  });

  it('refuses a decompression bomb that is small on disk', async () => {
    const bomb = pngWithDeclaredSize(20_000, 20_000);
    expect(bomb.byteLength).toBeLessThan(MAX_REFERENCE_IMAGE_BYTES);

    const result = await validateReferenceImageUploads(
      form(asUpload(bomb, 'wedding.png', 'image/png')),
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toContain(
      String(MAX_REFERENCE_IMAGE_EDGE),
    );
  });

  it('refuses a canvas inside the edge limits but over the pixel budget', async () => {
    // 11000 x 11000 is 121 megapixels with both edges under 12000.
    const result = await validateReferenceImageUploads(
      form(asUpload(pngWithDeclaredSize(11_000, 11_000), 'wide.png', 'image/png')),
    );
    expect(result.success).toBe(false);
  });

  it('reports the dimensions it read', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(jpeg(), 'a.jpg', 'image/jpeg')),
    );
    expect(result.success && result.images[0]).toMatchObject({
      width: REAL_IMAGES.jpeg.width,
      height: REAL_IMAGES.jpeg.height,
    });
  });
});

describe('the original filename', () => {
  it('never carries a path', () => {
    expect(safeOriginalFilename('../../../etc/passwd')).toBe('passwd');
    expect(safeOriginalFilename('C:\\Users\\me\\photo.jpg')).toBe('photo.jpg');
  });

  it('never carries a control or direction-override character', () => {
    expect(safeOriginalFilename('holiday\u202Egpj.exe')).toBe('holidaygpj.exe');
    expect(safeOriginalFilename('a\u0000b.png')).toBe('ab.png');
  });

  it('never becomes empty or a dotfile', () => {
    expect(safeOriginalFilename('   ')).toBe('inspiration-image');
    expect(safeOriginalFilename('...')).toBe('inspiration-image');
    expect(safeOriginalFilename('\u200B\u200B')).toBe('inspiration-image');
  });

  it('is bounded in length', () => {
    expect(safeOriginalFilename(`${'a'.repeat(500)}.jpg`).length).toBeLessThanOrEqual(
      120,
    );
  });

  it('is kept for display only, and is not the storage key', async () => {
    const result = await validateReferenceImageUploads(
      form(asUpload(jpeg(), 'my wedding <script>.jpg', 'image/jpeg')),
    );
    expect(result.success && result.images[0]?.originalFilename).toBe(
      'my wedding script.jpg',
    );
  });
});

describe('a mixed submission', () => {
  it('is refused whole when any one file fails', async () => {
    // Partial acceptance would leave the customer believing all three arrived.
    const result = await validateReferenceImageUploads(
      form(
        asUpload(jpeg(), 'good.jpg', 'image/jpeg'),
        asUpload(HOSTILE_FILES.php, 'bad.jpg', 'image/jpeg'),
      ),
    );
    expect(result.success).toBe(false);
  });
});
