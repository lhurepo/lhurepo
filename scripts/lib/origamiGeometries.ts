import * as THREE from "three";

/**
 * Helper to build an indexed BufferGeometry with flat facet normals
 * and matching EdgesGeometry for crisp mountain/valley crease lines.
 */
export function buildGeometry(
  vertices: number[],
  indices: number[],
  scale = 1.0,
  creaseAngle = 22
): { geometry: THREE.BufferGeometry; edges: THREE.EdgesGeometry } {
  const geom = new THREE.BufferGeometry();
  const scaledVerts = new Float32Array(vertices.map((v) => v * scale));
  geom.setAttribute("position", new THREE.BufferAttribute(scaledVerts, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  // Crease threshold captures authentic paper folds without over-cluttering (default 22 deg)
  const edges = new THREE.EdgesGeometry(geom, creaseAngle);
  return { geometry: geom, edges };
}

/* =========================================================================
   1. Orizuru (Traditional 3D Paper Crane)
   ========================================================================= */
export function createCraneGeometry(scale = 1.0) {
  // Authentic 3D Paper Crane (Orizuru) folded from Bird Base (Tsuru no kihonkei)
  // Anatomical paper facets: puffed diamond body, 3D reverse-fold neck,
  // downturned beak head, 3D reverse-fold needle tail, and expansive winged dihedral
  const v = [
    // ── Centerline & Body Keel ──
    // 0: Bottom keel apex (belly center)
    0, -0.65, 0,
    // 1: Keel front bottom
    0, -0.3, 0.45,
    // 2: Keel rear bottom
    0, -0.3, -0.45,
    // 3: Back saddle peak (puffed diamond cushion)
    0, 0.32, 0,
    // 4: Front neck notch (where neck emerges)
    0, 0.12, 0.65,
    // 5: Rear tail notch (where tail emerges)
    0, 0.12, -0.65,

    // ── Body Flanks & Shoulders ──
    // 6: Left shoulder / wing root
    -0.65, 0.15, 0,
    // 7: Right shoulder / wing root
    0.65, 0.15, 0,
    // 8: Left mid-belly fold
    -0.45, -0.22, 0,
    // 9: Right mid-belly fold
    0.45, -0.22, 0,
    // 10: Left chest facet
    -0.38, -0.05, 0.42,
    // 11: Right chest facet
    0.38, -0.05, 0.42,
    // 12: Left rump facet
    -0.38, -0.05, -0.42,
    // 13: Right rump facet
    0.38, -0.05, -0.42,

    // ── Neck (Reverse fold rising ~50° forward & upward) ──
    // 14: Neck base left
    -0.12, 0.16, 0.68,
    // 15: Neck base right
    0.12, 0.16, 0.68,
    // 16: Neck base front crease spine
    0, 0.02, 0.76,
    // 17: Neck mid left
    -0.08, 0.72, 1.15,
    // 18: Neck mid right
    0.08, 0.72, 1.15,
    // 19: Neck mid front crease spine
    0, 0.62, 1.25,
    // 20: Throat left
    -0.05, 1.25, 1.58,
    // 21: Throat right
    0.05, 1.25, 1.58,
    // 22: Throat front crease spine
    0, 1.16, 1.66,

    // ── Head & Beak (Reverse fold downward ~48°) ──
    // 23: Crown peak (top of head)
    0, 1.40, 1.52,
    // 24: Head left cheek
    -0.07, 1.22, 1.70,
    // 25: Head right cheek
    0.07, 1.22, 1.70,
    // 26: Beak tip (sharp downturned point)
    0, 0.88, 1.98,
    // 27: Under-chin fold
    0, 1.05, 1.70,

    // ── Tail (Reverse fold rising ~46° backward & upward) ──
    // 28: Tail base left
    -0.12, 0.16, -0.68,
    // 29: Tail base right
    0.12, 0.16, -0.68,
    // 30: Tail base underside crease
    0, 0.02, -0.76,
    // 31: Tail mid left
    -0.07, 0.68, -1.22,
    // 32: Tail mid right
    0.07, 0.68, -1.22,
    // 33: Tail mid underside crease
    0, 0.58, -1.30,
    // 34: Tail tip (sharp needle point)
    0, 1.32, -1.82,

    // ── Left Wing (Spread with 26° dihedral elevation) ──
    // 35: Left wing tip
    -2.65, 1.15, -0.15,
    // 36: Left wing leading edge
    -1.45, 0.72, 0.22,
    // 37: Left wing trailing edge
    -1.35, 0.45, -0.55,
    // 38: Left wing inner diagonal crease ridge
    -1.25, 0.68, -0.05,

    // ── Right Wing (Spread with 26° dihedral elevation) ──
    // 39: Right wing tip
    2.65, 1.15, -0.15,
    // 40: Right wing leading edge
    1.45, 0.72, 0.22,
    // 41: Right wing trailing edge
    1.35, 0.45, -0.55,
    // 42: Right wing inner diagonal crease ridge
    1.25, 0.68, -0.05,
  ];

  const idx = [
    // ── BODY KEEL / BELLY ──
    0, 1, 8,   1, 10, 8,
    0, 8, 2,   2, 8, 12,
    0, 9, 1,   1, 9, 11,
    0, 2, 9,   2, 12, 9,

    // ── BODY CHEST & SADDLE ──
    4, 10, 14, 1, 4, 10,
    4, 15, 11, 1, 11, 4,
    3, 6, 4,   4, 6, 10,
    3, 4, 7,   4, 11, 7,
    6, 8, 10,
    7, 11, 9,

    // ── BODY REAR & SADDLE ──
    5, 28, 12, 2, 12, 5,
    5, 13, 29, 2, 5, 13,
    3, 5, 6,   5, 12, 6,
    3, 7, 5,   5, 7, 13,
    6, 12, 8,
    7, 9, 13,

    // ── NECK SPINAL FACETS ──
    16, 14, 19, 14, 17, 19,
    16, 19, 15, 15, 19, 18,
    19, 17, 22, 17, 20, 22,
    19, 22, 18, 18, 22, 21,
    14, 4, 17,  17, 4, 20,
    15, 18, 4,  18, 21, 4,

    // ── HEAD & BEAK FACETS ──
    23, 20, 24, 23, 24, 26,
    23, 25, 21, 23, 26, 25,
    22, 27, 24, 24, 27, 26,
    22, 25, 27, 25, 26, 27,
    20, 23, 21,
    20, 22, 24, 21, 25, 22,

    // ── TAIL SPINAL FACETS ──
    30, 33, 28, 28, 33, 31,
    30, 29, 33, 29, 32, 33,
    33, 34, 31,
    33, 32, 34,
    28, 31, 5,  31, 34, 5,
    29, 5, 32,  32, 5, 34,

    // ── LEFT WING FACETS ──
    6, 36, 38,   6, 4, 36,
    6, 38, 37,   6, 37, 5,
    38, 36, 35,
    38, 35, 37,

    // ── RIGHT WING FACETS ──
    7, 42, 40,   7, 40, 4,
    7, 41, 42,   7, 5, 41,
    42, 39, 40,
    42, 41, 39,
  ];

  return buildGeometry(v, idx, scale * 0.58);
}

/* =========================================================================
   1. Shuriken (Traditional 4-Blade Ninja Star)
   Interlocking folded paper strips with 3D bevels, central lock seams,
   and distinct blade relief.
   ========================================================================= */
export function createShurikenGeometry(scale = 1.0) {
  const v = [
    // 0: Center front lock apex
    0, 0, 0.24,
    // 1..4: Front lock inner corners (diamond)
    0.0, 0.30, 0.18,   // 1: N
    0.30, 0.0, 0.18,   // 2: E
    0.0, -0.30, 0.18,  // 3: S
    -0.30, 0.0, 0.18,  // 4: W

    // 5..8: Outer Blade Tips (N, E, S, W)
    0.0, 1.42, 0.02,   // 5: Tip N
    1.42, 0.0, 0.02,   // 6: Tip E
    0.0, -1.42, 0.02,  // 7: Tip S
    -1.42, 0.0, 0.02,  // 8: Tip W

    // 9..12: Mid-blade elevated mountain ridges (N, E, S, W)
    0.0, 0.78, 0.11,   // 9: Mid N
    0.78, 0.0, 0.11,   // 10: Mid E
    0.0, -0.78, 0.11,  // 11: Mid S
    -0.78, 0.0, 0.11,  // 12: Mid W

    // 13..16: Perimeter Inner Valleys (NE, SE, SW, NW)
    0.38, 0.38, 0.0,   // 13: Val NE
    0.38, -0.38, 0.0,  // 14: Val SE
    -0.38, -0.38, 0.0, // 15: Val SW
    -0.38, 0.38, 0.0,  // 16: Val NW

    // 17..20: Chiral tuck crease notches (authentic folded strip flaps)
    0.16, 0.52, 0.14,  // 17: Tuck N
    0.52, -0.16, 0.14, // 18: Tuck E
    -0.16, -0.52, 0.14,// 19: Tuck S
    -0.52, 0.16, 0.14, // 20: Tuck W

    // 21: Center back lock apex
    0, 0, -0.24,
    // 22..25: Back lock inner corners
    0.0, 0.30, -0.18,  // 22: N back
    0.30, 0.0, -0.18,  // 23: E back
    0.0, -0.30, -0.18, // 24: S back
    -0.30, 0.0, -0.18, // 25: W back

    // 26..29: Back mid-blade ridges
    0.0, 0.78, -0.11,  // 26: Mid N back
    0.78, 0.0, -0.11,  // 27: Mid E back
    0.0, -0.78, -0.11, // 28: Mid S back
    -0.78, 0.0, -0.11, // 29: Mid W back

    // 30..33: Back chiral tuck notches (complementary reverse chirality)
    -0.16, 0.52, -0.14, // 30: Tuck N back
    0.52, 0.16, -0.14,  // 31: Tuck E back
    0.16, -0.52, -0.14, // 32: Tuck S back
    -0.52, -0.16, -0.14,// 33: Tuck W back
  ];

  // Fully verified outward-facing winding order (+Z front, -Z back)
  const idx = [
    0,2,1, 0,3,2, 0,4,3, 0,1,4,
    1,9,16, 9,5,16, 1,17,9, 17,5,9, 1,2,17, 2,13,17, 17,13,5,
    2,10,13, 10,6,13, 2,18,10, 18,6,10, 2,3,18, 3,14,18, 18,14,6,
    3,11,14, 11,7,14, 3,19,11, 19,7,11, 3,4,19, 4,15,19, 19,15,7,
    4,12,15, 12,8,15, 4,20,12, 20,8,12, 4,1,20, 1,16,20, 20,16,8,
    21,22,23, 21,23,24, 21,24,25, 21,25,22,
    22,26,13, 26,5,13, 22,30,26, 30,5,26, 22,25,30, 25,16,30, 30,16,5,
    23,27,14, 27,6,14, 23,31,27, 31,6,27, 23,22,31, 22,13,31, 31,13,6,
    24,28,15, 28,7,15, 24,32,28, 32,7,28, 24,23,32, 23,14,32, 32,14,7,
    25,29,16, 29,8,16, 25,33,29, 33,8,29, 25,24,33, 24,15,33, 33,15,8
  ];

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   2. Lucky Star (Hoshi5 - Traditional 3D Puffy Lucky Star)
   Folded pentagon strip with 10 pinched perimeter facets and central
   puffed ridge.
   ========================================================================= */
export function createLuckyStarGeometry(scale = 1.0) {
  const v: number[] = [];
  const R_tip = 1.38;
  const R_val = 0.55;
  const R_mid = 0.82;
  const z_center = 0.52;
  const z_mid = 0.32;
  const z_rim_tip = 0.12;
  const z_rim_val = 0.05;

  // 0: Front center apex
  v.push(0, 0, z_center);
  // 1: Back center apex
  v.push(0, 0, -z_center);

  // 2..6: Front mid-arm mountain ridges
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_mid, Math.sin(a) * R_mid, z_mid);
  }

  // 7..11: Back mid-arm mountain ridges
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_mid, Math.sin(a) * R_mid, -z_mid);
  }

  // 12..16: Upper rim tips (5 points)
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_tip, Math.sin(a) * R_tip, z_rim_tip);
  }

  // 17..21: Upper rim pinched valleys (5 points)
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_val, Math.sin(a) * R_val, z_rim_val);
  }

  // 22..26: Lower rim tips (5 points)
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_tip, Math.sin(a) * R_tip, -z_rim_tip);
  }

  // 27..31: Lower rim pinched valleys (5 points)
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / 5 + Math.PI / 2;
    v.push(Math.cos(a) * R_val, Math.sin(a) * R_val, -z_rim_val);
  }

  const idx: number[] = [];

  // Front Facets:
  for (let i = 0; i < 5; i++) {
    const midCurr = 2 + i;
    const midNext = 2 + ((i + 1) % 5);
    const tipCurr = 12 + i;
    const valCurr = 17 + i;
    const valPrev = 17 + ((i + 4) % 5);

    idx.push(0, midCurr, valCurr);
    idx.push(0, valCurr, midNext);

    idx.push(midCurr, tipCurr, valCurr);
    idx.push(midCurr, valPrev, tipCurr);
  }

  // Back Facets (CCW outward normal facing -Z):
  for (let i = 0; i < 5; i++) {
    const midCurr = 7 + i;
    const midNext = 7 + ((i + 1) % 5);
    const tipCurr = 22 + i;
    const valCurr = 27 + i;
    const valPrev = 27 + ((i + 4) % 5);

    idx.push(1, valCurr, midCurr);
    idx.push(1, midNext, valCurr);

    idx.push(midCurr, valCurr, tipCurr);
    idx.push(midCurr, tipCurr, valPrev);
  }

  // 10 Pinched Perimeter Facets (Paper Strip Thickness):
  for (let i = 0; i < 5; i++) {
    const uTip = 12 + i;
    const uVal = 17 + i;
    const uTipNext = 12 + ((i + 1) % 5);

    const lTip = 22 + i;
    const lVal = 27 + i;
    const lTipNext = 22 + ((i + 1) % 5);

    // Pinched Facet 1 (Tip to Valley)
    idx.push(uTip, lTip, uVal);
    idx.push(uVal, lTip, lVal);

    // Pinched Facet 2 (Valley to Next Tip)
    idx.push(uVal, lVal, uTipNext);
    idx.push(uTipNext, lVal, lTipNext);
  }

  return buildGeometry(v, idx, scale);
}

