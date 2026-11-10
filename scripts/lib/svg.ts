/** Small SVG string helpers shared by every generator. */

/** Format a number compactly: 1 decimal, no trailing ".0", no "-0". */
export function n(v: number, digits = 1): string {
  const s = v.toFixed(digits);
  const t = digits > 0 ? s.replace(/\.?0+$/, "") : s;
  if (t === "-0") return "0";
  // ".5" / "-.5" are valid SVG numbers and shave a byte per value.
  return t.replace(/^(-?)0\./, "$1.");
}

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Deterministic PRNG (mulberry32) so every build is byte-identical. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wrap content in a root <svg>. */
export function svgDoc(
  width: number,
  height: number,
  body: string,
  opts: { title?: string; style?: string } = {}
): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img"${opts.title ? ` aria-label="${esc(opts.title)}"` : ""}>`,
    opts.title ? `<title>${esc(opts.title)}</title>` : "",
    opts.style ? `<style>${opts.style}</style>` : "",
    body,
    `</svg>`,
  ].join("");
}

/** Expo-out easing used by the website's reveal motion (cubic-bezier(0.16, 1, 0.3, 1)). */
export const EXPO_OUT = "0.16 1 0.3 1";
export const SOFT = "0.45 0 0.55 1";
