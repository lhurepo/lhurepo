/**
 * Folds every README card, in night (dark) and day (light), into assets/.
 *
 *   npm run build            # all cards
 *   npm run preview          # + PNG previews of the first frame in .cache/preview
 */
import fs from "node:fs";
import path from "node:path";
import { loadFonts, kubosPath, measure } from "./lib/fonts";
import { origami, OrigamiOpts } from "./lib/origami";
import {
  arrow,
  Doc,
  fibers,
  ground,
  groundBorder,
  hanko,
  paragraph,
  sheet,
  tagRow,
  text,
} from "./lib/paper";
import { n, svgDoc, EXPO_OUT } from "./lib/svg";
import { Palette, PALETTES } from "./lib/theme";
import { ABOUT, EXPERIENCE, HERO, PROJECT, TOOLKIT } from "./content";
import type { Stats } from "./stats";

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const W = 900;

type Fold = Omit<OrigamiOpts, "palette">;
const fold = (P: Palette, list: Fold[]) => list.map((o) => origami({ ...o, palette: P })).join("");

/** Section heading in the site's voice: lowercase, tight, no eyebrow. */
function heading(doc: Doc, title: string, x: number, y: number, sub?: string): string {
  return (
    text(doc, title, x, y, { size: 32, weight: 600, color: doc.P.heading, tracking: -0.035 }) +
    (sub ? text(doc, sub, x, y + 26, { size: 14.5, color: doc.P.muted }) : "")
  );
}

/** A dashed valley-fold crease, like `.crease` on the website. */
function crease(doc: Doc, x1: number, y: number, x2: number): string {
  return `<line x1="${n(x1)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y)}" stroke="${doc.P.paperEdge}" stroke-opacity="${n(doc.P.paperEdgeOpacity * 1.6, 2)}" stroke-dasharray="2.5 3.5"/>`;
}

/** One-shot rise from the baseline (the site's masked headline, 800ms expo-out). */
function rise(inner: string, clipId: string, box: [number, number, number, number], delay = 0.15, distance = 1.1): string {
  const [x, y, w, h] = box;
  return [
    `<clipPath id="${clipId}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"/></clipPath>`,
    `<g clip-path="url(#${clipId})"><g>`,
    `<animateTransform attributeName="transform" type="translate" values="0 ${n(h * distance)};0 0" keyTimes="0;1" calcMode="spline" keySplines="${EXPO_OUT}" dur=".9s" begin="${delay}s" fill="freeze"/>`,
    inner,
    `</g></g>`,
  ].join("");
}

function fadeIn(inner: string, delay: number, dur = 0.8): string {
  return `<g opacity="1"><animate attributeName="opacity" values="0;0;1" keyTimes="0;${n(delay / (delay + dur), 3)};1" dur="${n(delay + dur, 2)}s" fill="freeze"/>${inner}</g>`;
}

/* ================================================================== */
/* hero                                                                */
/* ================================================================== */
async function hero(P: Palette): Promise<string> {
  const doc = new Doc(P, `hero-${P.mode}`);
  const H = 380;
  const cw = 480;
  const ch = 214;
  const cx = (W - cw) / 2;
  const cy = (H - ch) / 2 - 4;

  const back = fold(P, [
    { model: "crane", x: 150, y: 168, size: 250, depth: 1, dur: 46, tiltX: 0.42, phase: 0.6, frames: 24 },
    { model: "luckyStar", x: 790, y: 92, size: 128, depth: 0.85, dur: 34, dir: -1, tiltX: 0.9, phase: 1.1 },
    { model: "sonobe", x: 810, y: 292, size: 118, depth: 0.8, dur: 40, tiltX: 0.6, phase: 0.3, bobDelay: 1.2 },
    { model: "shuriken", x: 62, y: 330, size: 74, depth: 0.6, dur: 22, tiltX: 0.8, frames: 16, bobDelay: 2.1 },
    { model: "kusudama", x: 318, y: 46, size: 60, depth: 0.55, dur: 30, frames: 16, bobDelay: 0.7 },
    { model: "lotus", x: 618, y: 340, size: 92, depth: 0.65, dur: 38, tiltX: 0.55, frames: 16, bobDelay: 3 },
    { model: "pinwheel", x: 575, y: 46, size: 58, depth: 0.5, dur: 18, axis: "z", tiltX: 0.25, frames: 16, bobDelay: 1.6 },
  ]);

  // The name, in Kubos Origami, rising from its baseline.
  const nameSize = 92;
  const probe = kubosPath(HERO.name, 0, 0, nameSize);
  const nameBase = cy + 104;
  const name = kubosPath(HERO.name, W / 2 - probe.width / 2, nameBase, nameSize);
  const nameSvg = rise(
    `<path d="${name.d}" fill="${P.name}"/>`,
    doc.uid("rise"),
    [cx, cy + 14, cw, nameBase - cy + 6]
  );

  const lead = paragraph(doc, [{ text: HERO.lead }], cx + 56, nameBase + 40, cw - 112, {
    size: 16,
    leading: 1.5,
    align: "center",
    tracking: -0.005,
  });

  const body = [
    ground(doc, W, H, 11),
    back,
    sheet(doc, cx, cy, cw, ch, 21, { opacity: P.mode === "dark" ? 0.8 : 0.84 }),
    nameSvg,
    fadeIn(lead.svg, 0.7),
    fadeIn(hanko(doc, cx + cw - 36, cy + 36, 40, -8), 1.1, 0.5),
    text(doc, "hikaruun.com", W - 22, H - 18, { size: 12.5, color: P.muted, anchor: "end", weight: 500 }),
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: `hikaru — ${HERO.lead}`,
    style: await doc.style(),
  });
}

