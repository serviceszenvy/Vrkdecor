import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

/**
 * Image fixtures for the upload-validation suite.
 *
 * The accepted files are REAL images committed under `tests/fixtures/images/`,
 * a few kilobytes each, so the header parser is verified against files a
 * genuine encoder produced rather than against bytes written to satisfy it.
 *
 * The hostile files are built here, in code, because they have to be exactly
 * wrong in one specific way: a script wearing a `.jpg` name, a PNG whose IHDR
 * declares a canvas nobody could decode, a file that begins with a JPEG's magic
 * bytes and continues as something else.
 */

const dir = fileURLToPath(new URL('./images/', import.meta.url));

export function fixtureImage(name: string): Uint8Array {
  return new Uint8Array(readFileSync(dir + name));
}

export function fixturePath(name: string): string {
  return dir + name;
}

export const REAL_IMAGES = {
  jpeg: { file: 'reference-800x600.jpg', width: 800, height: 600 },
  png: { file: 'reference-640x480.png', width: 640, height: 480 },
  webpLossless: { file: 'reference-320x240-lossless.webp', width: 320, height: 240 },
  webpLossy: { file: 'reference-1024x768-lossy.webp', width: 1024, height: 768 },
  webpAlpha: { file: 'reference-500x400-alpha.webp', width: 500, height: 400 },
  tooSmall: { file: 'too-small-100x80.png', width: 100, height: 80 },
} as const;

/** A `File` as a browser would submit it, with a declared type of our choosing. */
export function asUpload(bytes: Uint8Array, name: string, type: string): File {
  return new File([bytes as unknown as BlobPart], name, { type });
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i += 1) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/**
 * A PNG whose header declares `width` x `height`.
 *
 * At 20000 x 20000 the file is a few hundred bytes and the canvas is 400
 * megapixels: the classic decompression bomb. Nothing in this application
 * decodes it, but an admin's browser would, which is why the dimension check
 * exists.
 */
export function pngWithDeclaredSize(width: number, height: number): Uint8Array {
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  const idat = pngChunk('IDAT', new Uint8Array(deflateSync(new Uint8Array(16))));
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = pngChunk('IHDR', ihdr);
  const end = pngChunk('IEND', new Uint8Array(0));

  const out = new Uint8Array(
    signature.length + header.length + idat.length + end.length,
  );
  out.set(signature, 0);
  out.set(header, signature.length);
  out.set(idat, signature.length + header.length);
  out.set(end, signature.length + header.length + idat.length);
  return out;
}

const encoder = new TextEncoder();

/** Files that must never be accepted, whatever they are named or labelled. */
export const HOSTILE_FILES = {
  svg: encoder.encode(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><script>alert(1)</script></svg>',
  ),
  html: encoder.encode(
    '<!doctype html><html><body><script>alert(document.cookie)</script></body></html>'.padEnd(
      200,
      ' ',
    ),
  ),
  php: encoder.encode('<?php system($_GET["c"]); ?>'.padEnd(200, ' ')),
  zip: new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new Array(200).fill(0x41)]),
  gif: new Uint8Array([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61,
    ...new Array(200).fill(0x00),
  ]),
  pdf: encoder.encode('%PDF-1.7\n'.padEnd(200, 'x')),
  /** JPEG magic bytes, then a script. A "polyglot" attempt. */
  jpegPrefixedScript: new Uint8Array([
    0xff,
    0xd8,
    0xff,
    ...encoder.encode('<?php system($_GET["c"]); ?>'.padEnd(300, ' ')),
  ]),
  empty: new Uint8Array(0),
  tooShort: new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
} as const;