/* =========================================================================
   3. Kazaguruma (Traditional Origami Pinwheel)
   4 angled pleated blades folded from a square base with distinct fold
   ridges and windmill pocket geometry.
   ========================================================================= */
export function createPinwheelGeometry(scale = 1.0) {
  const v: number[] = [];

  // 0: Front center pin/axle
  v.push(0, 0, 0.22);
  // 1: Back center pin/axle
  v.push(0, 0, -0.22);

  // 2..5: Front central square hub corners (NE, NW, SW, SE)
  const h = 0.28;
  const zh = 0.12;
  v.push( h,  h, zh); // 2: NE
  v.push(-h,  h, zh); // 3: NW
  v.push(-h, -h, zh); // 4: SW
  v.push( h, -h, zh); // 5: SE

  // 6..9: Back central square hub corners
  v.push( h,  h, -zh); // 6: NE back
  v.push(-h,  h, -zh); // 7: NW back
  v.push(-h, -h, -zh); // 8: SW back
  v.push( h, -h, -zh); // 9: SE back

  // 10..13: Blade Tips (angled forward with authentic windmill blade pitch)
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    v.push(0.32 * cos - 1.40 * sin, 0.32 * sin + 1.40 * cos, 0.22);
  }

  // 14..17: Blade Outer Shoulders
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    v.push(-0.38 * cos - 1.15 * sin, -0.38 * sin + 1.15 * cos, 0.08);
  }

  // 18..21: Blade Pleat Ridges (elevated diagonal mountain fold)
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    v.push(0.05 * cos - 0.75 * sin, 0.05 * sin + 0.75 * cos, 0.20);
  }

  // 22..25: Blade Pocket Flaps (windmill base fold)
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    v.push(0.82 * cos - 0.38 * sin, 0.82 * sin + 0.38 * cos, -0.06);
  }

  // 26..29: Back Blade Under-ridges
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    v.push(0.05 * cos - 0.75 * sin, 0.05 * sin + 0.75 * cos, 0.12);
  }

  // Fully verified CCW outward-facing winding order (+Z front, -Z back)
  const idx = [
    0,2,3, 0,3,4, 0,4,5, 0,5,2,
    1,6,7, 1,7,8, 1,8,9, 1,9,6,
    3,18,14, 14,18,10, 3,2,18, 2,10,18, 2,22,10, 2,5,22,
    7,26,14, 14,26,10, 7,6,26, 6,10,26, 6,22,10, 6,9,22,
    4,19,15, 15,19,11, 4,3,19, 3,11,19, 3,23,11, 3,2,23,
    8,27,15, 15,27,11, 8,27,7, 7,27,11, 7,11,23, 7,23,6,
    5,16,20, 16,12,20, 5,20,4, 4,20,12, 4,12,24, 4,24,3,
    9,16,28, 16,12,28, 9,28,8, 8,28,12, 8,12,24, 8,24,7,
    2,17,21, 17,13,21, 2,21,5, 5,21,13, 5,13,25, 5,25,4,
    6,17,29, 17,13,29, 6,29,9, 9,29,13, 9,13,25, 9,25,8
  ];

  return buildGeometry(v, idx, scale);
}

/* =========================================================================
   4. SonobeCube (Classic Modular Sonobe Unit Cube)
   Traditional 6-unit modular origami Sonobe cube. Each square face has an
   authentic diagonal mountain fold dividing two triangular flaps tucked into seams.
   ========================================================================= */
export function createSonobeCubeGeometry(scale = 1.0) {
  const s = 0.82; // cube half-side
  const p = 1.12; // elevated diagonal mountain fold peak

  const v = [
    // 8 Box Corners (0..7)
    -s, -s, -s,   s, -s, -s,   s,  s, -s,  -s,  s, -s,
    -s, -s,  s,   s, -s,  s,   s,  s,  s,  -s,  s,  s,

    // 12 Edge midpoints (8..19): authentic seam borders
    0, -s, -s,   s,  0, -s,   0,  s, -s,  -s,  0, -s, // 8..11 (-Z edges)
    0, -s,  s,   s,  0,  s,   0,  s,  s,  -s,  0,  s, // 12..15 (+Z edges)
   -s, -s,  0,   s, -s,  0,   s,  s,  0,  -s,  s,  0, // 16..19 (Z-connecting edges)

    // 6 Face center peaks (20..25) along diagonal mountain creases
    0, 0, p,    // 20: +Z
    0, 0, -p,   // 21: -Z
    0, p, 0,    // 22: +Y
    0, -p, 0,   // 23: -Y
    p, 0, 0,    // 24: +X
   -p, 0, 0,    // 25: -X
  ];

  const idx: number[] = [];
  function addFace(
    c0: number,
    c1: number,
    c2: number,
    c3: number,
    e01: number,
    e12: number,
    e23: number,
    e30: number,
    peak: number
  ) {
    // Diagonal mountain fold runs C0 -> peak -> C2
    // Flap C3 tucks along seam e30 - e23
    idx.push(peak, e30, c0);
    idx.push(peak, e23, e30);
    idx.push(peak, c2, e23);
    idx.push(c3, e30, e23);

    // Flap C1 tucks along seam e01 - e12
    idx.push(peak, e12, c2);
    idx.push(peak, e01, e12);
    idx.push(peak, c0, e01);
    idx.push(c1, e12, e01);
  }

  // +Z face (corners 4, 5, 6, 7; edges 12, 13, 14, 15; peak 20)
  addFace(4, 5, 6, 7, 12, 13, 14, 15, 20);
  // -Z face (corners 1, 0, 3, 2; edges 8, 11, 10, 9; peak 21)
  addFace(1, 0, 3, 2, 8, 11, 10, 9, 21);
  // +Y face (corners 7, 6, 2, 3; edges 14, 18, 10, 19; peak 22)
  addFace(7, 6, 2, 3, 14, 18, 10, 19, 22);
  // -Y face (corners 4, 0, 1, 5; edges 16, 8, 17, 12; peak 23)
  addFace(4, 0, 1, 5, 16, 8, 17, 12, 23);
  // +X face (corners 5, 1, 2, 6; edges 17, 9, 18, 13; peak 24)
  addFace(5, 1, 2, 6, 17, 9, 18, 13, 24);
  // -X face (corners 4, 7, 3, 0; edges 15, 19, 11, 16; peak 25)
  addFace(4, 7, 3, 0, 15, 19, 11, 16, 25);

  return buildGeometry(v, idx, scale * 0.92);
}

/* =========================================================================
   5. Waterbomb (Traditional Balloon Cube / Fukusen)
   Traditional balloon cube. 4 inward squash folds, top/bottom pyramid apexes,
   genuine hollow origami paper volume.
   ========================================================================= */
export function createWaterbombGeometry(scale = 1.0) {
  const v: number[] = [];

  // 0: Top apex
  v.push(0, 1.30, 0);
  // 1: Bottom apex (inflation blowhole)
  v.push(0, -1.30, 0);

  // 2..5: 4 Equatorial outer corners (puffed corners)
  const ce = 1.15;
  v.push( ce, 0,  ce); // 2: NE corner
  v.push(-ce, 0,  ce); // 3: NW corner
  v.push(-ce, 0, -ce); // 4: SW corner
  v.push( ce, 0, -ce); // 5: SE corner

  // 6..9: 4 Inward squash fold valleys (indented equator)
  const vi = 0.42;
  v.push( 0,   0,  vi); // 6: N valley
  v.push(-vi,  0,   0); // 7: W valley
  v.push( 0,   0, -vi); // 8: S valley
  v.push( vi,  0,   0); // 9: E valley

  // 10..13: 4 Upper squash vertices (at y = 0.58, r = 0.62)
  const us_r = 0.62;
  const us_y = 0.58;
  v.push( 0,     us_y,  us_r); // 10: N upper squash
  v.push(-us_r,  us_y,  0);    // 11: W upper squash
  v.push( 0,     us_y, -us_r); // 12: S upper squash
  v.push( us_r,  us_y,  0);    // 13: E upper squash

  // 14..17: 4 Lower squash vertices (at y = -0.58, r = 0.62)
  v.push( 0,    -us_y,  us_r); // 14: N lower squash
  v.push(-us_r, -us_y,  0);    // 15: W lower squash
  v.push( 0,    -us_y, -us_r); // 16: S lower squash
  v.push( us_r, -us_y,  0);    // 17: E lower squash

  // 18..21: 4 Upper pyramid mid-ridges (diagonal flap fold lines)
  const um_r = 0.72;
  const um_y = 0.75;
  v.push( um_r, um_y,  um_r); // 18: NE mid-ridge
  v.push(-um_r, um_y,  um_r); // 19: NW mid-ridge
  v.push(-um_r, um_y, -um_r); // 20: SW mid-ridge
  v.push( um_r, um_y, -um_r); // 21: SE mid-ridge

  // 22..25: 4 Lower pyramid mid-ridges
  v.push( um_r, -um_y,  um_r); // 22: NE mid-ridge
  v.push(-um_r, -um_y,  um_r); // 23: NW mid-ridge
  v.push(-um_r, -um_y, -um_r); // 24: SW mid-ridge
  v.push( um_r, -um_y, -um_r); // 25: SE mid-ridge

  const idx: number[] = [];

  // Triangulation of the 4 quadrants with inward squash folds:
  for (let k = 0; k < 4; k++) {
    const cR = 2 + k;
    const cL = 2 + ((k + 1) % 4);
    const vM = 6 + k;
    const uM = 10 + k;
    const dM = 14 + k;

    const umR = 18 + k;
    const umL = 18 + ((k + 1) % 4);
    const dmR = 22 + k;
    const dmL = 22 + ((k + 1) % 4);

    // Top pyramid apex facets
    idx.push(0, uM, umR);
    idx.push(0, umL, uM);

    // Upper pyramid slopes
    idx.push(umR, uM, cR);
    idx.push(umL, cL, uM);

    // Upper squash fold pocket
    idx.push(uM, vM, cR);
    idx.push(uM, cL, vM);

    // Lower squash fold pocket
    idx.push(dM, cR, vM);
    idx.push(dM, vM, cL);

    // Lower pyramid slopes
    idx.push(dmR, cR, dM);
    idx.push(dmL, dM, cL);

    // Bottom pyramid apex facets
    idx.push(1, dmR, dM);
    idx.push(1, dM, dmL);
  }

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   6. Hasu (Traditional Blooming Lotus)
   ========================================================================= */
/**
 * Authentic 3D Blooming Lotus (Hasu / Suiren)
 * Folded from repeated blintz bases: concentric tiered petals (inner cup,
 * mid transition petals, outer flared base) with central mountain crease ridges
 * and concave fluted petal cups.
 */
export function createLotusGeometry(scale = 1.0) {
  const v: number[] = [];
  const idx: number[] = [];

  // 0: Center bottom apex
  v.push(0, -0.42, 0);
  // 1: Inner cup center top (seed pod floor)
  v.push(0, 0.10, 0);

  // 2..9: 8 Inner Petal Tips (standing upright, cupped inward)
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const isCardinal = k % 2 === 0;
    const r = isCardinal ? 0.48 : 0.42;
    const y = isCardinal ? 0.68 : 0.58;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // 10..17: 8 Inner Valley Notches (between inner petals)
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) * Math.PI) / 4;
    const r = 0.32;
    const y = 0.22;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // 18..25: 8 Outer Petal Tips (flaring outward with mountain crease)
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const isCardinal = k % 2 === 0;
    const r = isCardinal ? 1.38 : 1.20;
    const y = isCardinal ? 0.08 : 0.0;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // 26..33: 8 Outer Valley Notches (between outer petals)
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) * Math.PI) / 4;
    const r = 0.72;
    const y = -0.10;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // 34..41: 8 Base Rim Ring Nodes
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const r = 0.52;
    const y = -0.22;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // Connectivity:
  // 1. Inner Cup floor: Center top (1) to inner valley notches and tips
  for (let k = 0; k < 8; k++) {
    const v1 = 10 + k;
    const v2 = 10 + ((k + 1) % 8);
    const tip = 2 + ((k + 1) % 8);
    idx.push(1, v1, tip);
    idx.push(1, tip, v2);
  }

  // 2. Petal inter-tier transitions (Outer Petals)
  for (let k = 0; k < 8; k++) {
    const inTip = 2 + k;
    const inValLeft = 10 + ((k + 7) % 8);
    const inValRight = 10 + k;

    const outTip = 18 + k;
    const outValLeft = 26 + ((k + 7) % 8);
    const outValRight = 26 + k;

    const baseNode = 34 + k;

    // Mountain fold down center of outer petal with left/right valley facets
    idx.push(inTip, inValLeft, outTip);
    idx.push(inTip, outTip, inValRight);

    // Flanks connecting outer petal tip to outer valleys and base ring
    idx.push(outTip, outValLeft, baseNode);
    idx.push(outTip, baseNode, outValRight);
  }

  // 3. Between outer valleys and inner valleys
  for (let k = 0; k < 8; k++) {
    const inVal = 10 + k;
    const outVal = 26 + k;
    const base1 = 34 + k;
    idx.push(inVal, outVal, base1);
  }

  // 4. Base ring to bottom center (0)
  for (let k = 0; k < 8; k++) {
    const b1 = 34 + k;
    const b2 = 34 + ((k + 1) % 8);
    idx.push(0, b2, b1);
  }

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   7. Boat (Traditional Origami Sailboat / Sampan)
   Folded hull gunwales, bow & stern reverse folds, upright faceted
   triangular sail with diagonal fold line.
   ========================================================================= */