/* ================================================================== */
/* about                                                               */
/* ================================================================== */
async function about(P: Palette): Promise<string> {
  const doc = new Doc(P, `about-${P.mode}`);
  const pad = 26;
  const sx = pad;
  const sy = 82;
  const sw = W - pad * 2;
  const ip = 30; // inner padding

  // facts rail
  const railX = sx + ip;
  const railW = 178;
  let fy = sy + ip + 14;
  let facts = "";
  for (const [k, v] of ABOUT.facts) {
    facts += text(doc, k, railX, fy, { size: 12.5, color: P.muted });
    const dd = paragraph(doc, [{ text: v }], railX, fy + 21, railW, { size: 14.5, weight: 500, leading: 1.4 });
    facts += dd.svg;
    fy += 21 + dd.height + 14;
  }
  const railBottom = fy;

  // text column
  const tx = railX + railW + 34;
  const tw = sx + sw - ip - tx;
  const dropSize = 58;
  const leadRes = paragraph(doc, ABOUT.lead(P.heading), tx + dropSize + 16, sy + ip + 22, tw - dropSize - 16, {
    size: 20,
    weight: 500,
    leading: 1.3,
    tracking: -0.02,
  });
  const drop = hanko(doc, tx + dropSize / 2, sy + ip + dropSize / 2 - 2, dropSize, 0);

  const colGap = 26;
  const colW = (tw - colGap) / 2;
  const bodyTop = sy + ip + Math.max(dropSize, leadRes.height) + 26;
  let colSvg = "";
  let colBottom = bodyTop;
  for (let c = 0; c < 2; c++) {
    let by = bodyTop;
    for (const p of ABOUT.body.slice(c * 2, c * 2 + 2)) {
      const res = paragraph(doc, [{ text: p }], tx + c * (colW + colGap), by, colW, { size: 14, leading: 1.55 });
      colSvg += res.svg;
      by += res.height + 10;
    }
    colBottom = Math.max(colBottom, by);
  }

  const sh = Math.max(railBottom, colBottom) - sy + ip - 18;
  const H = sy + sh + pad;

  const back = fold(P, [
    { model: "crane", x: 760, y: 52, size: 150, depth: 0.85, dur: 40, tiltX: 0.5, dir: -1, phase: 2.2, frames: 20 },
    { model: "butterfly", x: 520, y: 40, size: 70, depth: 0.55, dur: 26, tiltX: 0.9, frames: 16, bobDelay: 1 },
    { model: "kabuto", x: 110, y: H - 36, size: 120, depth: 0.7, dur: 36, tiltX: 0.4, frames: 16, bobDelay: 2 },
  ]);

  const body = [
    ground(doc, W, H, 31),
    back,
    heading(doc, ABOUT.title, pad + 4, 52),
    sheet(doc, sx, sy, sw, sh, 41),
    facts,
    `<line x1="${n(tx - 17)}" y1="${n(sy + ip)}" x2="${n(tx - 17)}" y2="${n(sy + sh - ip)}" stroke="${P.paperEdge}" stroke-opacity="${P.paperEdgeOpacity}" stroke-dasharray="2.5 3.5"/>`,
    drop,
    leadRes.svg,
    colSvg,
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: `${ABOUT.title} My name is Hikaru. I'm a BUCS (Business + Computer Science) student at UBC.`,
    style: await doc.style(),
  });
}

