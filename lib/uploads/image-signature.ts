/**
 * Image content inspection — magic bytes and pixel dimensions.
 *
 * A browser-supplied `Content-Type` is a claim, not a fact. Requirements & SOW
 * section 13 and the Technical Development Specification section 11 require
 * file TYPE, CONTENT, SIZE and DIMENSION validation before anything is stored,
 * so this module reads the bytes and answers what the file actually is.
 *
 * It parses headers only. It never decodes pixel data, which is deliberate:
 * decoding attacker-supplied images is itself an attack surface, and the
 * dimensions live in the first few dozen bytes of every format we accept.
 *
 * No dependency is used. An image library would pull a large native binary
 * into a Hostinger managed Node deployment for three header reads, and CLAUDE.md
 * says to avoid unnecessary dependencies.
 *
 * Supported: JPEG, PNG, WebP — exactly the reference bucket's allow-list.
 * Everything else, SVG and GIF included, is reported as unrecognised.
 */

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type ImageProbe = {
  format: ImageFormat;
  width: number;
  height: number;
};

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.length < magic.length) return false;
  return magic.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let out = '';
  for (let i = offset; i < offset + length; i += 1) {
    const code = bytes[i];
    if (code === undefined) return '';
    out += String.fromCharCode(code);
  }
  return out;
}

function readUInt32BE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 4 > bytes.length) return null;
  return (
    ((bytes[offset]! << 24) |
      (bytes[offset + 1]! << 16) |
      (bytes[offset + 2]! << 8) |
      bytes[offset + 3]!) >>>
    0
  );
}

function readUInt16BE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 2 > bytes.length) return null;
  return (bytes[offset]! << 8) | bytes[offset + 1]!;
}

function readUInt24LE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 3 > bytes.length) return null;
  return bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16);
}

function readUInt16LE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 2 > bytes.length) return null;
  return bytes[offset]! | (bytes[offset + 1]! << 8);
}

function readUInt32LE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 4 > bytes.length) return null;
  return (
    (bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24)) >>>
    0
  );
}

/** PNG: the IHDR chunk is mandatory and is always the first chunk. */
function probePng(bytes: Uint8Array): ImageProbe | null {
  if (ascii(bytes, 12, 4) !== 'IHDR') return null;

  const width = readUInt32BE(bytes, 16);
  const height = readUInt32BE(bytes, 20);
  if (!width || !height) return null;

  return { format: 'image/png', width, height };
}

/**
 * JPEG: walk the marker segments to the frame header.
 *
 * The walk is bounded by the buffer and by a segment ceiling, so a malformed or
 * hostile file cannot turn this into a long loop.
 */
function probeJpeg(bytes: Uint8Array): ImageProbe | null {
  let offset = 2;
  let segments = 0;

  while (offset + 3 < bytes.length && segments < 512) {
    segments += 1;

    if (bytes[offset] !== 0xff) return null;

    let marker = bytes[offset + 1]!;
    // Fill bytes: any number of 0xFF may pad a marker.
    while (marker === 0xff && offset + 2 < bytes.length) {
      offset += 1;
      marker = bytes[offset + 1]!;
    }

    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    // Start of scan or end of image: the frame header should already have been
    // seen. Anything after this is entropy-coded data, not headers.
    if (marker === 0xda || marker === 0xd9) return null;

    const length = readUInt16BE(bytes, offset + 2);
    if (length === null || length < 2) return null;

    const isFrameHeader =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isFrameHeader) {
      const height = readUInt16BE(bytes, offset + 5);
      const width = readUInt16BE(bytes, offset + 7);
      if (!width || !height) return null;
      return { format: 'image/jpeg', width, height };
    }

    offset += 2 + length;
  }

  return null;
}

/** WebP: RIFF container, then one of the three frame chunk types. */
function probeWebp(bytes: Uint8Array): ImageProbe | null {
  const chunk = ascii(bytes, 12, 4);

  if (chunk === 'VP8 ') {
    // Lossy: 3-byte frame tag, then the 3-byte start code, then two
    // little-endian 16-bit values whose low 14 bits are the dimensions.
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    const width = readUInt16LE(bytes, 26);
    const height = readUInt16LE(bytes, 28);
    if (width === null || height === null) return null;
    const w = width & 0x3fff;
    const h = height & 0x3fff;
    return w && h ? { format: 'image/webp', width: w, height: h } : null;
  }

  if (chunk === 'VP8L') {
    if (bytes[20] !== 0x2f) return null;
    // Little-endian bit stream: 14 bits of width-1, then 14 bits of height-1.
    const bits = readUInt32LE(bytes, 21);
    if (bits === null) return null;
    return {
      format: 'image/webp',
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === 'VP8X') {
    const width = readUInt24LE(bytes, 24);
    const height = readUInt24LE(bytes, 27);
    if (width === null || height === null) return null;
    return { format: 'image/webp', width: width + 1, height: height + 1 };
  }

  return null;
}

/**
 * Reports what a buffer actually contains, or null when it is not one of the
 * three accepted raster formats.
 *
 * A null answer is the safe default: an unrecognised file is refused rather
 * than stored on the assumption that the browser's label was honest.
 */
export function probeImage(bytes: Uint8Array): ImageProbe | null {
  if (bytes.length < 32) return null;

  if (startsWith(bytes, PNG_MAGIC)) return probePng(bytes);
  if (startsWith(bytes, JPEG_MAGIC)) return probeJpeg(bytes);
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    return probeWebp(bytes);
  }

  return null;
}