export function createBoatGeometry(scale = 1.0) {
  const v = [
    // ── Bow & Fore Keel ──
    0, 0.38, 1.45,       // 0: Bow tip (prow peak)
    0, -0.20, 1.15,      // 1: Bow keel base
    -0.30, -0.15, 0.90,  // 2: Bow port chine
    0.30, -0.15, 0.90,   // 3: Bow starboard chine
    -0.38, 0.20, 1.05,   // 4: Bow port gunwale
    0.38, 0.20, 1.05,    // 5: Bow starboard gunwale
    0, 0.14, 0.88,       // 6: Bow inner reverse-fold throat

    // ── Mid-Hull ──
    0, -0.50, 0.0,       // 7: Center keel bottom
    -0.55, -0.32, 0.0,   // 8: Mid port chine
    0.55, -0.32, 0.0,    // 9: Mid starboard chine
    -0.72, 0.12, 0.0,    // 10: Mid port outer gunwale
    0.72, 0.12, 0.0,     // 11: Mid starboard outer gunwale
    0, -0.28, 0.0,       // 12: Cockpit floor center
    -0.50, 0.05, 0.0,    // 13: Mid port inner gunwale rim
    0.50, 0.05, 0.0,     // 14: Mid starboard inner gunwale rim

    // ── Stern & Aft Keel ──
    0, 0.38, -1.45,      // 15: Stern tip (aft peak)
    0, -0.20, -1.15,     // 16: Stern keel base
    -0.30, -0.15, -0.90, // 17: Stern port chine
    0.30, -0.15, -0.90,  // 18: Stern starboard chine
    -0.38, 0.20, -1.05,  // 19: Stern port gunwale
    0.38, 0.20, -1.05,   // 20: Stern starboard gunwale
    0, 0.14, -0.88,      // 21: Stern inner reverse-fold throat

    // ── Upright Faceted Mainsail ──
    0, 1.62, -0.12,      // 22: Mainsail mast peak
    0, 0.10, -0.72,      // 23: Mainsail aft clew
    0, 0.08, 0.15,       // 24: Mainsail tack (mast step)
    -0.08, 0.82, -0.30,  // 25: Mainsail port diagonal crease ridge
    0.08, 0.82, -0.30,   // 26: Mainsail starboard diagonal crease ridge

    // ── Upright Faceted Foresail (Jib) ──
    0, 1.08, 0.22,       // 27: Foresail peak
    0, 0.10, 0.82,       // 28: Foresail tack
    -0.06, 0.55, 0.45,   // 29: Foresail port crease
    0.06, 0.55, 0.45,    // 30: Foresail starboard crease
  ];

  const idx = [
    // ── Bow reverse-fold prow facets ──
    0, 4, 2,   0, 2, 1,   // Port bow outer
    0, 1, 3,   0, 3, 5,   // Starboard bow outer
    0, 5, 6,   0, 6, 4,   // Bow deck inward fold
    6, 2, 4,   6, 5, 3,   // Bow throat transitions

    // ── Hull Bottom (Keel to Chine) ──
    1, 2, 8,   1, 8, 7,   // Port fore bottom
    1, 7, 9,   1, 9, 3,   // Starboard fore bottom
    7, 8, 17,  7, 17, 16, // Port aft bottom
    7, 16, 18, 7, 18, 9,  // Starboard aft bottom

    // ── Hull Topsides (Chine to Gunwale) ──
    2, 4, 10,  2, 10, 8,  // Port fore topside
    3, 9, 11,  3, 11, 5,  // Starboard fore topside
    8, 10, 19, 8, 19, 17, // Port aft topside
    9, 18, 20, 9, 20, 11, // Starboard aft topside

    // ── Stern reverse-fold facets ──
    15, 17, 19, 15, 16, 17, // Port stern outer
    15, 18, 16, 15, 20, 18, // Starboard stern outer
    15, 21, 20, 15, 19, 21, // Stern deck inward fold
    21, 19, 17, 21, 18, 20, // Stern throat transitions

    // ── Gunwale rim & Cockpit ──
    4, 6, 13,   4, 13, 10, // Port forward rim
    5, 11, 14,  5, 14, 6,  // Starboard forward rim
    10, 13, 19, 13, 21, 19,// Port aft rim
    11, 20, 14, 14, 20, 21,// Starboard aft rim
    6, 21, 13,  13, 21, 12,// Port cockpit well
    6, 14, 21,  14, 12, 21,// Starboard cockpit well

    // ── Mainsail port facets (diagonal crease) ──
    22, 25, 23, // Mast to clew upper port
    22, 24, 25, // Mast to tack fore port
    24, 23, 25, // Tack to clew lower port

    // ── Mainsail starboard facets (diagonal crease) ──
    22, 23, 26, // Mast to clew upper starboard
    22, 26, 24, // Mast to tack fore starboard
    24, 26, 23, // Tack to clew lower starboard

    // ── Foresail port facets ──
    27, 29, 28, // Foresail top port
    27, 24, 29, // Foresail aft port
    24, 28, 29, // Foresail bottom port

    // ── Foresail starboard facets ──
    27, 28, 30, // Foresail top starboard
    27, 30, 24, // Foresail aft starboard
    24, 30, 28, // Foresail bottom starboard
  ];

  return buildGeometry(v, idx, scale * 0.9);
}

/* =========================================================================
   8. SaltCellar (Traditional Fortune Teller / Paku-paku)
   4 pyramidal finger pockets with inner fold valleys and outer flared flaps.
   ========================================================================= */
export function createSaltCellarGeometry(scale = 1.0) {
  const v: number[] = [];
  const idx: number[] = [];

  // 0: Center top valley junction
  v.push(0, 0.05, 0);
  // 1: Underside center throat
  v.push(0, -0.35, 0);

  const pocketAngles = [
    Math.PI / 4,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 4,
    (7 * Math.PI) / 4,
  ];

  const valleyAngles = [
    0,
    Math.PI / 2,
    Math.PI,
    (3 * Math.PI) / 2,
  ];

  // 2..5: 4 Valley Outer Rims (at cardinal axes)
  for (let i = 0; i < 4; i++) {
    const a = valleyAngles[i];
    v.push(Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55);
  }

  // 6..9: 4 Valley Inner Depressions (closer to center)
  for (let i = 0; i < 4; i++) {
    const a = valleyAngles[i];
    v.push(Math.cos(a) * 0.28, -0.15, Math.sin(a) * 0.28);
  }

  // 10..13: 4 Pocket Upper Peaks (pyramidal tips)
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i];
    v.push(Math.cos(a) * 1.25, 0.58, Math.sin(a) * 1.25);
  }

  // 14..17: 4 Outer Flap Bottom Tips (outer flared corners pointing down)
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i];
    v.push(Math.cos(a) * 1.28, -0.35, Math.sin(a) * 1.28);
  }

  // 18..21: 4 Outer Flap Left Wings (tangential flare)
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i] - 0.35;
    v.push(Math.cos(a) * 1.10, 0.15, Math.sin(a) * 1.10);
  }

  // 22..25: 4 Outer Flap Right Wings (tangential flare)
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i] + 0.35;
    v.push(Math.cos(a) * 1.10, 0.15, Math.sin(a) * 1.10);
  }

  // 26..29: 4 Inner Finger Cavity Roofs (inside the hollow pocket)
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i];
    v.push(Math.cos(a) * 0.85, 0.32, Math.sin(a) * 0.85);
  }

  // 30..33: 4 Underside Cavity Outer Lips
  for (let i = 0; i < 4; i++) {
    const a = pocketAngles[i];
    v.push(Math.cos(a) * 0.90, -0.42, Math.sin(a) * 0.90);
  }

  for (let i = 0; i < 4; i++) {
    const vRight = 2 + i;
    const vLeft = 2 + ((i + 1) % 4);
    const viRight = 6 + i;
    const viLeft = 6 + ((i + 1) % 4);

    const peak = 10 + i;
    const flapBot = 14 + i;
    const flapLeft = 18 + i;
    const flapRight = 22 + i;
    const cavRoof = 26 + i;
    const cavLip = 30 + i;

    // ── Upper Pyramidal Pocket Facets ──
    idx.push(0, viRight, peak);
    idx.push(0, peak, viLeft);
    idx.push(viRight, vRight, peak);
    idx.push(viLeft, peak, vLeft);

    // ── Outer Flared Pocket Flap Facets ──
    idx.push(peak, vRight, flapRight);
    idx.push(peak, flapLeft, vLeft);
    idx.push(peak, flapRight, flapBot);
    idx.push(peak, flapBot, flapLeft);

    // ── Underside Cavity & Finger Pocket Depth ──
    idx.push(flapBot, flapRight, cavLip);
    idx.push(flapBot, cavLip, flapLeft);
    idx.push(cavLip, flapRight, cavRoof);
    idx.push(cavLip, cavRoof, flapLeft);
    idx.push(1, cavRoof, viRight);
    idx.push(1, viLeft, cavRoof);
  }

  return buildGeometry(v, idx, scale * 0.88);
}

/* =========================================================================
   9. Plane (Traditional Dart / Nakamura Glider)
   Center keel fold, angled wing folds, wingtip stabilizer winglets,
   nose lock fold.
   ========================================================================= */
export function createPlaneGeometry(scale = 1.0) {
  const v = [
    // ── Nose & Lock Fold ──
    0, 0.02, 1.55,     // 0: Nose tip
    0, -0.10, 1.45,    // 1: Nose underside fold
    0, 0.12, 1.05,     // 2: Nose lock tab apex (tucked triangle)
    -0.16, 0.06, 1.25, // 3: Nose lock tab left corner
    0.16, 0.06, 1.25,  // 4: Nose lock tab right corner

    // ── Fuselage / Center Keel (Underside grip) ──
    0, -0.18, 1.20,    // 5: Keel front
    0, -0.48, 0.20,    // 6: Keel mid
    0, -0.52, -0.60,   // 7: Keel aft
    0, -0.42, -1.35,   // 8: Keel tail bottom
    0, -0.06, -1.45,   // 9: Keel tail notch

    // ── Dorsal Centerline (Valley between wings) ──
    0, 0.08, 0.0,      // 10: Dorsal mid
    0, 0.08, -1.45,    // 11: Dorsal tail

    // ── Wing Roots (Wing to fuselage attachment) ──
    -0.12, 0.05, 1.25, // 12: Port wing root front
    0.12, 0.05, 1.25,  // 13: Starboard wing root front
    -0.15, 0.07, 0.0,  // 14: Port wing root mid
    0.15, 0.07, 0.0,   // 15: Starboard wing root mid
    -0.18, 0.08, -1.45,// 16: Port wing root tail
    0.18, 0.08, -1.45, // 17: Starboard wing root tail

    // ── Wings Leading Edge & Mid Facets ──
    -0.72, 0.16, 0.20, // 18: Port wing leading edge mid
    0.72, 0.16, 0.20,  // 19: Starboard wing leading edge mid
    -0.60, 0.14, -0.55,// 20: Port wing diagonal fold ridge
    0.60, 0.14, -0.55, // 21: Starboard wing diagonal fold ridge

    // ── Winglet Fold Creases (Outer wing edge) ──
    -1.18, 0.22, -0.30,// 22: Port winglet fold front
    1.18, 0.22, -0.30, // 23: Starboard winglet fold front
    -1.35, 0.25, -1.40,// 24: Port winglet fold aft
    1.35, 0.25, -1.40, // 25: Starboard winglet fold aft

    // ── Vertical Stabilizer Winglets (Folded Up) ──
    -1.22, 0.62, -0.35,// 26: Port winglet top front
    1.22, 0.62, -0.35, // 27: Starboard winglet top front
    -1.38, 0.65, -1.42,// 28: Port winglet top aft
    1.38, 0.65, -1.42, // 29: Starboard winglet top aft

    // ── Wing Trailing Edges ──
    -0.75, 0.17, -1.42,// 30: Port wing trailing edge mid
    0.75, 0.17, -1.42, // 31: Starboard wing trailing edge mid
  ];

  const idx = [
    // ── Nose & Lock Fold Facets ──
    0, 3, 2,   0, 2, 4,   // Lock tab upper face
    0, 1, 3,   0, 4, 1,   // Nose underside wrap
    1, 5, 3,   1, 4, 5,   // Nose to keel front
    2, 3, 12,  2, 13, 4,  // Lock corners to wing roots
    2, 12, 10, 2, 10, 13, // Lock apex to dorsal centerline

    // ── Dorsal valley folds between wings ──
    10, 12, 14, 10, 15, 13, // Mid dorsal to mid root
    10, 14, 16, 10, 16, 11, // Dorsal to port tail
    10, 17, 15, 10, 11, 17, // Dorsal to starboard tail

    // ── Keel Fuselage Walls (Underside grip) ──
    5, 6, 14,  5, 14, 12, // Port keel front
    5, 13, 15, 5, 15, 6,  // Starboard keel front
    6, 7, 16,  6, 16, 14, // Port keel mid
    6, 15, 17, 6, 17, 7,  // Starboard keel mid
    7, 8, 16,  7, 17, 8,  // Keel aft to tail
    8, 9, 16,  8, 17, 9,  // Keel bottom to notch

    // ── Port Wing Facets ──
    12, 3, 18,            // Wing root shoulder to lead
    3, 0, 18,             // Nose tip to leading edge
    12, 18, 20, 12, 20, 14,// Inner wing panel
    18, 22, 20,           // Outer leading wing
    20, 22, 24,           // Outer wing panel
    20, 24, 30,           // Mid outer wing
    14, 20, 30, 14, 30, 16,// Inner trailing wing

    // ── Starboard Wing Facets ──
    13, 19, 4,            // Wing root shoulder to lead
    4, 19, 0,             // Nose tip to leading edge
    13, 21, 19, 13, 15, 21,// Inner wing panel
    19, 21, 23,           // Outer leading wing
    21, 25, 23,           // Outer wing panel
    21, 31, 25,           // Mid outer wing
    15, 31, 21, 15, 17, 31,// Inner trailing wing

    // ── Vertical Stabilizer Winglets ──
    22, 26, 28, 22, 28, 24,// Port winglet outer face
    23, 29, 27, 23, 25, 29,// Starboard winglet outer face
  ];

  return buildGeometry(v, idx, scale * 0.9);
}