/* ================================================================== */
/* experience — the ledger                                             */
/* ================================================================== */
async function experience(P: Palette): Promise<string> {
  const doc = new Doc(P, `exp-${P.mode}`);
  const pad = 26;
  const sx = pad;
  const sy = 76;
  const sw = W - pad * 2;
  const ip = 30;
  const whenX = sx + ip;
  const whoX = whenX + 140;
  const whoW = 214;
  const whatX = whoX + whoW + 26;
  const whatW = sx + sw - ip - whatX;

  let y = sy + ip + 16;
  let rows = "";
  EXPERIENCE.roles.forEach((r, i) => {
    if (i > 0) {
      rows += crease(doc, whenX, y - 20, sx + sw - ip);
      y += 6;
    }
    rows += text(doc, r.when, whenX, y + 2, { size: 12.5, color: P.muted });
    const role = paragraph(doc, [{ text: r.role }], whoX, y + 2, whoW, {
      size: 17,
      weight: 600,
      leading: 1.2,
      tracking: -0.02,
      color: P.heading,
    });
    rows += role.svg;
    const org = paragraph(
      doc,
      [{ text: r.org, weight: 600 }, { text: ` · ${r.place}`, color: P.muted }],
      whoX,
      y + role.height + 6,
      whoW,
      { size: 13.5, leading: 1.4 }
    );
    rows += org.svg;
    const desc = paragraph(doc, [{ text: r.desc }], whatX, y + 2, whatW, { size: 13.5, leading: 1.5 });
    rows += desc.svg;
    const tags = tagRow(doc, r.tags, whatX, y + desc.height - 4, whatW, 11.5, 6);
    rows += tags.svg;
    const rowH = Math.max(role.height + org.height + 6, desc.height - 4 + tags.height);
    y += rowH + 30;
  });
  const sh = y - sy + ip - 44;
  const H = sy + sh + pad;

  const back = fold(P, [
    { model: "plane", x: 700, y: 40, size: 110, depth: 0.85, dur: 30, tiltX: 0.5, phase: 0.8, frames: 20 },
    { model: "swallow", x: 470, y: 36, size: 64, depth: 0.55, dur: 28, tiltX: 0.7, dir: -1, frames: 16, bobDelay: 1.4 },
    { model: "boat", x: 830, y: H - 34, size: 110, depth: 0.75, dur: 34, tiltX: 0.25, frames: 16, bobDelay: 0.6 },
  ]);

  const body = [
    ground(doc, W, H, 51),
    back,
    heading(doc, EXPERIENCE.title, pad + 4, 52),
    sheet(doc, sx, sy, sw, sh, 61),
    rows,
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: `${EXPERIENCE.title}: ` + EXPERIENCE.roles.map((r) => `${r.role}, ${r.org} (${r.when})`).join("; "),
    style: await doc.style(),
  });
}

