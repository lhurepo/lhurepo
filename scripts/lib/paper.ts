/**
 * Washi papercraft primitives: the fibrous ground, paper sheets (panels),
 * paper-slip tags and buttons, and the vermilion 光 hanko seal.
 * Everything is vector — no raster textures — so files stay small and crisp.
 */
import type { Palette } from "./theme";
import { esc, n, rng } from "./svg";
import { FAMILY, GlyphBook, Line, measure, Run, Weight, wrapRuns } from "./fonts";

/** Per-document builder: collects <defs>, glyphs and unique ids. */
export class Doc {
  defs: string[] = [];
  glyphs = new GlyphBook();
  private id = 0;
  constructor(public P: Palette, public prefix: string) {}
  uid(name: string): string {
    return `${this.prefix}-${name}-${++this.id}`;
  }
  def(s: string): void {
    this.defs.push(s);
  }

  async style(extra = ""): Promise<string> {
    return (await this.glyphs.css()) + `text{font-family:${FAMILY};font-kerning:normal}` + extra;
  }
}

/* ------------------------------------------------------------------ */
/* Washi fibers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Kozo / unryu fibers as curvature-persistent random walks with a mild
 * horizontal flow bias (the sheet is shaken side to side while it forms).
 * Fibers are bucketed by stroke so hundreds of them cost a handful of paths.
 */
export function fibers(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  density = 1
): string {
  const P = doc.P;
  const r = rng(seed);
  const count = Math.round(((w * h) / 2200) * density);
  const buckets = new Map<string, string[]>();
  const push = (key: string, d: string) => {
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  };
  for (let i = 0; i < count; i++) {
    const len = Math.exp(Math.log(26) + 0.7 * (r() * 2 - 1) + 0.35 * (r() * 2 - 1)) * (r() < 0.06 ? 3 : 1);
    const steps = Math.max(3, Math.round(len / 7));
    let ang = (r() - 0.5) * 1.4 + (r() < 0.5 ? 0 : Math.PI);
    let curv = (r() - 0.5) * 0.25;
    let px = x + r() * w;
    let py = y + r() * h;
    let d = `M${n(px)} ${n(py)}l`;
    const seg = len / steps;
    for (let s = 0; s < steps; s++) {
      curv = curv * 0.85 + (r() - 0.5) * 0.18;
      ang += curv;
      const dx = Math.cos(ang) * seg;
      const dy = Math.sin(ang) * seg;
      px += dx;
      py += dy;
      d += `${n(dx)} ${n(dy)} `;
    }
    const accent = r() < 0.07;
    const layer = r(); // buried / mid / surface
    const op = (layer < 0.45 ? 0.05 : layer < 0.85 ? 0.09 : 0.15) * P.fiberScale * (accent ? 1.3 : 1);
    const sw = layer < 0.45 ? 1.4 : layer < 0.85 ? 0.8 : 0.5;
    push(`${accent ? P.fiberAccent : P.fiber}|${n(op, 3)}|${sw}`, d.trim());
  }
  // chiri specks: tiny bark inclusions
  const specks: string[] = [];
  const sc = Math.round(count * 0.18);
  for (let i = 0; i < sc; i++) {
    const sx = x + r() * w;
    const sy = y + r() * h;
    const sr = 0.35 + r() * 0.8;
    specks.push(`M${n(sx - sr)} ${n(sy)}a${n(sr)} ${n(sr * 0.7)} 0 1 0 ${n(sr * 2)} 0a${n(sr)} ${n(sr * 0.7)} 0 1 0 ${n(-sr * 2)} 0`);
  }
  let out = `<g fill="none" stroke-linecap="round">`;
  for (const [key, ds] of buckets) {
    const [color, op, sw] = key.split("|");
    out += `<path d="${ds.join("")}" stroke="${color}" stroke-opacity="${op}" stroke-width="${sw}"/>`;
  }
  out += `</g><path d="${specks.join("")}" fill="${P.speck}" fill-opacity="${P.mode === "dark" ? 0.35 : 0.22}"/>`;
  return out;
}