/* =========================================================================
   10. Kabuto (Traditional Samurai Helmet)
   ========================================================================= */
export function createKabutoGeometry(scale = 1.0) {
  // Authentic 3D Samurai Helmet (Kabuto) folded from traditional square paper
  // Key origami facets:
  // - Sweeping curved horns (Kuwagata) with 3D paper ridge fold & thickness
  // - Central folded diamond crest (Maedate)
  // - Forward visor rim (Mabizashi)
  // - Flared cheek / ear guards (Fukikaeshi) folded outward
  // - Layered tiered neck guard flaps (Shikoro) curving around the back
  const v = [
    // ── Centerline Vertices (X = 0) ──
    0, 0.95, -0.15,  // 0: Crown Peak (Hachi apex)
    0, 0.62, -0.65,  // 1: Rear Upper Dome
    0, 0.15, -0.78,  // 2: Rear Lower Rim / Shikoro Top
    0, -0.42, -0.85, // 3: Shikoro Bottom Center
    0, 0.70, 0.35,   // 4: Forehead Top Center
    0, 0.98, 0.62,   // 5: Maedate Top Crest Point
    0, 0.48, 0.76,   // 6: Maedate Center Ridge
    0, -0.18, 0.82,  // 7: Visor Brim Peak (Mabizashi front point)
    0, -0.28, 0.50,  // 8: Visor Inner Return Rim

    // ── Left Side (X < 0) ──
    -0.52, 0.68, -0.18, // 9: Left Dome Top
    -0.55, 0.28, -0.58, // 10: Left Dome Rear
    -0.72, -0.05, -0.55,// 11: Left Shikoro Upper
    -0.88, -0.45, -0.62,// 12: Left Shikoro Flared Tip
    -0.45, -0.42, -0.78,// 13: Left Shikoro Rear Mid
    -0.35, 0.40, 0.45,  // 14: Left Forehead Brow
    -0.24, 0.60, 0.60,  // 15: Left Maedate Tip
    -0.58, -0.16, 0.58, // 16: Left Visor Corner
    -0.58, 0.12, 0.48,  // 17: Left Fukikaeshi Hinge
    -0.96, 0.20, 0.22,  // 18: Left Fukikaeshi Tip (swept ear flap)
    -0.72, 0.18, -0.08, // 19: Left Temple Rim
    -0.18, 0.62, 0.52,  // 20: Left Horn Base
    -0.82, 1.05, 0.42,  // 21: Left Horn Mid Outer Edge
    -0.72, 1.25, 0.52,  // 22: Left Horn Mid Ridge Fold
    -0.48, 1.28, 0.55,  // 23: Left Horn Mid Inner Edge
    -1.38, 1.72, 0.45,  // 24: Left Horn Sweeping Tip

    // ── Right Side (X > 0, mirrored) ──
    0.52, 0.68, -0.18,  // 25: Right Dome Top
    0.55, 0.28, -0.58,  // 26: Right Dome Rear
    0.72, -0.05, -0.55, // 27: Right Shikoro Upper
    0.88, -0.45, -0.62, // 28: Right Shikoro Flared Tip
    0.45, -0.42, -0.78, // 29: Right Shikoro Rear Mid
    0.35, 0.40, 0.45,   // 30: Right Forehead Brow
    0.24, 0.60, 0.60,   // 31: Right Maedate Tip
    0.58, -0.16, 0.58,  // 32: Right Visor Corner
    0.58, 0.12, 0.48,   // 33: Right Fukikaeshi Hinge
    0.96, 0.20, 0.22,   // 34: Right Fukikaeshi Tip
    0.72, 0.18, -0.08,  // 35: Right Temple Rim
    0.18, 0.62, 0.52,   // 36: Right Horn Base
    0.82, 1.05, 0.42,   // 37: Right Horn Mid Outer Edge
    0.72, 1.25, 0.52,   // 38: Right Horn Mid Ridge Fold
    0.48, 1.28, 0.55,   // 39: Right Horn Mid Inner Edge
    1.38, 1.72, 0.45,   // 40: Right Horn Sweeping Tip
  ];

  const idx = [
    // ── DOME (Hachi) ──
    0, 9, 4,    0, 1, 9,    0, 25, 1,   0, 4, 25,
    4, 9, 14,   9, 19, 14,  9, 10, 19,  9, 1, 10,
    4, 30, 25,  25, 30, 35, 25, 35, 26, 25, 26, 1,
    1, 2, 10,   1, 26, 2,

    // ── SHIKORO (Layered Neck Guard) ──
    2, 11, 10,  10, 11, 19, 11, 12, 19, 11, 13, 12, 2, 13, 11, 2, 3, 13,
    2, 26, 27,  26, 35, 27, 27, 35, 28, 27, 28, 29, 2, 27, 29, 2, 29, 3,

    // ── FUKIKAESHI (Flared Ear Guards) ──
    14, 18, 17, 14, 19, 18, 14, 17, 16, 17, 18, 16,
    30, 33, 34, 30, 34, 35, 30, 32, 33, 33, 32, 34,

    // ── VISOR BRIM (Mabizashi) ──
    6, 16, 7,   6, 7, 32,   6, 14, 16,  6, 32, 30,
    7, 16, 8,   7, 8, 32,

    // ── MAEDATE (Frontal Crest Ornament) ──
    5, 15, 6,   5, 6, 31,   6, 15, 14,  6, 30, 31,
    4, 20, 5,   4, 5, 36,   4, 14, 20,  4, 36, 30,

    // ── KUWAGATA HORNS (Left) ──
    20, 22, 21, 22, 24, 21, 20, 23, 22, 22, 23, 24,
    20, 21, 23, 24, 23, 21,

    // ── KUWAGATA HORNS (Right) ──
    36, 37, 38, 38, 37, 40, 36, 38, 39, 38, 40, 39,
    36, 39, 37, 40, 37, 39,
  ];

  return buildGeometry(v, idx, scale * 0.85);
}

/* =========================================================================
   11. Kitsune (Traditional Folded Fox)
   ========================================================================= */
export function createKitsuneGeometry(scale = 1.0) {
  // Authentic 3D Origami Fox (Kitsune)
  // Key origami facets:
  // - Pointed upright ears with deep hollow fold & inner shadows
  // - Angled sharp snout, bridge and under-chin
  // - Chest pleat / keel running down to front paws
  // - Seated body flanks with broad folded haunches
  // - Voluminous 3D puffed diamond tail curving upward
  const v = [
    // ── Centerline (X = 0) ──
    0, 0.22, 1.05,  // 0: Snout Tip
    0, 0.46, 0.75,  // 1: Snout Bridge
    0, 0.12, 0.72,  // 2: Snout Under-chin / Jaw
    0, 0.70, 0.42,  // 3: Forehead Center
    0, 0.68, 0.12,  // 4: Crown / Nape Top
    0, 0.05, 0.45,  // 5: Throat Notch
    0, -0.30, 0.42, // 6: Chest Pleat Apex
    0, -0.80, 0.35, // 7: Front Paws Center
    0, 0.38, -0.05, // 8: Upper Back Saddle
    0, -0.15, -0.28,// 9: Mid Back Spine
    0, -0.45, -0.42,// 10: Rump / Tail Root
    0, -0.80, -0.25,// 11: Rear Ground Center
    0, -0.05, -0.88,// 12: Tail Outer Swept Spine
    0, 0.58, -0.72, // 13: Tail Tip
    0, 0.12, -0.50, // 14: Tail Inner Return Fold

    // ── Left Side (X < 0) ──
    -0.30, 0.32, 0.55,  // 15: Left Cheek
    -0.32, 0.68, 0.30,  // 16: Left Ear Outer Base
    -0.08, 0.76, 0.35,  // 17: Left Ear Inner Base
    -0.22, 1.02, 0.32,  // 18: Left Ear Hollow (cupped interior)
    -0.42, 1.05, 0.22,  // 19: Left Ear Outer Ridge
    -0.38, 1.48, 0.25,  // 20: Left Ear Tip
    -0.45, 0.15, 0.08,  // 21: Left Shoulder / Upper Flank
    -0.22, -0.80, 0.30, // 22: Left Front Paw
    -0.62, -0.55, -0.18,// 23: Left Seated Haunch (outer thigh)
    -0.45, -0.80, -0.15,// 24: Left Haunch Ground Rim
    -0.26, 0.18, -0.68, // 25: Left Tail Puffed Flank

    // ── Right Side (X > 0, mirrored) ──
    0.30, 0.32, 0.55,   // 26: Right Cheek
    0.32, 0.68, 0.30,   // 27: Right Ear Outer Base
    0.08, 0.76, 0.35,   // 28: Right Ear Inner Base
    0.22, 1.02, 0.32,   // 29: Right Ear Hollow
    0.42, 1.05, 0.22,   // 30: Right Ear Outer Ridge
    0.38, 1.48, 0.25,   // 31: Right Ear Tip
    0.45, 0.15, 0.08,   // 32: Right Shoulder / Upper Flank
    0.22, -0.80, 0.30,  // 33: Right Front Paw
    0.62, -0.55, -0.18, // 34: Right Seated Haunch
    0.45, -0.80, -0.15, // 35: Right Haunch Ground Rim
    0.26, 0.18, -0.68,  // 36: Right Tail Puffed Flank
  ];

  const idx = [
    // ── SNOUT & HEAD ──
    0, 1, 15,   0, 26, 1,   0, 15, 2,   0, 2, 26,
    2, 15, 5,   2, 5, 26,   1, 3, 15,   1, 26, 3,

    // ── LEFT EAR (Cupped with Inner Hollow) ──
    3, 17, 15,  15, 17, 16, 17, 20, 18, 16, 17, 18,
    16, 18, 19, 19, 18, 20, 16, 19, 4,  19, 20, 4,
    15, 16, 21, 16, 4, 21,

    // ── RIGHT EAR (Cupped with Inner Hollow) ──
    3, 26, 28,  26, 27, 28, 28, 29, 31, 27, 29, 28,
    27, 30, 29, 30, 31, 29, 27, 4, 30,  30, 4, 31,
    26, 32, 27, 27, 32, 4,

    // ── FOREHEAD / NAPE CONNECTION ──
    3, 4, 17,   3, 28, 4,

    // ── CHEST PLEAT & FRONT PAWS ──
    5, 15, 6,   5, 6, 26,   6, 15, 22,  6, 33, 26,
    6, 22, 7,   6, 7, 33,   15, 21, 22, 26, 33, 32,
    21, 23, 22, 32, 33, 34, 22, 23, 24, 33, 35, 34,
    22, 24, 7,  33, 7, 35,

    // ── BACK SPINE & SEATED HAUNCHES ──
    4, 8, 21,   4, 32, 8,   8, 23, 21,  8, 32, 34,
    8, 9, 23,   8, 34, 9,   9, 10, 23,  9, 34, 10,
    10, 24, 23, 10, 34, 35, 10, 11, 24, 10, 35, 11,
    24, 11, 7,  35, 7, 11,

    // ── VOLUMINOUS FOLDED TAIL ──
    10, 25, 12, 10, 12, 36, 12, 25, 13, 12, 13, 36,
    13, 25, 14, 13, 14, 36, 14, 25, 10, 14, 10, 36,
  ];

  return buildGeometry(v, idx, scale * 0.85);
}

/* =========================================================================
   12. Usagi (Traditional Standing Rabbit)
   ========================================================================= */