/* ================================================================== */
/* project card                                                        */
/* ================================================================== */
async function project(P: Palette): Promise<string> {
  const doc = new Doc(P, `proj-${P.mode}`);
  const pad = 26;
  const sx = pad;
  const sy = 76;
  const sw = W - pad * 2;
  const ip = 32;
  const x = sx + ip;
  const cw = sw - ip * 2 - 170; // leave the lantern room to glow through

  let y = sy + ip;
  const meta = tagRow(doc, [PROJECT.event], x, y, 300, 12.5);
  const metaW = measure(PROJECT.event, 12.5, 500, -0.01) + 18;
  let svg = meta.svg;
  svg += text(doc, `·  ${PROJECT.kind}`, x + metaW + 10, y + 17.5, { size: 13.5, color: P.muted });
  y += meta.height + 46;
  svg += text(doc, PROJECT.name, x - 2, y, { size: 44, weight: 600, color: P.heading, tracking: -0.04 });
  y += 30;
  const desc = paragraph(doc, [{ text: PROJECT.desc }], x, y, cw, { size: 14.5, leading: 1.55 });
  svg += desc.svg;
  y += desc.height + 4;

  // callout slip
  const [label, val, note] = PROJECT.callout;
  const lw = measure(label + " ", 13.5, 600);
  const vw = measure(val + " ", 13.5, 600);
  const nw = measure(note, 13.5, 400);
  const cwid = lw + vw + nw + 28;
  svg += `<rect x="${n(x)}" y="${n(y)}" width="${n(cwid)}" height="36" rx="3" fill="${P.accent}" fill-opacity="${P.mode === "dark" ? 0.1 : 0.12}" stroke="${P.accent}" stroke-opacity=".35"/>`;
  svg += `<rect x="${n(x)}" y="${n(y)}" width="3" height="36" fill="${P.accent}"/>`;
  svg += text(doc, label, x + 14, y + 23, { size: 13.5, weight: 600, color: P.muted });
  svg += text(doc, val, x + 14 + lw, y + 23, { size: 13.5, weight: 600, color: P.heading });
  svg += text(doc, note, x + 14 + lw + vw, y + 23, { size: 13.5, color: P.muted });
  y += 36 + 18;

  const tags = tagRow(doc, PROJECT.tags, x, y, sw - ip * 2, 12, 6);
  svg += tags.svg;
  y += tags.height;

  const sh = y - sy + ip;
  const H = sy + sh + pad;

  const body = [
    ground(doc, W, H, 71),
    heading(doc, PROJECT.title, pad + 4, 52),
    fold(P, [{ model: "goldfish", x: 610, y: 38, size: 70, depth: 0.55, dur: 30, tiltX: 0.6, dir: -1, frames: 16, bobDelay: 1.1 }]),
    sheet(doc, sx, sy, sw, sh, 81, { opacity: P.mode === "dark" ? 0.78 : 0.82 }),
    // the lantern sits *on* the sheet's right margin, glowing through the paper
    fold(P, [{ model: "lantern", x: sx + sw - 100, y: sy + sh / 2 - 4, size: 180, depth: 1, dur: 44, tiltX: 0.32, frames: 20 }]),
    svg,
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: `${PROJECT.name} — ${PROJECT.kind} (${PROJECT.event}). ${PROJECT.desc}`,
    style: await doc.style(),
  });
}

