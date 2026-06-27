/**
 * Generates public/opengraph.jpg (1200x630) as a valid JPEG.
 * Pure Node.js — zero npm dependencies.
 * Uses the built-in Jimp-free approach: writes raw PPM bytes then converts
 * to JPEG via the JPEG encoder written inline.
 *
 * JPEG encoding strategy:
 *   1. Render every pixel into an RGB buffer (1200×630).
 *   2. Encode that buffer as a valid baseline JPEG using a minimal
 *      pure-JS encoder (SOI, APP0, DQT, SOF0, DHT, SOS, EOI).
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "public", "opengraph.jpg");

const W = 1200;
const H = 630;

// ─── 1. Render pixels into RGB Uint8Array ────────────────────────────────────

const pixels = new Uint8Array(W * H * 3);

function setPixel(x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b;
}

// Background: dark purple gradient left→right  #0D0020 → #1A0035 → #0D0020
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = x / W;
    // Linear interpolation between three stops
    let r, g, b;
    if (t < 0.5) {
      const u = t / 0.5;
      r = Math.round(0x0D + (0x1A - 0x0D) * u);
      g = 0;
      b = Math.round(0x20 + (0x35 - 0x20) * u);
    } else {
      const u = (t - 0.5) / 0.5;
      r = Math.round(0x1A + (0x0D - 0x1A) * u);
      g = 0;
      b = Math.round(0x35 + (0x20 - 0x35) * u);
    }
    // Slight vertical vignette (darken top and bottom edges)
    const vy = 1 - 0.25 * Math.pow(Math.abs((y - H / 2) / (H / 2)), 2);
    setPixel(x, y, Math.round(r * vy), Math.round(g * vy), Math.round(b * vy));
  }
}

// Purple glow orb top-right (radial)
for (let y = 0; y < H; y++) {
  for (let x = W * 0.55 | 0; x < W; x++) {
    const dx = x - W * 0.77;
    const dy = y - H * 0.22;
    const d = Math.sqrt(dx * dx + dy * dy) / 330;
    if (d >= 1) continue;
    const alpha = Math.max(0, (1 - d) * 0.45);
    const i = (y * W + x) * 3;
    pixels[i]   = Math.min(255, pixels[i]   + Math.round(74  * alpha));
    pixels[i+1] = Math.min(255, pixels[i+1] + Math.round(0   * alpha));
    pixels[i+2] = Math.min(255, pixels[i+2] + Math.round(224 * alpha));
  }
}

// Orange accent orb bottom-left
for (let y = H * 0.55 | 0; y < H; y++) {
  for (let x = 0; x < W * 0.35 | 0; x++) {
    const dx = x - W * 0.15;
    const dy = y - H * 0.85;
    const d = Math.sqrt(dx * dx + dy * dy) / 220;
    if (d >= 1) continue;
    const alpha = Math.max(0, (1 - d) * 0.3);
    const i = (y * W + x) * 3;
    pixels[i]   = Math.min(255, pixels[i]   + Math.round(255 * alpha));
    pixels[i+1] = Math.min(255, pixels[i+1] + Math.round(138 * alpha));
    pixels[i+2] = Math.min(255, pixels[i+2] + Math.round(61  * alpha));
  }
}

// Horizontal rule at y=410
for (let x = 60; x < W - 60; x++) {
  const i = (410 * W + x) * 3;
  pixels[i]   = Math.min(255, pixels[i]   + 25);
  pixels[i+1] = Math.min(255, pixels[i+1] + 25);
  pixels[i+2] = Math.min(255, pixels[i+2] + 35);
}

// ─── Simple font rasteriser (5×7 bitmap) ─────────────────────────────────────
// Each char: 5 cols × 7 rows, packed into 5 bytes (one per column, bit0=top)
const FONT5X7 = {
  ' ':  [0x00,0x00,0x00,0x00,0x00],
  'A':  [0x7E,0x11,0x11,0x11,0x7E],
  'B':  [0x7F,0x49,0x49,0x49,0x36],
  'C':  [0x3E,0x41,0x41,0x41,0x22],
  'D':  [0x7F,0x41,0x41,0x22,0x1C],
  'E':  [0x7F,0x49,0x49,0x49,0x41],
  'F':  [0x7F,0x09,0x09,0x09,0x01],
  'G':  [0x3E,0x41,0x49,0x49,0x7A],
  'H':  [0x7F,0x08,0x08,0x08,0x7F],
  'I':  [0x00,0x41,0x7F,0x41,0x00],
  'J':  [0x20,0x40,0x41,0x3F,0x01],
  'K':  [0x7F,0x08,0x14,0x22,0x41],
  'L':  [0x7F,0x40,0x40,0x40,0x40],
  'M':  [0x7F,0x02,0x0C,0x02,0x7F],
  'N':  [0x7F,0x04,0x08,0x10,0x7F],
  'O':  [0x3E,0x41,0x41,0x41,0x3E],
  'P':  [0x7F,0x09,0x09,0x09,0x06],
  'Q':  [0x3E,0x41,0x51,0x21,0x5E],
  'R':  [0x7F,0x09,0x19,0x29,0x46],
  'S':  [0x46,0x49,0x49,0x49,0x31],
  'T':  [0x01,0x01,0x7F,0x01,0x01],
  'U':  [0x3F,0x40,0x40,0x40,0x3F],
  'V':  [0x1F,0x20,0x40,0x20,0x1F],
  'W':  [0x3F,0x40,0x38,0x40,0x3F],
  'X':  [0x63,0x14,0x08,0x14,0x63],
  'Y':  [0x07,0x08,0x70,0x08,0x07],
  'Z':  [0x61,0x51,0x49,0x45,0x43],
  'a':  [0x20,0x54,0x54,0x54,0x78],
  'b':  [0x7F,0x48,0x44,0x44,0x38],
  'c':  [0x38,0x44,0x44,0x44,0x20],
  'd':  [0x38,0x44,0x44,0x48,0x7F],
  'e':  [0x38,0x54,0x54,0x54,0x18],
  'f':  [0x08,0x7E,0x09,0x01,0x02],
  'g':  [0x0C,0x52,0x52,0x52,0x3E],
  'h':  [0x7F,0x08,0x04,0x04,0x78],
  'i':  [0x00,0x44,0x7D,0x40,0x00],
  'j':  [0x20,0x40,0x44,0x3D,0x00],
  'k':  [0x7F,0x10,0x28,0x44,0x00],
  'l':  [0x00,0x41,0x7F,0x40,0x00],
  'm':  [0x7C,0x04,0x18,0x04,0x78],
  'n':  [0x7C,0x08,0x04,0x04,0x78],
  'o':  [0x38,0x44,0x44,0x44,0x38],
  'p':  [0x7C,0x14,0x14,0x14,0x08],
  'q':  [0x08,0x14,0x14,0x18,0x7C],
  'r':  [0x7C,0x08,0x04,0x04,0x08],
  's':  [0x48,0x54,0x54,0x54,0x20],
  't':  [0x04,0x3F,0x44,0x40,0x20],
  'u':  [0x3C,0x40,0x40,0x20,0x7C],
  'v':  [0x1C,0x20,0x40,0x20,0x1C],
  'w':  [0x3C,0x40,0x20,0x40,0x3C],
  'x':  [0x44,0x28,0x10,0x28,0x44],
  'y':  [0x0C,0x50,0x50,0x50,0x3C],
  'z':  [0x44,0x64,0x54,0x4C,0x44],
  '0':  [0x3E,0x51,0x49,0x45,0x3E],
  '1':  [0x00,0x42,0x7F,0x40,0x00],
  '2':  [0x42,0x61,0x51,0x49,0x46],
  '3':  [0x21,0x41,0x45,0x4B,0x31],
  '4':  [0x18,0x14,0x12,0x7F,0x10],
  '5':  [0x27,0x45,0x45,0x45,0x39],
  '6':  [0x3C,0x4A,0x49,0x49,0x30],
  '7':  [0x01,0x71,0x09,0x05,0x03],
  '8':  [0x36,0x49,0x49,0x49,0x36],
  '9':  [0x06,0x49,0x49,0x29,0x1E],
  '#':  [0x14,0x7F,0x14,0x7F,0x14],
  '\'': [0x00,0x05,0x03,0x00,0x00],
  '.':  [0x00,0x60,0x60,0x00,0x00],
  ',':  [0x00,0x50,0x30,0x00,0x00],
  '-':  [0x08,0x08,0x08,0x08,0x08],
  ':':  [0x00,0x36,0x36,0x00,0x00],
  '!':  [0x00,0x7B,0x00,0x00,0x00],
  '%':  [0x23,0x13,0x08,0x64,0x62],
  '/':  [0x20,0x10,0x08,0x04,0x02],
  '₹':  [0x7F,0x09,0x7F,0x49,0x31],  // approximation
  'Up': [0x04,0x02,0x7F,0x02,0x04],  // up-arrow placeholder
};

function drawText(text, sx, sy, scale, r, g, b) {
  let cx = sx;
  for (const ch of text) {
    const glyph = FONT5X7[ch] || FONT5X7[' '];
    for (let col = 0; col < 5; col++) {
      const colBits = glyph[col];
      for (let row = 0; row < 7; row++) {
        if (colBits & (1 << row)) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              setPixel(cx + col * scale + dx, sy + row * scale + dy, r, g, b);
            }
          }
        }
      }
    }
    cx += 6 * scale;
  }
  return cx; // returns x after last char
}

// ─── Draw text layers ─────────────────────────────────────────────────────────

// "INDIA'S #1 PROP TRADING FIRM" — small badge text at top
drawText("INDIA'S  #1  PROP  TRADING  FIRM", 60, 60, 3, 167, 139, 250);

// "FundedWealth" — large brand name (two colours)
const fwEnd = drawText("Funded", 60, 140, 7, 255, 255, 255);
drawText("Wealth", fwEnd + 10, 140, 7, 255, 138, 61);

// "Get Funded Up To" line
drawText("Get  Funded  Up  To", 60, 300, 4, 220, 220, 255);
// "50 Lakhs" in orange
drawText("50  Lakhs", 60, 355, 4, 255, 138, 61);

// Three stats along the bottom
const stats = ["70-90%  Profit  Split", "12-Hour  Payouts", "From  999"];
let sx = 60;
for (const s of stats) {
  // Draw pill background (light translucent)
  const pillW = s.length * 6 * 2 + 30;
  for (let py = 430; py < 475; py++) {
    for (let px = sx - 10; px < sx + pillW; px++) {
      const i = (py * W + px) * 3;
      if (i >= 0 && i < pixels.length - 2) {
        pixels[i]   = Math.min(255, pixels[i]   + 20);
        pixels[i+1] = Math.min(255, pixels[i+1] + 20);
        pixels[i+2] = Math.min(255, pixels[i+2] + 30);
      }
    }
  }
  drawText(s, sx, 440, 2, 200, 200, 240);
  sx += pillW + 30;
}

// "fundedwealth.com" bottom-right watermark
drawText("fundedwealth.com", 60, 560, 2, 120, 100, 160);

// ─── 2. Encode as JPEG ───────────────────────────────────────────────────────
// We use a well-known minimal pure-JS JPEG encoder.
// Source: adapted from jpeg-js encoder (MIT) — inlined to avoid npm.

const ZIGZAG = [
   0, 1, 8,16, 9, 2, 3,10,17,24,32,25,18,11, 4, 5,
  12,19,26,33,40,48,41,34,27,20,13, 6, 7,14,21,28,
  35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
  58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
];

// Standard JPEG luminance quantisation table (quality 85 approximation)
function buildQuantTable(factor) {
  const lum = [
    16,11,10,16,24,40,51,61, 12,12,14,19,26,58,60,55,
    14,13,16,24,40,57,69,56, 14,17,22,29,51,87,80,62,
    18,22,37,56,68,109,103,77, 24,35,55,64,81,104,113,92,
    49,64,78,87,103,121,120,101, 72,92,95,98,112,100,103,99
  ];
  const chr = [
    17,18,24,47,99,99,99,99, 18,21,26,66,99,99,99,99,
    24,26,56,99,99,99,99,99, 47,66,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99, 99,99,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99, 99,99,99,99,99,99,99,99
  ];
  const scale = factor < 50 ? Math.floor(5000 / factor) : Math.floor(200 - 2 * factor);
  const clamp = v => Math.max(1, Math.min(255, Math.floor((v * scale + 50) / 100)));
  return { lum: lum.map(clamp), chr: chr.map(clamp) };
}

// Huffman tables (standard JPEG AC/DC for Y and CbCr)
const STD_DC_LUMA_NRCODES  = [0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
const STD_DC_LUMA_VALUES   = [0,1,2,3,4,5,6,7,8,9,10,11];
const STD_AC_LUMA_NRCODES  = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
const STD_AC_LUMA_VALUES   = [
  0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,
  0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,
  0xd1,0xf0,0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,
  0x26,0x27,0x28,0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,
  0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,
  0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,
  0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,
  0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,
  0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,
  0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,
  0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa
];
const STD_DC_CHROMA_NRCODES = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
const STD_DC_CHROMA_VALUES  = [0,1,2,3,4,5,6,7,8,9,10,11];
const STD_AC_CHROMA_NRCODES = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
const STD_AC_CHROMA_VALUES  = [
  0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,
  0x71,0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,
  0x52,0xf0,0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,
  0x19,0x1a,0x26,0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,
  0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,
  0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,
  0x82,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,
  0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,
  0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,
  0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,
  0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa
];

function computeHuffmanTable(nrcodes, values) {
  let code = 0;
  let si = 1;
  const htCodes  = new Array(256).fill(0);
  const htSizes  = new Array(256).fill(0);
  for (let i = 1; i <= 16; i++) {
    for (let j = 1; j <= nrcodes[i]; j++) {
      htCodes[values[si - 1]] = code;
      htSizes[values[si - 1]] = i;
      code++;
      si++;
    }
    code <<= 1;
  }
  return { codes: htCodes, sizes: htSizes };
}

const YDC = computeHuffmanTable(STD_DC_LUMA_NRCODES,   STD_DC_LUMA_VALUES);
const YAC = computeHuffmanTable(STD_AC_LUMA_NRCODES,   STD_AC_LUMA_VALUES);
const CrDC= computeHuffmanTable(STD_DC_CHROMA_NRCODES, STD_DC_CHROMA_VALUES);
const CrAC= computeHuffmanTable(STD_AC_CHROMA_NRCODES, STD_AC_CHROMA_VALUES);

const { lum: QLUM, chr: QCHR } = buildQuantTable(85);

// DCT (forward, 8x8)
function fdct(block) {
  const out = new Float32Array(64);
  const c = 0.7071067811865476; // 1/sqrt(2)
  for (let v = 0; v < 8; v++) {
    for (let u = 0; u < 8; u++) {
      let s = 0;
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
          s += block[y * 8 + x] *
               Math.cos((2*x+1)*u*Math.PI/16) *
               Math.cos((2*y+1)*v*Math.PI/16);
      const cu = u === 0 ? c : 1;
      const cv = v === 0 ? c : 1;
      out[v * 8 + u] = 0.25 * cu * cv * s;
    }
  }
  return out;
}

// Bit writer
const buf = [];
let bitBuf = 0, bitCnt = 0;

function writeByte(b) { buf.push(b & 0xFF); }
function writeWord(w) { writeByte(w >> 8); writeByte(w & 0xFF); }

function writeBits(val, len) {
  bitBuf = (bitBuf << len) | val;
  bitCnt += len;
  while (bitCnt >= 8) {
    bitCnt -= 8;
    const b = (bitBuf >> bitCnt) & 0xFF;
    writeByte(b);
    if (b === 0xFF) writeByte(0x00); // byte stuffing
  }
}

function flushBits() {
  if (bitCnt > 0) {
    writeByte((bitBuf << (8 - bitCnt)) & 0xFF);
    bitBuf = 0; bitCnt = 0;
  }
}

function getSizeCode(val) {
  let a = Math.abs(val), s = 0;
  while (a) { a >>= 1; s++; }
  return s;
}

function encodeCoeff(dc, dcTable, acTable, prevDC) {
  // DC
  const diff = dc - prevDC;
  const s = getSizeCode(diff);
  writeBits(dcTable.codes[s], dcTable.sizes[s]);
  if (s > 0) writeBits(diff < 0 ? diff - 1 + (1 << s) : diff, s);
  return dc;
}

function encodeAC(acCoeffs, acTable) {
  let runLen = 0;
  for (let k = 1; k < 64; k++) {
    const v = acCoeffs[k];
    if (v === 0) {
      if (k === 63) { writeBits(acTable.codes[0], acTable.sizes[0]); return; }
      runLen++;
    } else {
      while (runLen >= 16) {
        writeBits(acTable.codes[0xF0], acTable.sizes[0xF0]);
        runLen -= 16;
      }
      const s = getSizeCode(v);
      const sym = (runLen << 4) | s;
      writeBits(acTable.codes[sym], acTable.sizes[sym]);
      writeBits(v < 0 ? v - 1 + (1 << s) : v, s);
      runLen = 0;
    }
  }
}

function quantize(dct, qtable) {
  const out = new Int32Array(64);
  for (let i = 0; i < 64; i++)
    out[ZIGZAG[i]] = Math.round(dct[i] / qtable[i]);
  return out;
}

// RGB → YCbCr
function toYCbCr(r, g, b) {
  const Y  =  0.299   * r + 0.587   * g + 0.114   * b;
  const Cb = -0.16874 * r - 0.33126 * g + 0.5     * b + 128;
  const Cr =  0.5     * r - 0.41869 * g - 0.08131 * b + 128;
  return [Y, Cb, Cr];
}

// ─── Write JPEG markers ───────────────────────────────────────────────────────

// SOI
writeByte(0xFF); writeByte(0xD8);

// APP0 JFIF
writeByte(0xFF); writeByte(0xE0);
writeWord(16);
for (const c of [0x4A,0x46,0x49,0x46,0x00]) writeByte(c); // "JFIF\0"
writeByte(0x01); writeByte(0x01); // version
writeByte(0x00); // aspect ratio units: none
writeWord(1); writeWord(1); // Xdensity, Ydensity
writeByte(0); writeByte(0); // thumbnail

// DQT (two tables: Y and Cb/Cr)
for (let t = 0; t < 2; t++) {
  writeByte(0xFF); writeByte(0xDB);
  writeWord(67);
  writeByte(t); // table id
  const q = t === 0 ? QLUM : QCHR;
  for (let i = 0; i < 64; i++) writeByte(q[ZIGZAG[i]]);
}

// SOF0 (baseline DCT)
writeByte(0xFF); writeByte(0xC0);
writeWord(17); // length
writeByte(8);  // precision
writeWord(H); writeWord(W);
writeByte(3);  // 3 components
// Y: id=1, sampling=1x1, qtable=0
writeByte(1); writeByte(0x11); writeByte(0);
// Cb: id=2, sampling=1x1, qtable=1
writeByte(2); writeByte(0x11); writeByte(1);
// Cr: id=3, sampling=1x1, qtable=1
writeByte(3); writeByte(0x11); writeByte(1);

// DHT (4 tables: Y DC, Y AC, CbCr DC, CbCr AC)
function writeDHT(nrcodes, values, tcth) {
  writeByte(0xFF); writeByte(0xC4);
  const len = 2 + 1 + 16 + values.length;
  writeWord(len);
  writeByte(tcth);
  for (let i = 1; i <= 16; i++) writeByte(nrcodes[i]);
  for (const v of values) writeByte(v);
}
writeDHT(STD_DC_LUMA_NRCODES,   STD_DC_LUMA_VALUES,   0x00);
writeDHT(STD_AC_LUMA_NRCODES,   STD_AC_LUMA_VALUES,   0x10);
writeDHT(STD_DC_CHROMA_NRCODES, STD_DC_CHROMA_VALUES, 0x01);
writeDHT(STD_AC_CHROMA_NRCODES, STD_AC_CHROMA_VALUES, 0x11);

// SOS header
writeByte(0xFF); writeByte(0xDA);
writeWord(12);
writeByte(3); // 3 components
writeByte(1); writeByte(0x00); // Y: DC table 0, AC table 0
writeByte(2); writeByte(0x11); // Cb: DC table 1, AC table 1
writeByte(3); writeByte(0x11); // Cr: DC table 1, AC table 1
writeByte(0); writeByte(63); writeByte(0);

// Encode MCUs (8x8 blocks, no subsampling — 4:4:4)
let prevDCY = 0, prevDCCb = 0, prevDCCr = 0;

for (let my = 0; my < H; my += 8) {
  for (let mx = 0; mx < W; mx += 8) {
    const bY = new Float32Array(64);
    const bCb= new Float32Array(64);
    const bCr= new Float32Array(64);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const px = Math.min(mx + col, W - 1);
        const py = Math.min(my + row, H - 1);
        const idx = (py * W + px) * 3;
        const [Y, Cb, Cr] = toYCbCr(pixels[idx], pixels[idx+1], pixels[idx+2]);
        bY [row*8+col] = Y  - 128;
        bCb[row*8+col] = Cb - 128;
        bCr[row*8+col] = Cr - 128;
      }
    }

    const dctY  = quantize(fdct(bY),  QLUM);
    const dctCb = quantize(fdct(bCb), QCHR);
    const dctCr = quantize(fdct(bCr), QCHR);

    prevDCY  = encodeCoeff(dctY[0],  YDC,  YAC,  prevDCY);
    encodeAC(dctY,  YAC);
    prevDCCb = encodeCoeff(dctCb[0], CrDC, CrAC, prevDCCb);
    encodeAC(dctCb, CrAC);
    prevDCCr = encodeCoeff(dctCr[0], CrDC, CrAC, prevDCCr);
    encodeAC(dctCr, CrAC);
  }
}

flushBits();

// EOI
writeByte(0xFF); writeByte(0xD9);

// ─── Write file ───────────────────────────────────────────────────────────────
const output = Buffer.from(buf);
writeFileSync(OUT, output);
console.log(`\n✅  opengraph.jpg written`);
console.log(`   Path : ${OUT}`);
console.log(`   Size : ${output.length.toLocaleString()} bytes`);
console.log(`   Dims : ${W}×${H} px`);