export function createUsagiGeometry(scale = 1.0) {
  // Authentic 3D Origami Rabbit (Usagi)
  // Key origami facets:
  // - Tall folded rabbit ears with inner hollow crease
  // - Puffed faceted head with cheeks and forehead
  // - Front paws held close to the chest
  // - Rounded seated haunches and bottom paw pads
  // - Puffed origami cotton tail at the rump
  const v = [
    // ── Centerline (X = 0) ──
    0, 0.35, 0.68,  // 0: Snout Tip
    0, 0.55, 0.50,  // 1: Snout Bridge
    0, 0.22, 0.50,  // 2: Under-chin
    0, 0.85, 0.26,  // 3: Crown / Forehead between ears
    0, 0.72, 0.02,  // 4: Nape / Back of head
    0, 0.10, 0.42,  // 5: Chest Apex
    0, -0.32, 0.40, // 6: Belly Keel Center
    0, -0.85, 0.28, // 7: Ground Front (between feet)
    0, 0.35, -0.08, // 8: Upper Back Spine
    0, -0.05, -0.28,// 9: Mid Back Spine
    0, -0.40, -0.42,// 10: Rump / Tail Root
    0, -0.85, -0.28,// 11: Ground Rear
    0, -0.42, -0.68,// 12: Cotton Tail Puffy Tip
    0, -0.26, -0.52,// 13: Cotton Tail Top Fold
    0, -0.58, -0.52,// 14: Cotton Tail Bottom Fold

    // ── Left Side (X < 0) ──
    -0.28, 0.40, 0.42,  // 15: Left Cheek
    -0.06, 0.90, 0.22,  // 16: Left Ear Base Inner
    -0.24, 0.85, 0.15,  // 17: Left Ear Base Outer
    -0.16, 1.28, 0.22,  // 18: Left Ear Inner Crease Hollow
    -0.32, 1.30, 0.15,  // 19: Left Ear Outer Ridge
    -0.22, 1.75, 0.18,  // 20: Left Ear Tip
    -0.20, -0.15, 0.48, // 21: Left Front Paw
    -0.38, 0.12, 0.12,  // 22: Left Shoulder / Upper Flank
    -0.55, -0.48, -0.12,// 23: Left Haunch / Seated Thigh
    -0.24, -0.85, 0.22, // 24: Left Foot Front
    -0.42, -0.85, -0.18,// 25: Left Foot Rear
    -0.14, -0.42, -0.55,// 26: Left Tail Flank

    // ── Right Side (X > 0, mirrored) ──
    0.28, 0.40, 0.42,   // 27: Right Cheek
    0.06, 0.90, 0.22,   // 28: Right Ear Base Inner
    0.24, 0.85, 0.15,   // 29: Right Ear Base Outer
    0.16, 1.28, 0.22,   // 30: Right Ear Inner Crease Hollow
    0.32, 1.30, 0.15,   // 31: Right Ear Outer Ridge
    0.22, 1.75, 0.18,   // 32: Right Ear Tip
    0.20, -0.15, 0.48,  // 33: Right Front Paw
    0.38, 0.12, 0.12,   // 34: Right Shoulder / Upper Flank
    0.55, -0.48, -0.12, // 35: Right Haunch / Seated Thigh
    0.24, -0.85, 0.22,  // 36: Right Foot Front
    0.42, -0.85, -0.18, // 37: Right Foot Rear
    0.14, -0.42, -0.55, // 38: Right Tail Flank
  ];

  const idx = [
    // ── SNOUT & HEAD ──
    0, 1, 15,   0, 27, 1,   0, 15, 2,   0, 2, 27,
    1, 3, 15,   1, 27, 3,

    // ── LEFT EAR (Tall Fold with Inner Hollow) ──
    3, 16, 15,  15, 16, 17, 16, 20, 18, 16, 18, 17,
    17, 18, 19, 19, 18, 20, 17, 19, 4,  19, 20, 4,
    3, 4, 16,   15, 17, 22, 17, 4, 22,

    // ── RIGHT EAR (Tall Fold with Inner Hollow) ──
    3, 27, 28,  27, 29, 28, 28, 30, 32, 28, 29, 30,
    29, 31, 30, 31, 32, 30, 29, 4, 31,  31, 4, 32,
    3, 28, 4,   27, 34, 29, 29, 34, 4,

    // ── CHEST & FRONT PAWS ──
    2, 15, 5,   2, 5, 27,   5, 15, 21,  5, 33, 27,
    5, 21, 6,   5, 6, 33,   15, 22, 21, 27, 33, 34,
    21, 24, 6,  33, 6, 36,  6, 24, 7,   6, 7, 36,
    21, 23, 24, 33, 36, 35, 21, 22, 23, 33, 35, 34,

    // ── BODY SPINE & SEATED HAUNCHES ──
    4, 8, 22,   4, 34, 8,   8, 23, 22,  8, 34, 35,
    8, 9, 23,   8, 35, 9,   9, 10, 23,  9, 35, 10,
    10, 25, 23, 10, 35, 37, 10, 11, 25, 10, 37, 11,
    23, 25, 24, 35, 36, 37, 24, 11, 7,  36, 7, 11,
    24, 25, 11, 36, 11, 37,

    // ── COTTON TAIL ──
    10, 26, 13, 10, 13, 38, 13, 26, 12, 13, 12, 38,
    12, 26, 14, 12, 14, 38, 14, 26, 10, 14, 10, 38,
  ];

  return buildGeometry(v, idx, scale * 0.85);
}

/* =========================================================================
   13. Hakuchou (Traditional Swan)
   ========================================================================= */
export function createSwanGeometry(scale = 1.0) {
  // Authentic 3D Origami Swan (Hakuchou) folded from Kite Base
  // Key origami facets:
  // - Graceful S-curved multi-faceted neck with 3D paper thickness
  // - Downward reverse-fold head and sharp beak
  // - Boat keel hull / breast bottom
  // - Dihedral flared wings with mountain crease lines
  // - Layered upturned tail feathers
  const v = [
    // ── Body Centerline & Keel (X = 0) ──
    0, -0.58, 0.0,   // 0: Keel lowest belly point
    0, -0.32, 0.52,  // 1: Keel front (breast bottom)
    0, -0.35, -0.52, // 2: Keel rear (stern bottom)
    0, 0.22, -0.05,  // 3: Back saddle center
    0, 0.15, 0.62,   // 4: Breast notch (where neck emerges)
    0, 0.18, -0.62,  // 5: Tail notch (where tail emerges)

    // ── Body Flanks & Shoulders ──
    -0.42, -0.22, 0.0,  // 6: Left keel flank
    0.42, -0.22, 0.0,   // 7: Right keel flank
    -0.58, 0.18, 0.02,  // 8: Left shoulder / wing root
    0.58, 0.18, 0.02,   // 9: Right shoulder / wing root
    -0.38, -0.05, 0.46, // 10: Left chest facet
    0.38, -0.05, 0.46,  // 11: Right chest facet
    -0.38, -0.05, -0.46,// 12: Left rump facet
    0.38, -0.05, -0.46, // 13: Right rump facet

    // ── Flared Wings ──
    -1.85, 0.72, -0.15, // 14: Left wing tip
    -1.15, 0.45, 0.25,  // 15: Left wing leading fold
    -1.10, 0.35, -0.48, // 16: Left wing trailing edge
    -1.05, 0.52, -0.08, // 17: Left wing crease ridge
    1.85, 0.72, -0.15,  // 18: Right wing tip
    1.15, 0.45, 0.25,   // 19: Right wing leading fold
    1.10, 0.35, -0.48,  // 20: Right wing trailing edge
    1.05, 0.52, -0.08,  // 21: Right wing crease ridge

    // ── S-Curved 3D Neck (Reverse fold spine & sides) ──
    // Level 1: Neck Base
    0, 0.12, 0.75,      // 22: Neck base front spine
    -0.10, 0.18, 0.65,  // 23: Neck base left
    0.10, 0.18, 0.65,   // 24: Neck base right

    // Level 2: Lower S-arch (curving forward & up)
    0, 0.68, 1.05,      // 25: Neck lower front spine
    -0.08, 0.72, 0.95,  // 26: Neck lower left
    0.08, 0.72, 0.95,   // 27: Neck lower right

    // Level 3: Mid/Upper S-arch (curving back & up)
    0, 1.18, 0.75,      // 28: Neck mid front spine
    -0.07, 1.15, 0.65,  // 29: Neck mid left
    0.07, 1.15, 0.65,   // 30: Neck mid right

    // Level 4: Throat & Head
    0, 1.48, 0.62,      // 31: Crown peak
    -0.06, 1.32, 0.78,  // 32: Cheek left
    0.06, 1.32, 0.78,   // 33: Cheek right
    0, 1.05, 1.12,      // 34: Beak tip (sharp downward point)
    0, 1.22, 0.82,      // 35: Under-chin fold

    // ── Upturned Layered Tail ──
    0, 0.85, -1.05,     // 36: Tail upper tip
    0, 0.48, -0.85,     // 37: Tail mid spine fold
    -0.28, 0.42, -0.82, // 38: Tail left flap
    0.28, 0.42, -0.82,  // 39: Tail right flap
  ];

  const idx = [
    // ── BODY KEEL / BELLY ──
    0, 1, 6,    1, 10, 6,   0, 6, 2,    2, 6, 12,
    0, 7, 1,    1, 7, 11,   0, 2, 7,    2, 13, 7,

    // ── BODY CHEST, SADDLE & RUMP ──
    4, 10, 1,   4, 1, 11,   4, 8, 10,   4, 11, 9,
    3, 8, 4,    3, 4, 9,    5, 2, 12,   5, 13, 2,
    5, 12, 8,   5, 9, 13,   3, 5, 8,    3, 9, 5,
    8, 6, 10,   9, 11, 7,   8, 12, 6,   9, 7, 13,

    // ── FLARED WINGS ──
    8, 15, 17,  8, 4, 15,   8, 17, 16,  8, 16, 5,
    17, 15, 14, 17, 14, 16,
    9, 21, 19,  9, 19, 4,   9, 20, 21,  9, 5, 20,
    21, 18, 19, 21, 20, 18,

    // ── S-CURVED 3D NECK ──
    4, 23, 22,  4, 22, 24,  4, 26, 23,  4, 24, 27,
    22, 23, 25, 23, 26, 25, 22, 25, 24, 24, 25, 27,
    25, 26, 28, 26, 29, 28, 25, 28, 27, 27, 28, 30,
    4, 29, 26,  4, 27, 30,  28, 29, 35, 29, 32, 35,
    28, 35, 30, 30, 35, 33, 31, 32, 29, 31, 30, 33,

    // ── HEAD & DOWNWARD BEAK ──
    31, 34, 32, 31, 33, 34, 35, 32, 34, 35, 34, 33,

    // ── UPTURNED LAYERED TAIL ──
    5, 38, 37,  5, 37, 39,  37, 38, 36, 37, 36, 39,
    2, 36, 38,  2, 39, 36,  5, 12, 38,  5, 39, 13,
    2, 38, 12,  2, 13, 39,
  ];

  return buildGeometry(v, idx, scale * 0.85);
}

/* =========================================================================
   14. Chou (Traditional Origami Butterfly)
   ========================================================================= */
/**
 * Authentic Chou (Traditional Japanese Origami Butterfly)
 * Folded from preliminary / bird base with rich multi-tier accordion wing pleats,
 * alternating mountain/valley crease ridges, sculpted dorsal and ventral keel body,
 * and flared antennae tabs for authentic paper texture.
 */