/* ================================================================== */
/* stats — refolded daily                                              */
/* ================================================================== */
async function stats(P: Palette, s: Stats): Promise<string> {
  const doc = new Doc(P, `stats-${P.mode}`);
  const pad = 26;
  const top = 92;

  // four paper tiles
  const tiles: [string, string][] = [
    [String(s.repos), "public repositories"],
    [String(s.languageCount), "languages folded"],
    [s.contributions != null ? s.contributions.toLocaleString("en-US") : "—", "contributions this year"],
    [String(s.since), "folding on github since"],
  ];
  const gap = 14;
  const tw = (W - pad * 2 - gap * 3) / 4;
  const th = 92;
  let svg = "";
  tiles.forEach(([v, k], i) => {
    const x = pad + i * (tw + gap);
    svg += sheet(doc, x, top, tw, th, 91 + i);
    svg += text(doc, v, x + 20, top + 50, { size: 34, weight: 600, color: P.heading, tracking: -0.04 });
    svg += text(doc, k, x + 20, top + 74, { size: 12.5, color: P.muted });
  });

  // the language strip: an accordion-pleated paper band
  const sy = top + th + gap;
  const sw = W - pad * 2;
  const ip = 24;
  const bandX = pad + ip;
  const bandW = sw - ip * 2;
  const bandY = sy + ip + 28;
  const bandH = 34;
  let strip = text(doc, "languages", bandX, sy + ip + 12, { size: 12.5, color: P.muted });
  let bx = bandX;
  const pleat = 7; // fold depth in px
  s.languages.forEach((l, i) => {
    const w = Math.max(10, l.share * bandW);
    const mountain = i % 2 === 0;
    const op = (mountain ? 0.42 : 0.2) * (P.mode === "dark" ? 1 : 1.25);
    const up = mountain ? 0 : pleat * 0.5;
    // each pleat is a slightly skewed facet so the band reads as folded paper
    strip += `<path d="M${n(bx)} ${n(bandY + up)}L${n(bx + w)} ${n(bandY + (mountain ? pleat * 0.5 : 0))}L${n(bx + w)} ${n(bandY + bandH + (mountain ? pleat * 0.5 : 0))}L${n(bx)} ${n(bandY + bandH + up)}Z" fill="${P.accent}" fill-opacity="${n(op, 2)}" stroke="${P.edge}" stroke-opacity="${n(P.edgeOpacity * 0.8, 2)}" stroke-width=".8" stroke-linejoin="round"/>`;
    bx += w;
  });
  // legend
  let lx = bandX;
  let ly = bandY + bandH + pleat + 30;
  s.languages.forEach((l, i) => {
    const label = l.name;
    const pct = `${(l.share * 100).toFixed(l.share < 0.1 ? 1 : 0)}%`;
    const w = measure(label, 13.5, 500) + measure(pct, 13.5, 400) + 44;
    if (lx + w > bandX + bandW) {
      lx = bandX;
      ly += 24;
    }
    const mountain = i % 2 === 0;
    strip += `<rect x="${n(lx)}" y="${n(ly - 10)}" width="10" height="10" rx="1.5" fill="${P.accent}" fill-opacity="${mountain ? 0.6 : 0.3}" stroke="${P.edge}" stroke-opacity=".6" stroke-width=".8"/>`;
    strip += text(doc, label, lx + 16, ly, { size: 13.5, weight: 500 });
    strip += text(doc, pct, lx + 16 + measure(label, 13.5, 500) + 6, ly, { size: 13.5, color: P.muted });
    lx += w;
  });
  ly += 30;
  strip += crease(doc, bandX, ly - 6, bandX + bandW);
  strip += text(doc, "toolkit", bandX, ly + 20, { size: 12.5, color: P.muted });
  const tk = tagRow(doc, TOOLKIT, bandX, ly + 32, bandW, 12, 6);
  strip += tk.svg;
  const sh = ly + 32 + tk.height + ip - sy;
  const H = sy + sh + pad;

  const updated = new Date(s.updated).toISOString().slice(0, 10);
  const body = [
    ground(doc, W, H, 101),
    fold(P, [
      { model: "masu", x: 760, y: 44, size: 84, depth: 0.7, dur: 30, tiltX: 0.6, frames: 16 },
      { model: "cicada", x: 560, y: 40, size: 58, depth: 0.5, dur: 26, tiltX: 0.8, frames: 16, dir: -1, bobDelay: 1.2 },
    ]),
    heading(doc, "the paper trail", pad + 4, 46, `live from github · refolded ${updated}`),
    svg,
    sheet(doc, pad, sy, sw, sh, 111),
    fold(P, [{ model: "wreath", x: pad + sw - 64, y: sy + 44, size: 70, depth: 0.7, dur: 30, axis: "z", tiltX: 0.4, frames: 16 }]),
    strip,
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: `GitHub: ${s.repos} public repositories, ${s.languageCount} languages; top: ${s.languages
      .slice(0, 3)
      .map((l) => l.name)
      .join(", ")}`,
    style: await doc.style(),
  });
}