/** Fine paper tooth — a single shared turbulence filter. */
export function toothFilter(doc: Doc): string {
  const id = doc.uid("tooth");
  const P = doc.P;
  const alpha = P.mode === "dark" ? 0.06 : 0.07;
  const rgb = P.mode === "dark" ? "1 0 0 0 1  0 1 0 0 .95  0 0 1 0 .88" : "0 0 0 0 .3  0 0 0 0 .24  0 0 0 0 .16";
  doc.def(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="${rgb}  0 0 0 ${alpha * 9} -${alpha * 4}"/></filter>`
  );
  return id;
}

/** The full-bleed ground: colour, warm radial light, fibers, tooth, deckle border. */
export function ground(doc: Doc, w: number, h: number, seed: number, radius = 6): string {
  const P = doc.P;
  const clip = doc.uid("clip");
  const g1 = doc.uid("warm");
  const g2 = doc.uid("gold");
  const tooth = toothFilter(doc);
  doc.def(`<clipPath id="${clip}"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>`);
  doc.def(
    `<radialGradient id="${g1}" cx=".2" cy=".15" r=".8"><stop offset="0" stop-color="${P.warm}" stop-opacity="${P.warmOpacity * 2.2}"/><stop offset="1" stop-color="${P.warm}" stop-opacity="0"/></radialGradient>`
  );
  doc.def(
    `<radialGradient id="${g2}" cx=".85" cy=".7" r=".7"><stop offset="0" stop-color="${P.accent}" stop-opacity="${P.mode === "dark" ? 0.05 : 0.06}"/><stop offset="1" stop-color="${P.accent}" stop-opacity="0"/></radialGradient>`
  );
  return [
    `<g clip-path="url(#${clip})">`,
    `<rect width="${w}" height="${h}" fill="${P.bg}"/>`,
    `<rect width="${w}" height="${h}" fill="url(#${g1})"/>`,
    `<rect width="${w}" height="${h}" fill="url(#${g2})"/>`,
    `<rect width="${w}" height="${h}" filter="url(#${tooth})"/>`,
    fibers(doc, -20, -20, w + 40, h + 40, seed, 1.1),
    `</g>`,
  ].join("");
}

export function groundBorder(doc: Doc, w: number, h: number, radius = 6): string {
  const P = doc.P;
  return `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${radius}" stroke="${P.paperEdge}" stroke-opacity="${P.paperEdgeOpacity}"/>`;
}

/* ------------------------------------------------------------------ */
/* Paper sheets                                                        */
/* ------------------------------------------------------------------ */

let shadowIds = new WeakMap<Doc, string>();
function shadow(doc: Doc): string {
  let id = shadowIds.get(doc);
  if (id) return id;
  id = doc.uid("shadow");
  doc.def(
    `<filter id="${id}" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="9" flood-color="${doc.P.shadow}" flood-opacity="${doc.P.shadowOpacity}"/></filter>`
  );
  shadowIds.set(doc, id);
  return id;
}

/** A thin, semi-translucent washi sheet: origami behind it shows through. */
export function sheet(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  opts: { radius?: number; opacity?: number; fill?: string; edge?: boolean } = {}
): string {
  const P = doc.P;
  const rr = opts.radius ?? 4;
  const clip = doc.uid("sheet");
  doc.def(`<clipPath id="${clip}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rr}"/></clipPath>`);
  return [
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rr}" fill="${opts.fill ?? P.surface}" fill-opacity="${opts.opacity ?? P.surfaceOpacity}" filter="url(#${shadow(doc)})"/>`,
    `<g clip-path="url(#${clip})">${fibers(doc, x - 10, y - 10, w + 20, h + 20, seed, 0.9)}</g>`,
    opts.edge === false
      ? ""
      : `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(w - 1)}" height="${n(h - 1)}" rx="${rr}" stroke="${P.paperEdge}" stroke-opacity="${P.paperEdgeOpacity}"/>`,
  ].join("");
}

/* ------------------------------------------------------------------ */
/* Type                                                                */
/* ------------------------------------------------------------------ */

export interface TextOpts {
  size: number;
  weight?: Weight;
  color?: string;
  tracking?: number; // em
  anchor?: "start" | "middle" | "end";
  opacity?: number;
}

/** Single-line text; registers glyphs for the subset. */
export function text(doc: Doc, s: string, x: number, y: number, o: TextOpts): string {
  const w = o.weight ?? 400;
  doc.glyphs.add(s, w);
  const ls = o.tracking ? ` letter-spacing="${n(o.tracking * o.size, 2)}"` : "";
  const anchor = o.anchor && o.anchor !== "start" ? ` text-anchor="${o.anchor}"` : "";
  const op = o.opacity !== undefined ? ` fill-opacity="${o.opacity}"` : "";
  return `<text x="${n(x)}" y="${n(y)}" font-size="${o.size}" font-weight="${w}" fill="${o.color ?? doc.P.ink}"${ls}${anchor}${op}>${esc(s)}</text>`;
}

/** Wrapped, mixed-weight paragraph. Returns markup and consumed height. */
export function paragraph(
  doc: Doc,
  runs: Run[],
  x: number,
  y: number,
  maxWidth: number,
  o: TextOpts & { leading?: number; align?: "start" | "center" }
): { svg: string; height: number; lines: Line[] } {
  const lines = wrapRuns(runs, maxWidth, o.size, o.tracking ?? 0);
  const lh = o.size * (o.leading ?? 1.55);
  const ls = o.tracking ? ` letter-spacing="${n(o.tracking * o.size, 2)}"` : "";
  let svg = `<text font-size="${o.size}" font-weight="${o.weight ?? 400}" fill="${o.color ?? doc.P.ink}"${ls}>`;
  lines.forEach((line, i) => {
    const lx = o.align === "center" ? x + (maxWidth - line.width) / 2 : x;
    svg += `<tspan x="${n(lx)}" y="${n(y + i * lh)}">`;
    for (const r of line.runs) {
      const w = r.weight ?? o.weight ?? 400;
      doc.glyphs.add(r.text, w);
      const attrs = (w !== (o.weight ?? 400) ? ` font-weight="${w}"` : "") + (r.color ? ` fill="${r.color}"` : "");
      svg += attrs ? `<tspan${attrs}>${esc(r.text)}</tspan>` : esc(r.text);
    }
    svg += `</tspan>`;
  });
  svg += `</text>`;
  return { svg, height: lines.length * lh, lines };
}

/* ------------------------------------------------------------------ */
/* Paper slips                                                         */
/* ------------------------------------------------------------------ */

/** A washi-tape tag. Returns markup and its width. */
export function tag(doc: Doc, label: string, x: number, y: number, size = 12.5): { svg: string; w: number; h: number } {
  const P = doc.P;
  const padX = 9;
  const h = Math.round(size * 2.05);
  const w = measure(label, size, 500, -0.01) + padX * 2;
  return {
    w,
    h,
    svg: [
      `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${h}" rx="2" fill="${P.tagFill}" fill-opacity="${P.tagFillOpacity}" stroke="${P.paperEdge}" stroke-opacity="${P.paperEdgeOpacity}"/>`,
      text(doc, label, x + padX, y + h / 2 + size * 0.36, { size, weight: 500, tracking: -0.01 }),
    ].join(""),
  };
}

/** Lay tags out left-to-right, wrapping at maxWidth. */
export function tagRow(
  doc: Doc,
  labels: string[],
  x: number,
  y: number,
  maxWidth: number,
  size = 12.5,
  gap = 7
): { svg: string; height: number } {
  let cx = x;
  let cy = y;
  let svg = "";
  let h = 0;
  for (const l of labels) {
    const probe = measure(l, size, 500, -0.01) + 18;
    if (cx + probe > x + maxWidth && cx > x) {
      cx = x;
      cy += h + gap;
    }
    const t = tag(doc, l, cx, cy, size);
    svg += t.svg;
    h = t.h;
    cx += t.w + gap;
  }
  return { svg, height: cy - y + h };
}

/** The ↗ glyph from the website's buttons, as a path. */
export function arrow(x: number, y: number, s: number, color: string): string {
  const k = s / 14;
  return `<path transform="translate(${n(x)} ${n(y)}) scale(${n(k, 3)})" d="M3.5 10.5 10.5 3.5M10.5 3.5H5M10.5 3.5V9" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* ------------------------------------------------------------------ */
/* 光 hanko                                                            */
/* ------------------------------------------------------------------ */

/**
 * The 光 seal (public/hikaru_hanko.jpg), redrawn as vector strokes on its
 * original 600px grid, with a displacement filter for the pressed-ink bite.
 */
export function hanko(doc: Doc, cx: number, cy: number, size: number, rotate = -6, color?: string): string {
  const id = doc.uid("ink");
  doc.def(
    `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${n(Math.max(1.2, size / 60), 2)}"/></filter>`
  );
  const k = size / 400;
  const c = color ?? doc.P.hanko;
  return [
    `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${rotate}) scale(${n(k, 4)}) translate(-300 -300)" filter="url(#${id})" stroke="${c}" stroke-width="13" stroke-linecap="square" fill="none">`,
    `<circle cx="300" cy="300" r="196"/>`,
    `<path d="M300 106V265M106 265H494M180 146 300 265M420 146 300 265M300 265 150 417M312 265V420H452V302"/>`,
    `</g>`,
  ].join("");
}