export function createButterflyGeometry(scale = 1.0) {
  const v = [
    // ── Body Centerline & Keel (0..8) ──
    0, 0.75, 0.12,   // 0: Head tip (rostrum)
    0, 0.58, 0.20,   // 1: Dorsal head peak
    0, 0.32, 0.25,   // 2: Upper thorax dorsal peak
    0, 0.05, 0.20,   // 3: Mid thorax saddle
    0, -0.35, 0.14,  // 4: Dorsal abdomen mid
    0, -0.92, 0.04,  // 5: Abdomen tail tip
    0, 0.52, -0.05,  // 6: Chin / ventral head
    0, 0.12, -0.15,  // 7: Ventral thorax keel
    0, -0.42, -0.08, // 8: Ventral abdomen keel

    // ── Antennae & Eye Tabs (9..12) ──
    -0.25, 1.05, 0.24, // 9: Left antenna tip
    0.25, 1.05, 0.24,  // 10: Right antenna tip
    -0.16, 0.60, 0.16, // 11: Left eye tab
    0.16, 0.60, 0.16,  // 12: Right eye tab

    // ── Left Wing Root Hinges (13..15) ──
    -0.16, 0.38, 0.18, // 13: Left anterior wing root
    -0.18, 0.10, 0.16, // 14: Left mid wing root
    -0.14, -0.25, 0.10,// 15: Left posterior wing root

    // ── Right Wing Root Hinges (16..18) ──
    0.16, 0.38, 0.18,  // 16: Right anterior wing root
    0.18, 0.10, 0.16,  // 17: Right mid wing root
    0.14, -0.25, 0.10, // 18: Right posterior wing root

    // ── Left Forewing Pleated Creases (19..26) ──
    // Tier 0 (Leading edge):
    -0.95, 0.95, 0.30, // 19: Left forewing leading mid
    -1.95, 0.92, 0.48, // 20: Left forewing main apex tip
    // Tier 1 (Mountain fold ridge - elevated):
    -1.05, 0.68, 0.42, // 21: Left mountain ridge 1 mid
    -1.75, 0.62, 0.40, // 22: Left mountain ridge 1 outer edge
    // Tier 2 (Valley fold trough - recessed):
    -0.85, 0.42, 0.22, // 23: Left valley trough mid
    -1.48, 0.35, 0.25, // 24: Left valley trough outer edge
    // Tier 3 (Mountain fold ridge 2):
    -0.92, 0.18, 0.34, // 25: Left mountain ridge 2 mid
    -1.22, 0.08, 0.28, // 26: Left wing junction notch

    // ── Left Hindwing Pleated Creases (27..32) ──
    -0.85, -0.15, 0.28,// 27: Left hindwing mountain ridge 1
    -1.45, -0.28, 0.25,// 28: Left hindwing outer wing tip
    -0.70, -0.38, 0.16,// 29: Left hindwing valley trough
    -1.18, -0.55, 0.20,// 30: Left hindwing scallop lobe
    -0.82, -0.85, 0.16,// 31: Left hindwing swallowtail tip
    -0.42, -0.65, 0.08,// 32: Left hindwing inner margin fold

    // ── Right Forewing Pleated Creases (33..40) ──
    0.95, 0.95, 0.30,  // 33: Right forewing leading mid
    1.95, 0.92, 0.48,  // 34: Right forewing main apex tip
    1.05, 0.68, 0.42,  // 35: Right mountain ridge 1 mid
    1.75, 0.62, 0.40,  // 36: Right mountain ridge 1 outer edge
    0.85, 0.42, 0.22,  // 37: Right valley trough mid
    1.48, 0.35, 0.25,  // 38: Right valley trough outer edge
    0.92, 0.18, 0.34,  // 39: Right mountain ridge 2 mid
    1.22, 0.08, 0.28,  // 40: Right wing junction notch

    // ── Right Hindwing Pleated Creases (41..46) ──
    0.85, -0.15, 0.28, // 41: Right hindwing mountain ridge 1
    1.45, -0.28, 0.25, // 42: Right hindwing outer wing tip
    0.70, -0.38, 0.16, // 43: Right hindwing valley trough
    1.18, -0.55, 0.20, // 44: Right hindwing scallop lobe
    0.82, -0.85, 0.16, // 45: Right hindwing swallowtail tip
    0.42, -0.65, 0.08, // 46: Right hindwing inner margin fold
  ];

  const idx = [
    // ── Head, Eyes & Antennae ──
    0, 11, 1,    0, 1, 12,
    0, 6, 11,    0, 12, 6,
    1, 11, 9,    1, 10, 12,
    1, 13, 2,    1, 2, 16,

    // ── Dorsal Spine ──
    2, 13, 14,   2, 14, 3,
    2, 17, 16,   2, 3, 17,
    3, 14, 15,   3, 15, 4,
    3, 18, 17,   3, 4, 18,
    4, 15, 5,    4, 5, 18,

    // ── Ventral Keel & Flanks ──
    6, 7, 11,    6, 12, 7,
    7, 8, 14,    7, 17, 8,
    8, 5, 15,    8, 18, 5,

    // ── Left Forewing Pleats (Tier 0..3) ──
    13, 19, 21,
    19, 20, 21,
    20, 22, 21,

    13, 21, 23,
    21, 22, 23,
    22, 24, 23,

    13, 23, 14,
    14, 23, 25,
    23, 24, 25,
    24, 26, 25,

    // ── Left Hindwing Pleats ──
    14, 26, 27,
    26, 28, 27,

    14, 27, 29,
    27, 28, 30,
    27, 30, 29,

    14, 29, 15,
    15, 29, 31,
    29, 30, 31,

    15, 31, 32,
    15, 32, 5,

    // ── Right Forewing Pleats (Mirrored) ──
    16, 35, 33,
    33, 35, 34,
    34, 35, 36,

    16, 37, 35,
    35, 37, 36,
    36, 37, 38,

    16, 17, 37,
    17, 39, 37,
    37, 39, 38,
    38, 39, 40,

    // ── Right Hindwing Pleats (Mirrored) ──
    17, 41, 40,
    40, 41, 42,

    17, 43, 41,
    41, 44, 42,
    41, 43, 44,

    17, 18, 43,
    18, 45, 43,
    43, 45, 44,

    18, 46, 45,
    18, 5, 46,
  ];

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   15. Kingyo (Traditional Japanese Goldfish)
   ========================================================================= */
/**
 * Authentic Kingyo (Traditional Japanese Origami Goldfish)
 * Folded from fish base: puffed diamond body, upright dorsal fin, lateral pectoral fins,
 * narrow peduncle waist, and an expansive undulating multi-faceted fan tail.
 */
export function createGoldfishGeometry(scale = 1.0) {
  const v = [
    // ── Head & Centerline (0..10) ──
    0, 0.02, 1.25,     // 0: Snout tip
    0, 0.32, 0.95,     // 1: Forehead / dorsal snout
    0, -0.22, 0.95,    // 2: Chin / ventral snout
    0, 0.52, 0.35,     // 3: Dorsal ridge front (start of dorsal fin)
    0, 0.92, -0.05,    // 4: Dorsal fin apex (standing upright)
    0, 0.42, -0.25,    // 5: Dorsal fin trailing edge notch
    0, -0.48, 0.30,    // 6: Belly keel apex (deepest point)
    0, -0.28, -0.22,   // 7: Belly rear keel
    0, 0.16, -0.45,    // 8: Tail peduncle top (waist)
    0, -0.12, -0.45,   // 9: Tail peduncle bottom (waist)
    0, 0.05, -0.92,    // 10: Tail cleft center notch

    // ── Cheeks, Flanks & Fins (11..18) ──
    -0.32, 0.10, 0.82, // 11: Left cheek / eye fold
    0.32, 0.10, 0.82,  // 12: Right cheek / eye fold
    -0.65, 0.05, 0.22, // 13: Left flank apex (puffed diamond)
    0.65, 0.05, 0.22,  // 14: Right flank apex
    -0.78, -0.28, 0.42,// 15: Left pectoral fin tip
    0.78, -0.28, 0.42, // 16: Right pectoral fin tip
    -0.16, 0.02, -0.45,// 17: Left peduncle side
    0.16, 0.02, -0.45, // 18: Right peduncle side

    // ── Undulating Fan Tail Left (19..23) ──
    -0.95, 0.72, -1.35, // 19: Left upper tail lobe tip
    -0.55, 0.42, -1.15, // 20: Left upper valley fold
    -1.42, 0.18, -1.48, // 21: Left mid tail mountain ridge tip
    -1.25, -0.22, -1.38,// 22: Left mid tail valley trough
    -0.88, -0.65, -1.25,// 23: Left lower tail lobe tip

    // ── Undulating Fan Tail Right (24..28) ──
    0.95, 0.72, -1.35,  // 24: Right upper tail lobe tip
    0.55, 0.42, -1.15,  // 25: Right upper valley fold
    1.42, 0.18, -1.48,  // 26: Right mid tail mountain ridge tip
    1.25, -0.22, -1.38, // 27: Right mid tail valley trough
    0.88, -0.65, -1.25, // 28: Right lower tail lobe tip
  ];

  const idx = [
    // ── Snout & Cheeks ──
    0, 1, 11,   0, 12, 1,
    0, 11, 2,   0, 2, 12,
    1, 3, 11,   1, 12, 3,
    2, 11, 6,   2, 6, 12,

    // ── Upright Dorsal Fin ──
    3, 4, 13,   3, 14, 4,
    4, 5, 13,   4, 14, 5,
    5, 8, 13,   5, 14, 8,

    // ── Diamond Body & Pectoral Fins ──
    3, 13, 11,  3, 12, 14,
    11, 13, 15, 12, 16, 14,
    11, 15, 6,  12, 6, 16,
    13, 7, 15,  14, 16, 7,
    6, 7, 15,   6, 16, 7,

    // ── Rear Flanks & Peduncle Waist ──
    13, 17, 7,  14, 7, 18,
    8, 17, 13,  8, 14, 18,
    17, 9, 7,   18, 7, 9,

    // ── Undulating Left Fan Tail (multi-faceted pleats) ──
    8, 20, 10,  8, 19, 20,
    8, 17, 19,  17, 21, 19,
    17, 22, 21,
    17, 9, 22,  9, 23, 22,
    9, 10, 23,

    // ── Undulating Right Fan Tail (multi-faceted pleats) ──
    8, 10, 25,  8, 25, 24,
    8, 24, 18,  18, 24, 26,
    18, 26, 27,
    18, 27, 9,  9, 27, 28,
    9, 28, 10,
  ];

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   16. Semi (Traditional Cicada)
   ========================================================================= */
/**
 * Authentic Semi (Traditional Japanese Origami Cicada)
 * Broad triangular head, folded compound eye tabs, stepped pronotum collar,
 * overlapping folded elytra wings with longitudinal mountain creases,
 * exposed tapered abdomen tip, and folded 3D ventral body.
 */
export function createCicadaGeometry(scale = 1.0) {
  const v = [
    // ── Head & Dorsal Centerline (0..5) ──
    0, 1.08, 0.12,     // 0: Head front center (rostrum)
    0, 0.88, 0.22,     // 1: Head dorsal center
    0, 0.60, 0.28,     // 2: Pronotum center ridge (collar)
    0, 0.32, 0.26,     // 3: Mesothorax / scutellum apex
    0, -0.35, 0.14,    // 4: Dorsal abdomen mid
    0, -1.05, 0.02,    // 5: Dorsal abdomen tail tip

    // ── Ventral Centerline (6..9) ──
    0, 0.82, -0.06,    // 6: Ventral chin
    0, 0.25, -0.18,    // 7: Ventral chest keel
    0, -0.40, -0.14,   // 8: Ventral belly keel
    0, -0.98, -0.04,   // 9: Ventral abdomen tail tip

    // ── Compound Eye Tabs (10..15) ──
    -0.68, 0.92, 0.10, // 10: Left eye tab apex (protruding laterally)
    0.68, 0.92, 0.10,  // 11: Right eye tab apex
    -0.45, 0.75, 0.16, // 12: Left eye posterior fold
    0.45, 0.75, 0.16,  // 13: Right eye posterior fold
    -0.40, 0.80, -0.02,// 14: Left eye underside
    0.40, 0.80, -0.02, // 15: Right eye underside

    // ── Pronotum & Wing Hinges (16..19) ──
    -0.56, 0.55, 0.18, // 16: Left pronotum lateral corner
    0.56, 0.55, 0.18,  // 17: Right pronotum lateral corner
    -0.42, 0.28, 0.22, // 18: Left wing hinge/shoulder
    0.42, 0.28, 0.22,  // 19: Right wing hinge/shoulder

    // ── Left Wing / Elytra (20..23) ──
    -0.78, -0.32, 0.18, // 20: Left wing outer margin mid
    -0.42, -0.38, 0.22, // 21: Left wing longitudinal mountain ridge
    -0.70, -1.28, 0.10, // 22: Left wing tip (sharp posterior apex)
    -0.18, -0.75, 0.12, // 23: Left wing inner margin

    // ── Right Wing / Elytra (24..27) ──
    0.78, -0.32, 0.18,  // 24: Right wing outer margin mid
    0.42, -0.38, 0.22,  // 25: Right wing longitudinal mountain ridge
    0.70, -1.28, 0.10,  // 26: Right wing tip
    0.18, -0.75, 0.12,  // 27: Right wing inner margin

    // ── Ventral Flanks & Abdomen Sides (28..31) ──
    -0.35, 0.05, -0.12, // 28: Left ventral flank
    0.35, 0.05, -0.12,  // 29: Right ventral flank
    -0.25, -0.55, -0.06,// 30: Left abdomen flank
    0.25, -0.55, -0.06, // 31: Right abdomen flank
  ];

  const idx = [
    // ── Head & Folded Eye Tabs ──
    0, 10, 1,    0, 1, 11,
    1, 10, 12,   1, 13, 11,
    0, 6, 14,    0, 15, 6,
    10, 14, 12,  11, 13, 15,
    14, 6, 12,   15, 13, 6,

    // ── Stepped Pronotum Collar & Thorax ──
    1, 12, 2,    1, 2, 13,
    2, 12, 16,   2, 17, 13,
    2, 16, 3,    2, 3, 17,
    3, 16, 18,   3, 19, 17,

    // ── Left Wing / Elytra (with longitudinal ridge 21) ──
    3, 18, 21,   18, 20, 21,
    20, 22, 21,  21, 22, 23,
    3, 21, 4,    4, 21, 23,

    // ── Right Wing / Elytra (with longitudinal ridge 25) ──
    3, 25, 19,   19, 25, 24,
    24, 25, 26,  25, 27, 26,
    3, 4, 25,    4, 27, 25,

    // ── Dorsal Exposed Abdomen Tip ──
    4, 23, 5,    4, 5, 27,

    // ── Ventral Chest & Belly Keel ──
    6, 7, 28,    6, 29, 7,
    6, 28, 12,   6, 13, 29,
    12, 28, 16,  13, 17, 29,
    16, 28, 18,  17, 19, 29,
    7, 8, 28,    7, 29, 8,
    8, 30, 28,   8, 29, 31,
    8, 9, 30,    8, 31, 9,
    30, 9, 5,    31, 5, 9,

    // ── Ventral Wing Undersides ──
    18, 28, 20,  19, 24, 29,
    28, 30, 20,  29, 24, 31,
    30, 5, 23,   31, 27, 5,
  ];

  return buildGeometry(v, idx, scale);
}

/* =========================================================================
   17. KusudamaStar (Modular 6-Spike Floral Star)
   ========================================================================= */
/**
 * Authentic Kusudama Star (Modular 6-Spike Floral Star)
 * 6 pointed modular pyramids with deep concave fluted valley folds and central core.
 * Closed 2-manifold polyhedral mesh with 26 vertices and 48 triangles.
 */
export function createKusudamaGeometry(scale = 1.0) {
  const p = 1.45;    // Outer pyramidal spike apex
  const c = 0.58;    // Modular corner petal flare
  const v_in = 0.28; // Deep concave fluted valley fold

  const v = [
    // ── 6 Modular Pyramidal Spikes (0..5) ──
    0, p, 0,    // 0: +Y spike
    0, -p, 0,   // 1: -Y spike
    p, 0, 0,    // 2: +X spike
    -p, 0, 0,   // 3: -X spike
    0, 0, p,    // 4: +Z spike
    0, 0, -p,   // 5: -Z spike

    // ── 8 Outer Diagonal Corner Petal Lobes (6..13) ──
    c, c, c,     // 6:  (+X, +Y, +Z)
    -c, c, c,    // 7:  (-X, +Y, +Z)
    -c, -c, c,   // 8:  (-X, -Y, +Z)
    c, -c, c,    // 9:  (+X, -Y, +Z)
    c, c, -c,    // 10: (+X, +Y, -Z)
    -c, c, -c,   // 11: (-X, +Y, -Z)
    -c, -c, -c,  // 12: (-X, -Y, -Z)
    c, -c, -c,   // 13: (+X, -Y, -Z)

    // ── 12 Concave Fluted Valley Nodes (14..25) ──
    // YZ Plane
    0, v_in, v_in,    // 14: (+Y, +Z valley)
    0, -v_in, v_in,   // 15: (-Y, +Z valley)
    0, -v_in, -v_in,  // 16: (-Y, -Z valley)
    0, v_in, -v_in,   // 17: (+Y, -Z valley)
    // ZX Plane
    v_in, 0, v_in,    // 18: (+X, +Z valley)
    -v_in, 0, v_in,   // 19: (-X, +Z valley)
    -v_in, 0, -v_in,  // 20: (-X, -Z valley)
    v_in, 0, -v_in,   // 21: (+X, -Z valley)
    // XY Plane
    v_in, v_in, 0,    // 22: (+X, +Y valley)
    -v_in, v_in, 0,   // 23: (-X, +Y valley)
    -v_in, -v_in, 0,  // 24: (-X, -Y valley)
    v_in, -v_in, 0,   // 25: (+X, -Y valley)
  ];

  const idx = [
    // ── +Y Spike (0) ──
    0, 6, 14,   0, 14, 7,
    0, 7, 23,   0, 23, 11,
    0, 11, 17,  0, 17, 10,
    0, 10, 22,  0, 22, 6,

    // ── -Y Spike (1) ──
    1, 9, 25,   1, 25, 13,
    1, 13, 16,  1, 16, 12,
    1, 12, 24,  1, 24, 8,
    1, 8, 15,   1, 15, 9,

    // ── +X Spike (2) ──
    2, 6, 22,   2, 22, 10,
    2, 10, 21,  2, 21, 13,
    2, 13, 25,  2, 25, 9,
    2, 9, 18,   2, 18, 6,

    // ── -X Spike (3) ──
    3, 7, 19,   3, 19, 8,
    3, 8, 24,   3, 24, 12,
    3, 12, 20,  3, 20, 11,
    3, 11, 23,  3, 23, 7,

    // ── +Z Spike (4) ──
    4, 6, 18,   4, 18, 9,
    4, 9, 15,   4, 15, 8,
    4, 8, 19,   4, 19, 7,
    4, 7, 14,   4, 14, 6,

    // ── -Z Spike (5) ──
    5, 10, 17,  5, 17, 11,
    5, 11, 20,  5, 20, 12,
    5, 12, 16,  5, 16, 13,
    5, 13, 21,  5, 21, 10,
  ];

  return buildGeometry(v, idx, scale * 0.9);
}

/* =========================================================================
   18. Kai (Traditional Clam Shell)
   ========================================================================= */
/**
 * Authentic Kai (Traditional Japanese Origami Clam Shell)
 * Fluted accordion radial ridges radiating from hinge, scalloped zigzag rim,
 * convex bivalve 3D arch, and folded auricle hinge ears.
 */
export function createClamGeometry(scale = 1.0) {
  const v: number[] = [];
  const idx: number[] = [];

  const yHinge = -0.72;

  // 0: Dorsal hinge apex
  v.push(0, yHinge, 0.08);
  // 1: Ventral hinge apex
  v.push(0, yHinge, -0.08);
  // 2: Left hinge ear (auricle)
  v.push(-0.35, yHinge + 0.06, 0);
  // 3: Right hinge ear (auricle)
  v.push(0.35, yHinge + 0.06, 0);

  const numRays = 7;
  const deltaAngle = 0.36; // ~20.6 degrees per ray

  // 4..10: Dorsal Mid-tier vertices (indices 4..10)
  for (let k = 0; k < numRays; k++) {
    const angle = (k - 3) * deltaAngle;
    const isMountain = k % 2 === 0;
    const r = isMountain ? 0.78 : 0.72;
    const z = isMountain ? 0.38 : 0.16;
    const x = Math.sin(angle) * r;
    const y = yHinge + Math.cos(angle) * r;
    v.push(x, y, z);
  }

  // 11..17: Dorsal Rim vertices (indices 11..17)
  for (let k = 0; k < numRays; k++) {
    const angle = (k - 3) * deltaAngle;
    const isMountain = k % 2 === 0;
    const rBase = 1.46 - Math.abs(k - 3) * 0.04;
    const r = isMountain ? rBase : rBase - 0.08;
    const z = isMountain ? 0.24 : 0.08;
    const x = Math.sin(angle) * r;
    const y = yHinge + Math.cos(angle) * r;
    v.push(x, y, z);
  }

  // 18..24: Ventral Mid-tier vertices (indices 18..24)
  for (let k = 0; k < numRays; k++) {
    const angle = (k - 3) * deltaAngle;
    const isMountain = k % 2 === 0;
    const r = isMountain ? 0.78 : 0.72;
    const z = isMountain ? -0.38 : -0.16;
    const x = Math.sin(angle) * r;
    const y = yHinge + Math.cos(angle) * r;
    v.push(x, y, z);
  }

  // 25..31: Ventral Rim vertices (indices 25..31)
  for (let k = 0; k < numRays; k++) {
    const angle = (k - 3) * deltaAngle;
    const isMountain = k % 2 === 0;
    const rBase = 1.46 - Math.abs(k - 3) * 0.04;
    const r = isMountain ? rBase : rBase - 0.08;
    const z = isMountain ? -0.24 : -0.08;
    const x = Math.sin(angle) * r;
    const y = yHinge + Math.cos(angle) * r;
    v.push(x, y, z);
  }

  // ── Dorsal Shell Facets ──
  // Hinge to Mid-tier
  for (let k = 0; k < numRays - 1; k++) {
    idx.push(0, 4 + k, 4 + k + 1);
  }
  // Mid-tier to Rim
  for (let k = 0; k < numRays - 1; k++) {
    const m1 = 4 + k;
    const m2 = 4 + k + 1;
    const r1 = 11 + k;
    const r2 = 11 + k + 1;
    idx.push(m1, r1, r2);
    idx.push(m1, r2, m2);
  }
  // Dorsal Hinge Ears
  idx.push(0, 2, 4);
  idx.push(0, 10, 3);

  // ── Ventral Shell Facets ──
  // Hinge to Mid-tier
  for (let k = 0; k < numRays - 1; k++) {
    idx.push(1, 18 + k + 1, 18 + k);
  }
  // Mid-tier to Rim
  for (let k = 0; k < numRays - 1; k++) {
    const m1 = 18 + k;
    const m2 = 18 + k + 1;
    const r1 = 25 + k;
    const r2 = 25 + k + 1;
    idx.push(m1, r2, r1);
    idx.push(m1, m2, r2);
  }
  // Ventral Hinge Ears
  idx.push(1, 18, 2);
  idx.push(1, 3, 24);

  // ── Scalloped Mouth / Lip (Dorsal Rim to Ventral Rim) ──
  for (let k = 0; k < numRays - 1; k++) {
    const dr1 = 11 + k;
    const dr2 = 11 + k + 1;
    const vr1 = 25 + k;
    const vr2 = 25 + k + 1;
    idx.push(dr1, vr1, vr2);
    idx.push(dr1, vr2, dr2);
  }

  // Lateral Edges (Outer Flank Closure)
  idx.push(2, 4, 11);
  idx.push(2, 11, 25);
  idx.push(2, 25, 18);
  idx.push(3, 17, 10);
  idx.push(3, 31, 17);
  idx.push(3, 24, 31);

  return buildGeometry(v, idx, scale);
}

/* =========================================================================
   19. Tsubame (Traditional Swallow)
   ========================================================================= */
export function createSwallowGeometry(scale = 1.0) {
  // Authentic 3D Origami Swallow (Tsubame)
  // Key origami facets:
  // - High-aspect-ratio swept aerodynamic wings with leading and trailing crease facets
  // - Deep forked scissor tail (Hasami-o) with authentic 3D paper facets
  // - Streamlined beak, head, and chest keel
  const v = [
    // ── Centerline (X = 0) ──
    0, 0.12, 1.42,  // 0: Beak tip (sharp forward point)
    0, 0.30, 1.05,  // 1: Crown peak
    0, -0.02, 1.05, // 2: Throat / chin fold
    0, 0.25, 0.75,  // 3: Collar notch
    0, -0.25, 0.65, // 4: Breast keel front
    0, -0.30, 0.10, // 5: Belly keel center
    0, -0.15, -0.50,// 6: Keel rear
    0, 0.22, 0.10,  // 7: Back saddle center
    0, 0.08, -0.55, // 8: Rump notch / tail root top
    0, -0.04, -1.15,// 9: Tail fork cleft (deep central V notch)

    // ── Left Side (X < 0) ──
    -0.16, 0.15, 1.02, // 10: Left cheek
    -0.28, -0.08, 0.58,// 11: Left chest facet
    -0.35, -0.05, 0.10,// 12: Left body flank
    -0.26, -0.05, -0.45,// 13: Left rump facet
    -0.48, 0.16, 0.22, // 14: Left shoulder / wing root
    -0.85, 0.28, 0.15, // 15: Left wing knuckle fold
    -1.55, 0.38, -0.12,// 16: Left wing elbow fold
    -2.65, 0.46, -0.65,// 17: Left wing tip (swept needle blade)
    -1.45, 0.15, -0.42,// 18: Left wing trailing mid
    -0.68, 0.08, -0.22,// 19: Left wing trailing root
    -1.50, 0.30, -0.28,// 20: Left wing dorsal crease ridge
    -0.62, -0.12, -1.95,// 21: Left tail fork tip (outer scissor prong)
    -0.42, 0.0, -1.25, // 22: Left tail outer edge mid
    -0.18, -0.06, -1.45,// 23: Left tail inner cleft edge

    // ── Right Side (X > 0, mirrored) ──
    0.16, 0.15, 1.02,  // 24: Right cheek
    0.28, -0.08, 0.58, // 25: Right chest facet
    0.35, -0.05, 0.10, // 26: Right body flank
    0.26, -0.05, -0.45,// 27: Right rump facet
    0.48, 0.16, 0.22,  // 28: Right shoulder / wing root
    0.85, 0.28, 0.15,  // 29: Right wing knuckle fold
    1.55, 0.38, -0.12, // 30: Right wing elbow fold
    2.65, 0.46, -0.65, // 31: Right wing tip
    1.45, 0.15, -0.42, // 32: Right wing trailing mid
    0.68, 0.08, -0.22, // 33: Right wing trailing root
    1.50, 0.30, -0.28, // 34: Right wing dorsal crease ridge
    0.62, -0.12, -1.95,// 35: Right tail fork tip
    0.42, 0.0, -1.25,  // 36: Right tail outer edge mid
    0.18, -0.06, -1.45,// 37: Right tail inner cleft edge
  ];

  const idx = [
    // ── HEAD & BEAK ──
    0, 1, 10,   0, 24, 1,   0, 10, 2,   0, 2, 24,
    1, 3, 10,   1, 24, 3,   2, 10, 4,   2, 4, 24,
    4, 10, 11,  4, 25, 24,

    // ── BODY KEEL & SADDLE ──
    4, 11, 5,   4, 5, 25,   5, 11, 12,  5, 26, 25,
    5, 12, 6,   5, 6, 26,   6, 12, 13,  6, 27, 26,
    3, 7, 14,   3, 28, 7,   3, 14, 10,  3, 24, 28,
    10, 14, 11, 24, 25, 28, 14, 12, 11, 28, 25, 26,
    7, 12, 14,  7, 28, 26,  7, 8, 12,   7, 26, 8,
    8, 13, 12,  8, 26, 27,  8, 6, 13,   8, 27, 6,

    // ── SWEPT AERODYNAMIC WINGS ──
    14, 15, 20, 14, 20, 19, 15, 16, 20, 16, 17, 20,
    20, 17, 18, 20, 18, 19, 19, 12, 14,
    28, 34, 29, 28, 33, 34, 29, 34, 30, 30, 34, 31,
    34, 32, 31, 34, 33, 32, 33, 28, 26,

    // ── FORKED SCISSOR TAIL (Dorsal & Ventral) ──
    8, 21, 22,  8, 23, 21,  8, 9, 23,
    8, 36, 35,  8, 35, 37,  8, 37, 9,
    6, 22, 21,  6, 21, 23,  6, 23, 9,
    6, 35, 36,  6, 37, 35,  6, 9, 37,
    8, 22, 13,  6, 13, 22,
    8, 27, 36,  6, 36, 27,
  ];

  return buildGeometry(v, idx, scale * 0.70);
}

/* =========================================================================
   20. Masu (Traditional Square Sake Box)
   Double-folded thick rims, inner floor, interlocking triangular side flaps.
   ========================================================================= */
export function createMasuGeometry(scale = 1.0) {
  const s = 0.88;       // Outer half-width
  const h = 0.52;       // Half-height
  const d = 0.16;       // Double-fold wall thickness
  const si = s - d;     // Inner half-width (0.72)
  const hi = -h + d;    // Inner floor height (-0.36)

  const v = [
    // ── Outer Bottom (0..8) ──
    -s, -h, -s, // 0: NW bottom corner
     s, -h, -s, // 1: NE bottom corner
     s, -h,  s, // 2: SE bottom corner
    -s, -h,  s, // 3: SW bottom corner
     0, -h, -s, // 4: N bottom mid
     s, -h,  0, // 5: E bottom mid
     0, -h,  s, // 6: S bottom mid
    -s, -h,  0, // 7: W bottom mid
     0, -h + 0.04, 0, // 8: Bottom center crease apex

    // ── Outer Top Rim (9..16) ──
    -s,  h, -s, // 9: NW top outer corner
     s,  h, -s, // 10: NE top outer corner
     s,  h,  s, // 11: SE top outer corner
    -s,  h,  s, // 12: SW top outer corner
     0,  h, -s, // 13: N top outer mid
     s,  h,  0, // 14: E top outer mid
     0,  h,  s, // 15: S top outer mid
    -s,  h,  0, // 16: W top outer mid

    // ── Outer Corner Squash Pleats (Mid-height 45° pleat folds) (17..20) ──
    -s - 0.06, 0.0, -s - 0.06, // 17: NW corner squash ridge
     s + 0.06, 0.0, -s - 0.06, // 18: NE corner squash ridge
     s + 0.06, 0.0,  s + 0.06, // 19: SE corner squash ridge
    -s - 0.06, 0.0,  s + 0.06, // 20: SW corner squash ridge

    // ── Inner Top Rim (21..24) ──
    -si, h, -si, // 21: NW top inner corner
     si, h, -si, // 22: NE top inner corner
     si, h,  si, // 23: SE top inner corner
    -si, h,  si, // 24: SW top inner corner

    // ── Inner Floor (25..28) ──
    -si, hi, -si, // 25: NW floor inner corner
     si, hi, -si, // 26: NE floor inner corner
     si, hi,  si, // 27: SE floor inner corner
    -si, hi,  si, // 28: SW floor inner corner

    // ── Interlocking Triangular Side Flaps (29) ──
    0, hi + 0.04, 0, // 29: Center interlocking flap tab apex
  ];

  const idx = [
    // ── Outer Bottom Crease Facets ──
    8, 0, 4,   8, 4, 1,
    8, 1, 5,   8, 5, 2,
    8, 2, 6,   8, 6, 3,
    8, 3, 7,   8, 7, 0,

    // ── Outer Walls with Corner Squash Pleats ──
    // North Wall (-Z)
    4, 13, 10,  4, 10, 1,
    0, 9, 13,   0, 13, 4,
    // East Wall (+X)
    5, 14, 11,  5, 11, 2,
    1, 10, 14,  1, 14, 5,
    // South Wall (+Z)
    6, 15, 12,  6, 12, 3,
    2, 11, 15,  2, 15, 6,
    // West Wall (-X)
    7, 16, 9,   7, 9, 0,
    3, 12, 16,  3, 16, 7,

    // ── 4 Corner Squash Fold Ridges ──
    0, 17, 9,
    1, 10, 18,
    2, 19, 11,
    3, 12, 20,

    // ── Double-Folded Top Rim Bevels ──
    9, 21, 22,  9, 22, 10,
    10, 22, 23, 10, 23, 11,
    11, 23, 24, 11, 24, 12,
    12, 24, 21, 12, 21, 9,

    // ── Inner Walls ──
    21, 25, 26, 21, 26, 22,
    22, 26, 27, 22, 27, 23,
    23, 27, 28, 23, 28, 24,
    24, 28, 25, 24, 25, 21,

    // ── Interlocking Triangular Side Flaps on Inner Floor ──
    27, 29, 28,
    25, 29, 26,
    26, 29, 27,
    28, 29, 25,
  ];

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   21. Sanbo (Traditional Ceremonial Offering Box)
   Wide flared side wings, folded lip, and square pedestal tray.
   ========================================================================= */
export function createSanboGeometry(scale = 1.0) {
  const wb = 0.68;
  const hb = -0.72;
  const wn = 0.45;
  const hn = -0.05;
  const wt = 0.70;
  const ht = 0.28;
  const wi = 0.54;
  const hi = 0.05;

  const v = [
    // ── Square Pedestal Base Foot (0..8) ──
    -wb, hb, -wb, // 0: NW foot
     wb, hb, -wb, // 1: NE foot
     wb, hb,  wb, // 2: SE foot
    -wb, hb,  wb, // 3: SW foot
     0,  hb, -wb, // 4: N foot mid
     wb, hb,  0,  // 5: E foot mid
     0,  hb,  wb, // 6: S foot mid
    -wb, hb,  0,  // 7: W foot mid
     0,  hb + 0.16, 0, // 8: Hollow underside apex

    // ── Pedestal Ritual Inverted Arches (9..12) ──
     0, -0.40, -0.36, // 9: N ritual indent
     0.36, -0.40,  0, // 10: E ritual indent
     0, -0.40,  0.36, // 11: S ritual indent
    -0.36, -0.40,  0, // 12: W ritual indent

    // ── Pedestal Neck / Waist (13..16) ──
    -wn, hn, -wn, // 13: NW neck
     wn, hn, -wn, // 14: NE neck
     wn, hn,  wn, // 15: SE neck
    -wn, hn,  wn, // 16: SW neck

    // ── Upper Tray Outer Rim (17..22) ──
    -wt, ht, -wt, // 17: NW tray corner
     wt, ht, -wt, // 18: NE tray corner
     wt, ht,  wt, // 19: SE tray corner
    -wt, ht,  wt, // 20: SW tray corner
     0,  ht, -wt, // 21: N tray mid
     0,  ht,  wt, // 22: S tray mid

    // ── Flared Side Wings (23..26) ──
     1.48, 0.42, 0,  // 23: Starboard wing tip
    -1.48, 0.42, 0,  // 24: Port wing tip
     1.15, 0.05, 0,  // 25: Starboard lower wing crease
    -1.15, 0.05, 0,  // 26: Port lower wing crease

    // ── Upper Tray Inner Rim (27..30) ──
    -wi, ht, -wi, // 27: NW inner rim
     wi, ht, -wi, // 28: NE inner rim
     wi, ht,  wi, // 29: SE inner rim
    -wi, ht,  wi, // 30: SW inner rim

    // ── Upper Tray Inner Floor (31..35) ──
    -wi, hi, -wi, // 31: NW floor
     wi, hi, -wi, // 32: NE floor
     wi, hi,  wi, // 33: SE floor
    -wi, hi,  wi, // 34: SW floor
     0,  hi + 0.03, 0, // 35: Floor center fold apex
  ];

  const idx = [
    // ── Pedestal Underside Hollow ──
    8, 0, 4,   8, 4, 1,
    8, 1, 5,   8, 5, 2,
    8, 2, 6,   8, 6, 3,
    8, 3, 7,   8, 7, 0,

    // ── Pedestal Ritual Inset Facets ──
    // North Pedestal Side
    0, 13, 9,   13, 14, 9,   14, 1, 9,    1, 4, 9,    4, 0, 9,
    // East Pedestal Side
    1, 14, 10,  14, 15, 10,  15, 2, 10,   2, 5, 10,   5, 1, 10,
    // South Pedestal Side
    2, 15, 11,  15, 16, 11,  16, 3, 11,   3, 6, 11,   6, 2, 11,
    // West Pedestal Side
    3, 16, 12,  16, 13, 12,  13, 0, 12,   0, 7, 12,   7, 3, 12,

    // ── Pedestal Neck to Upper Tray ──
    13, 17, 21,  13, 21, 14,  14, 21, 18,
    14, 18, 15,  15, 18, 19,
    16, 15, 22,  15, 19, 22,  16, 22, 20,
    13, 16, 20,  13, 20, 17,

    // ── Flared Side Wings (Starboard & Port) ──
    // Starboard Wing (+X)
    18, 23, 19, // Upper wing triangular fan
    18, 25, 23, // Fore wing bevel
    23, 25, 19, // Aft wing bevel
    15, 19, 25, 14, 25, 18, // Wing root attachment to neck

    // Port Wing (-X)
    20, 24, 17, // Upper wing triangular fan
    17, 24, 26, // Fore wing bevel
    24, 20, 26, // Aft wing bevel
    13, 26, 17, 16, 20, 26, // Wing root attachment to neck

    // ── Tray Folded Lip / Rims ──
    17, 27, 28,  17, 28, 18, // North rim
    18, 28, 29,  18, 29, 19, // East rim
    19, 29, 30,  19, 30, 20, // South rim
    20, 30, 27,  20, 27, 17, // West rim

    // ── Interior Tray Basin Walls ──
    27, 31, 32,  27, 32, 28, // North inner wall
    28, 32, 33,  28, 33, 29, // East inner wall
    29, 33, 34,  29, 34, 30, // South inner wall
    30, 34, 31,  30, 31, 27, // West inner wall

    // ── Interior Offering Floor ──
    35, 31, 32,
    35, 32, 33,
    35, 33, 34,
    35, 34, 31,
  ];

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   22. Wreath (Traditional 8-Piece Modular Origami Wreath)
   8-unit modular origami wreath with interlocking faceted diamond units
   and central circular opening.
   ========================================================================= */
export function createWreathGeometry(scale = 1.0) {
  const n = 8;
  const R_out = 1.42;  // Outer pointed diamond tips
  const R_mid = 0.98;  // Mid-radius for mountain ridge & interlocking tuck
  const R_in = 0.54;   // Inner octagonal opening rim
  const zRidge = 0.22; // Front raised mountain fold height
  const zTuck = 0.05;  // Interlocking pocket step fold height
  const zBack = -0.18; // Back fold depth

  const v: number[] = [];
  const idx: number[] = [];

  // Group 1 (0..7): Outer Diamond Tips at angle i * 45°
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    v.push(Math.cos(a) * R_out, Math.sin(a) * R_out, 0);
  }

  // Group 2 (8..15): Front Mountain Crease Ridges at angle (i + 0.5) * 45°
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / n;
    v.push(Math.cos(a) * R_mid, Math.sin(a) * R_mid, zRidge);
  }

  // Group 3 (16..23): Interlocking Pocket Seam Tucks at angle i * 45°
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    v.push(Math.cos(a) * R_mid, Math.sin(a) * R_mid, zTuck);
  }

  // Group 4 (24..31): Inner Octagonal Opening Rims at angle i * 45°
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    v.push(Math.cos(a) * R_in, Math.sin(a) * R_in, 0.02);
  }

  // Group 5 (32..39): Back Mountain Ridges at angle (i + 0.5) * 45°
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / n;
    v.push(Math.cos(a) * R_mid, Math.sin(a) * R_mid, zBack);
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;

    const outCurr = i;
    const outNext = next;

    const ridgeCurr = 8 + i;
    const tuckCurr = 16 + i;
    const tuckNext = 16 + next;

    const inCurr = 24 + i;
    const inNext = 24 + next;

    const backCurr = 32 + i;

    // ── Front Facets of Interlocking Diamond Unit ──
    idx.push(outCurr, ridgeCurr, tuckCurr);
    idx.push(outNext, tuckNext, ridgeCurr);
    idx.push(tuckCurr, ridgeCurr, inCurr);
    idx.push(ridgeCurr, inNext, inCurr);
    idx.push(ridgeCurr, tuckNext, inNext);

    // ── Back Facets (Solid origami body) ──
    idx.push(outCurr, tuckCurr, backCurr);
    idx.push(outNext, backCurr, tuckNext);
    idx.push(inCurr, backCurr, inNext);
  }

  return buildGeometry(v, idx, scale * 0.95);
}

