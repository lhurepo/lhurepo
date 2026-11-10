/**
 * Fonts: Switzer (interface) and Kubos Origami (the hero name), both copied
 * from lhu-website-v4/app/fonts.
 *
 * - Switzer is subset to exactly the glyphs each SVG uses and embedded as a
 *   base64 WOFF2 @font-face, so GitHub's <img> sandbox renders it faithfully.
 * - Kubos Origami is converted to outlines (paths) — the name is a mark.
 * - Text is measured with real advance widths so wrapping matches the render.
 */
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import subsetFont from "subset-font";

const ROOT = path.resolve(__dirname, "../..");
const FONT_DIR = path.join(ROOT, "fonts");
export const CACHE_DIR = path.join(ROOT, ".cache");

export type Weight = 400 | 500 | 600;
const SWITZER: Record<Weight, string> = {
  400: "Switzer-Regular.woff2",
  500: "Switzer-Medium.woff2",
  600: "Switzer-Semibold.woff2",
};

export const FAMILY = `Switzer, 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif`;

const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") + "’‘“”–—·•…⇄→×";

const parsed: Partial<Record<Weight, opentype.Font>> = {};
let kubos: opentype.Font | null = null;

function toArrayBuffer(b: Buffer): ArrayBuffer {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

/** Decompress Switzer to TTF once (for measurement + the local PNG preview). */
export async function loadFonts(): Promise<void> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const w of [400, 500, 600] as Weight[]) {
    const ttfPath = path.join(CACHE_DIR, `Switzer-${w}.ttf`);
    if (!fs.existsSync(ttfPath)) {
      const src = fs.readFileSync(path.join(FONT_DIR, SWITZER[w]));
      const ttf = await subsetFont(src, ASCII, { targetFormat: "sfnt" });
      fs.writeFileSync(ttfPath, ttf);
    }
    parsed[w] = opentype.parse(toArrayBuffer(fs.readFileSync(ttfPath)));
  }
  kubos = opentype.parse(toArrayBuffer(fs.readFileSync(path.join(FONT_DIR, "KubosOrigami-YdXq.ttf"))));
}

export function previewFontFiles(): string[] {
  const files = ([400, 500, 600] as Weight[]).map((w) => path.join(CACHE_DIR, `Switzer-${w}.ttf`));
  for (const w of [400, 500, 600] as Weight[]) {
    const noto = path.join(FONT_DIR, `NotoSansJP-${w}.ttf`);
    if (fs.existsSync(noto)) files.push(noto);
  }
  return files;
}

const isWide = (ch: string) => /[\u3000-\u9fff\uff00-\uffef]/.test(ch);

/** Advance width in px, honouring letter-spacing (em). CJK falls back to 1em. */
export function measure(text: string, size: number, weight: Weight = 400, tracking = 0): number {
  const f = parsed[weight]!;
  let w = 0;
  for (const ch of text) {
    if (isWide(ch)) {
      w += size;
      continue;
    }
    const g = f.charToGlyph(ch);
    w += ((g.advanceWidth ?? f.unitsPerEm * 0.5) / f.unitsPerEm) * size;
  }
  return w + tracking * size * [...text].length;
}

export interface Run {
  text: string;
  weight?: Weight;
  color?: string;
}

export interface Line {
  runs: Run[];
  width: number;
}

/** Greedy word-wrap over styled runs. */
export function wrapRuns(runs: Run[], maxWidth: number, size: number, tracking = 0): Line[] {
  type Tok = { text: string; weight: Weight; color?: string; space: boolean };
  const toks: Tok[] = [];
  for (const r of runs) {
    for (const part of r.text.split(/(\s+)/)) {
      if (!part) continue;
      toks.push({ text: part, weight: r.weight ?? 400, color: r.color, space: /^\s+$/.test(part) });
    }
  }
  const lines: Line[] = [];
  let cur: Tok[] = [];
  let curW = 0;
  const flush = () => {
    while (cur.length && cur[cur.length - 1].space) cur.pop();
    // merge adjacent tokens with identical style
    const merged: Run[] = [];
    for (const t of cur) {
      const last = merged[merged.length - 1];
      if (last && last.weight === t.weight && last.color === t.color) last.text += t.text;
      else merged.push({ text: t.text, weight: t.weight, color: t.color });
    }
    const width = merged.reduce((s, r) => s + measure(r.text, size, r.weight, tracking), 0);
    if (merged.length) lines.push({ runs: merged, width });
    cur = [];
    curW = 0;
  };
  for (const t of toks) {
    const w = measure(t.space ? " " : t.text, size, t.weight, tracking);
    if (t.space) {
      if (cur.length) {
        cur.push({ ...t, text: " " });
        curW += w;
      }
      continue;
    }
    if (curW + w > maxWidth && cur.length) flush();
    cur.push(t);
    curW += w;
  }
  flush();
  return lines;
}

/** Kubos Origami outlines for the name; returns path data and advance width. */
export function kubosPath(text: string, x: number, baseline: number, size: number): { d: string; width: number } {
  const p = kubos!.getPath(text, x, baseline, size);
  return { d: p.toPathData(1), width: kubos!.getAdvanceWidth(text, size) };
}

/** Collects the glyphs an SVG uses, then emits a subset @font-face block. */
export class GlyphBook {
  private used: Record<Weight, Set<string>> = { 400: new Set(), 500: new Set(), 600: new Set() };
  add(text: string, weight: Weight = 400): void {
    for (const ch of text) this.used[weight].add(ch);
  }
  async css(): Promise<string> {
    const faces: string[] = [];
    for (const w of [400, 500, 600] as Weight[]) {
      const chars = [...this.used[w]].filter((c) => !isWide(c)).join("");
      if (chars.trim()) {
        const src = fs.readFileSync(path.join(FONT_DIR, SWITZER[w]));
        const woff2 = await subsetFont(src, chars, { targetFormat: "woff2" });
        faces.push(
          `@font-face{font-family:Switzer;font-weight:${w};font-style:normal;src:url(data:font/woff2;base64,${woff2.toString("base64")}) format('woff2')}`
        );
      }
      const wideChars = [...this.used[w]].filter((c) => isWide(c)).join("");
      if (wideChars.trim()) {
        const notoPath = path.join(FONT_DIR, `NotoSansJP-${w}.ttf`);
        if (fs.existsSync(notoPath)) {
          const notoSrc = fs.readFileSync(notoPath);
          const notoWoff2 = await subsetFont(notoSrc, wideChars, { targetFormat: "woff2" });
          faces.push(
            `@font-face{font-family:'Noto Sans JP';font-weight:${w};font-style:normal;src:url(data:font/woff2;base64,${notoWoff2.toString("base64")}) format('woff2')}`
          );
        }
      }
    }
    return faces.join("");
  }
}