/* ================================================================== */
/* footer — a board of tiles; the name returns on an ink tile          */
/* ================================================================== */
async function footer(P: Palette): Promise<string> {
  const doc = new Doc(P, `foot-${P.mode}`);
  const H = 236;
  const pad = 22;
  const gap = 12;
  const inkW = 520;
  const inkH = H - pad * 2;
  const rx = pad + inkW + gap;
  const rw = W - pad - rx;
  const rh = (inkH - gap) / 2;

  const nameSize = 118;
  const probe = kubosPath(HERO.name, 0, 0, nameSize);
  const name = kubosPath(HERO.name, pad + 34, pad + inkH - 40, nameSize);
  const fit = Math.min(1, (inkW - 68) / probe.width);

  const body = [
    ground(doc, W, H, 121),
    // ink tile
    sheet(doc, pad, pad, inkW, inkH, 131, { fill: P.ink, opacity: 1 }),
    `<g transform="translate(${n(pad + 34)} ${n(pad + inkH - 40)}) scale(${n(fit, 3)}) translate(${n(-(pad + 34))} ${n(-(pad + inkH - 40))})"><path d="${name.d}" fill="${P.bg}"/></g>`,
    text(doc, "thanks for stopping by.", pad + 34, pad + 40, { size: 14.5, weight: 500, color: P.bg, opacity: 0.72 }),
    fold(P, [{ model: "swan", x: pad + inkW - 92, y: pad + 66, size: 120, depth: 1, dur: 38, tiltX: 0.35, frames: 20 }]),
    // seal tile
    sheet(doc, rx, pad, rw, rh, 141),
    hanko(doc, rx + 46, pad + rh / 2, 50, -6),
    text(doc, "光 means light.", rx + 86, pad + rh / 2 - 4, { size: 17, weight: 600, color: P.heading, tracking: -0.02 }),
    text(doc, "vancouver ⇄ tokyo", rx + 86, pad + rh / 2 + 18, { size: 13, color: P.muted }),
    // link tile
    sheet(doc, rx, pad + rh + gap, rw, rh, 151),
    text(doc, "hikaruun.com", rx + 24, pad + rh + gap + rh / 2 + 6, { size: 17, weight: 600, color: P.heading, tracking: -0.02 }),
    arrow(rx + 24 + measure("hikaruun.com", 17, 600, -0.02) + 6, pad + rh + gap + rh / 2 - 9, 14, P.accent),
    fold(P, [{ model: "pinwheel", x: rx + rw - 48, y: pad + rh + gap + rh / 2, size: 62, depth: 0.85, dur: 14, axis: "z", tiltX: 0.2, frames: 16 }]),
    groundBorder(doc, W, H),
  ].join("");

  return svgDoc(W, H, `<defs>${doc.defs.join("")}</defs>${body}`, {
    title: "hikaru — 光 means light. hikaruun.com",
    style: await doc.style(),
  });
}

/* ================================================================== */
/* paper-slip buttons                                                  */
/* ================================================================== */
async function button(P: Palette, label: string, primary: boolean): Promise<string> {
  const doc = new Doc(P, `btn-${P.mode}`);
  const size = 15;
  const h = 44;
  const w = Math.ceil(measure(label, size, 500, -0.01) + 20 * 2 + 14 + 9);
  const fill = primary ? P.accent : P.surface;
  const ink = primary ? P.accentInk : P.ink;
  const body = [
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="3" fill="${fill}"${primary ? "" : ` fill-opacity="${P.surfaceOpacity}"`} stroke="${primary ? P.accent : P.paperEdge}" stroke-opacity="${primary ? 0.6 : P.paperEdgeOpacity * 1.4}"/>`,
    primary ? "" : `<g clip-path="url(#c)">${fibers(doc, 0, 0, w, h, label.length * 7, 1.4)}</g>`,
    text(doc, label, 20, h / 2 + size * 0.35, { size, weight: 500, color: ink, tracking: -0.01 }),
    arrow(w - 20 - 14, h / 2 - 7, 14, ink),
  ].join("");
  return svgDoc(w, h, `<defs><clipPath id="c"><rect width="${w}" height="${h}" rx="3"/></clipPath>${doc.defs.join("")}</defs>${body}`, {
    title: label,
    style: await doc.style(),
  });
}

/* ================================================================== */

const BUTTONS: [string, string, boolean][] = [
  ["btn-linkedin", "connect on linkedin", true],
  ["btn-site", "hikaruun.com", false],
  ["btn-devpost", "devpost", true],
  ["btn-github", "github", false],
  ["btn-live", "live site", false],
];

export async function build(): Promise<string[]> {
  await loadFonts();
  fs.mkdirSync(ASSETS, { recursive: true });
  const statsPath = path.join(ROOT, "data/stats.json");
  const s: Stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
  const written: string[] = [];
  const out = (name: string, svg: string) => {
    const f = path.join(ASSETS, name);
    fs.writeFileSync(f, svg);
    written.push(f);
    console.log(`${name.padEnd(26)} ${(svg.length / 1024).toFixed(0).padStart(4)} KB`);
  };
  for (const P of PALETTES) {
    out(`hero-${P.mode}.svg`, await hero(P));
    out(`about-${P.mode}.svg`, await about(P));
    out(`experience-${P.mode}.svg`, await experience(P));
    out(`project-${P.mode}.svg`, await project(P));
    out(`stats-${P.mode}.svg`, await stats(P, s));
    out(`footer-${P.mode}.svg`, await footer(P));
    for (const [file, label, primary] of BUTTONS) out(`${file}-${P.mode}.svg`, await button(P, label, primary));
  }
  return written;
}

if (require.main === module) {
  build().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