/* =========================================================================
   6. Chochin (Traditional Folded Japanese Lantern)
   10-sided pleated accordion cylinder with top rim collar, bottom rim,
   and accordion fold ribs with authentic mountain/valley creases.
   ========================================================================= */
export function createLanternGeometry(scale = 1.0) {
  const v: number[] = [];
  const n = 10;

  // 0: Top loop/apex
  v.push(0, 1.25, 0);
  // 1: Bottom tassel/apex
  v.push(0, -1.25, 0);

  // 2..11: Ring 0 - Top rim collar (10 vertices)
  const yTop = 0.95;
  const rTop = 0.48;
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    v.push(Math.cos(a) * rTop, yTop, Math.sin(a) * rTop);
  }

  // 12..21: Ring 1 - Accordion pleated belly (10 vertices, alternating mountain/valley ribs)
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    const isMountain = (i % 2 === 0);
    const r = isMountain ? 1.12 : 0.82;
    const y = isMountain ? 0.15 : -0.15;
    v.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // 22..31: Ring 2 - Bottom rim collar (10 vertices)
  const yBot = -0.95;
  const rBot = 0.48;
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    v.push(Math.cos(a) * rBot, yBot, Math.sin(a) * rBot);
  }

  const idx: number[] = [];

  // Top collar cone (CCW outward normal facing +Y)
  for (let i = 0; i < n; i++) {
    const curr = 2 + i;
    const next = 2 + ((i + 1) % n);
    idx.push(0, next, curr);
  }

  // Upper accordion wall facets (Ring 0 to Ring 1)
  for (let i = 0; i < n; i++) {
    const r0Curr = 2 + i;
    const r0Next = 2 + ((i + 1) % n);
    const r1Curr = 12 + i;
    const r1Next = 12 + ((i + 1) % n);

    idx.push(r0Curr, r0Next, r1Curr);
    idx.push(r0Next, r1Next, r1Curr);
  }

  // Lower accordion wall facets (Ring 1 to Ring 2)
  for (let i = 0; i < n; i++) {
    const r1Curr = 12 + i;
    const r1Next = 12 + ((i + 1) % n);
    const r2Curr = 22 + i;
    const r2Next = 22 + ((i + 1) % n);

    idx.push(r1Curr, r1Next, r2Curr);
    idx.push(r1Next, r2Next, r2Curr);
  }

  // Bottom collar cone (CCW outward normal facing -Y)
  for (let i = 0; i < n; i++) {
    const curr = 22 + i;
    const next = 22 + ((i + 1) % n);
    idx.push(1, curr, next);
  }

  // creaseAngle = 1 ensures 100% of all facet edges (apex spokes, pleat ribs, collar rims)
  // are outlined with crisp crease lines, eliminating unbordered tint convergence.
  return buildGeometry(v, idx, scale * 0.90, 1);
}


