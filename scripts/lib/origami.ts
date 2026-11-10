/**
 * Origami → animated SVG.
 *
 * Takes the very same procedural geometries the website feeds to Three.js
 * (lib/origamiGeometries.ts, copied from lhu-website-v4) and pre-computes a
 * full 360° turn on the CPU. Every facet becomes a <polygon> whose points and
 * flat-shaded opacity are keyframed with SMIL, so the model genuinely rotates
 * in 3D inside a plain <img> on GitHub — no JS, no CSS transforms.
 */
import * as THREE from "three";
import { ORIGAMI_GENERATORS } from "./origamiGeometries";
import type { Palette } from "./theme";
import { n, SOFT } from "./svg";

export const MODELS = {
  crane: 0,
  shuriken: 1,
  luckyStar: 2,
  pinwheel: 3,
  sonobe: 4,
  waterbomb: 5,
  lotus: 6,
  boat: 7,
  saltCellar: 8,
  plane: 9,
  kabuto: 10,
  kitsune: 11,
  usagi: 12,
  swan: 13,
  butterfly: 14,
  goldfish: 15,
  cicada: 16,
  kusudama: 17,
  clam: 18,
  swallow: 19,
  masu: 20,
  sanbo: 21,
  wreath: 22,
  lantern: 23,
} as const;
export type ModelName = keyof typeof MODELS;

interface Mesh {
  verts: THREE.Vector3[];
  tris: [number, number, number][];
}

const cache = new Map<number, Mesh>();

function loadMesh(index: number): Mesh {
  const hit = cache.get(index);
  if (hit) return hit;
  const { geometry } = ORIGAMI_GENERATORS[index](1);
  const pos = geometry.getAttribute("position");
  const verts: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) verts.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));

  // Center on the bounding box and normalise to a unit bounding sphere.
  const box = new THREE.Box3().setFromPoints(verts);
  const c = box.getCenter(new THREE.Vector3());
  let r = 0;
  for (const v of verts) {
    v.sub(c);
    r = Math.max(r, v.length());
  }
  for (const v of verts) v.divideScalar(r);

  const idx = geometry.getIndex();
  const tris: [number, number, number][] = [];
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) tris.push([idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)]);
  } else {
    for (let i = 0; i < pos.count; i += 3) tris.push([i, i + 1, i + 2]);
  }
  // Drop degenerate facets.
  const mesh: Mesh = {
    verts,
    tris: tris.filter(([a, b, c2]) => {
      const ab = verts[b].clone().sub(verts[a]);
      const ac = verts[c2].clone().sub(verts[a]);
      return ab.cross(ac).length() > 1e-5;
    }),
  };
  cache.set(index, mesh);
  return mesh;
}

export interface OrigamiOpts {
  model: ModelName;
  /** centre in px */
  x: number;
  y: number;
  /** bounding-sphere diameter in px */
  size: number;
  palette: Palette;
  /** seconds per full turn */
  dur?: number;
  /** keyframes per turn (18° steps at 20 keep the chord error under 1.3%) */
  frames?: number;
  /** resting tilt (radians) */
  tiltX?: number;
  tiltZ?: number;
  /** starting yaw (radians) */
  phase?: number;
  /** +1 / -1 spin direction */
  dir?: 1 | -1;
  /** atmospheric depth 0.45 (far) .. 1 (near), like OrigamiMesh's depthFactor */
  depth?: number;
  /** idle float amplitude in px and period */
  bob?: number;
  bobDur?: number;
  /** begin offset for the float so neighbours never sync */
  bobDelay?: number;
  /** spin axis: "y" (default) tumbles like the site; "z" spins flat like a pinwheel */
  axis?: "y" | "z";
}

const L1 = new THREE.Vector3(-8, 12, 10).normalize(); // key light (top-left)
const L2 = new THREE.Vector3(10, -6, 6).normalize(); // rim / fill (bottom-right)