/** Registry of all 24 procedural origami model constructors */
export const ORIGAMI_GENERATORS = [
  createCraneGeometry,      // 0
  createShurikenGeometry,   // 1 (Ninja Star)
  createLuckyStarGeometry,  // 2 (Hoshi5)
  createPinwheelGeometry,   // 3 (Kazaguruma)
  createSonobeCubeGeometry, // 4 (Modular Sonobe Cube)
  createWaterbombGeometry,  // 5 (Waterbomb Balloon)
  createLotusGeometry,      // 6 (Hasu Lotus)
  createBoatGeometry,       // 7 (Paper Boat)
  createSaltCellarGeometry, // 8 (Fortune Teller)
  createPlaneGeometry,      // 9 (Paper Plane)
  createKabutoGeometry,     // 10 (Samurai Helmet)
  createKitsuneGeometry,    // 11 (Fox)
  createUsagiGeometry,      // 12 (Rabbit)
  createSwanGeometry,       // 13 (Swan)
  createButterflyGeometry,  // 14 (Butterfly)
  createGoldfishGeometry,   // 15 (Goldfish)
  createCicadaGeometry,     // 16 (Cicada)
  createKusudamaGeometry,   // 17 (Kusudama Star)
  createClamGeometry,       // 18 (Clam Shell)
  createSwallowGeometry,    // 19 (Swallow)
  createMasuGeometry,       // 20 (Sake Box)
  createSanboGeometry,      // 21 (Star Box)
  createWreathGeometry,     // 22 (Modular Wreath)
  createLanternGeometry,    // 23 (Lantern)
];