/** Render one rotating origami model as an SVG <g>. */
export function origami(o: OrigamiOpts): string {
  const mesh = loadMesh(MODELS[o.model]);
  const P = o.palette;
  const F = o.frames ?? 20;
  const dur = o.dur ?? 36;
  const tiltX = o.tiltX ?? 0.35;
  const tiltZ = o.tiltZ ?? 0.12;
  const phase = o.phase ?? 0;
  const dir = o.dir ?? 1;
  const depth = o.depth ?? 1;
  const axis = o.axis ?? "y";
  const R = o.size / 2;
  const D = 4.2; // camera distance in model radii (gentle perspective)

  // Pre-compute projected verts + facet shading for every keyframe.
  const framePts: [number, number][][] = [];
  const frameShade: number[][] = [];
  const m = new THREE.Matrix4();
  const e = new THREE.Euler();
  for (let f = 0; f <= F; f++) {
    const t = ((f % F) / F) * Math.PI * 2;
    const yaw = phase + dir * t;
    // Periodic precession so the tumble reads as paper drifting on air.
    if (axis === "y") e.set(tiltX + 0.16 * Math.sin(t), yaw, tiltZ + 0.1 * Math.cos(t), "XYZ");
    else e.set(tiltX + 0.08 * Math.sin(t), 0.18 * Math.cos(t), yaw, "XYZ");
    m.makeRotationFromEuler(e);

    const world = mesh.verts.map((v) => v.clone().applyMatrix4(m));
    framePts.push(
      world.map((v) => {
        const p = D / (D - v.z);
        return [v.x * p * R, -v.y * p * R];
      })
    );
    frameShade.push(
      mesh.tris.map(([a, b, c]) => {
        const nrm = world[b].clone().sub(world[a]).cross(world[c].clone().sub(world[a])).normalize();
        // DoubleSide paper: both faces catch light.
        const lit = 0.32 + 0.78 * Math.abs(nrm.dot(L1)) + 0.28 * Math.abs(nrm.dot(L2));
        return lit;
      })
    );
  }

  // Evenly spaced values → no keyTimes needed for linear interpolation.
  const anim = (attr: string, values: string[]) =>
    `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite" values="${values.join(";")}"/>`;

  const fillBase = P.paperOpacity * (0.7 + 0.3 * depth);
  const polys = mesh.tris
    .map(([a, b, c], ti) => {
      const pts = framePts.map((fp) => `${n(fp[a][0])} ${n(fp[a][1])} ${n(fp[b][0])} ${n(fp[b][1])} ${n(fp[c][0])} ${n(fp[c][1])}`);
      const ops = frameShade.map((fs) => n(Math.min(0.9, fillBase * fs[ti]), 3));
      return `<polygon points="${pts[0]}" fill-opacity="${ops[0]}">${anim("points", pts)}${anim("fill-opacity", ops)}</polygon>`;
    })
    .join("");

  const bob = o.bob ?? Math.max(3, o.size * 0.04);
  const bobDur = o.bobDur ?? 7 + (o.size % 5);
  const strokeW = Math.max(0.7, Math.min(1.25, o.size / 140));
  const edgeOp = P.edgeOpacity * depth;

  return [
    `<g transform="translate(${n(o.x)} ${n(o.y)})">`,
    `<g>`,
    `<animateTransform attributeName="transform" type="translate" values="0 0;${n(bob * 0.6)} ${n(-bob)};0 0" dur="${bobDur}s" begin="${n(o.bobDelay ?? 0)}s" repeatCount="indefinite" calcMode="spline" keySplines="${SOFT};${SOFT}"/>`,
    `<g fill="${P.paper}" stroke="${P.edge}" stroke-opacity="${n(edgeOp, 2)}" stroke-width="${n(strokeW, 2)}" stroke-linejoin="round">`,
    polys,
    `</g></g></g>`,
  ].join("");
}

/** Facet count, handy for budgeting file size. */
export function facetCount(model: ModelName): number {
  return loadMesh(MODELS[model]).tris.length;
}
