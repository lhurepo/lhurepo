/**
 * Palettes lifted from lhu-website-v4 (app/globals.css + components/origami/OrigamiScene.tsx).
 * Night is the default; day swaps the roles. One ground, one ink, one accent.
 */
export type Mode = "dark" | "light";

export interface Palette {
  mode: Mode;
  bg: string;
  surface: string;
  surfaceOpacity: number;
  ink: string;
  heading: string;
  muted: string;
  accent: string;
  accentHover: string;
  accentInk: string;
  name: string;
  paperEdge: string;
  paperEdgeOpacity: number;
  tagFill: string;
  tagFillOpacity: number;
  /** origami */
  paper: string;
  edge: string;
  glow: string;
  paperOpacity: number;
  edgeOpacity: number;
  /** washi fibers */
  fiber: string;
  fiberAccent: string;
  speck: string;
  fiberScale: number;
  /** soft radial warmth on the ground */
  warm: string;
  warmOpacity: number;
  shadow: string;
  shadowOpacity: number;
  hanko: string;
}

export const DARK: Palette = {
  mode: "dark",
  bg: "#141316",
  surface: "#17161a",
  surfaceOpacity: 0.86,
  ink: "#ece7de",
  heading: "#f6f3ec",
  muted: "#a39e94",
  accent: "#eab308",
  accentHover: "#facc15",
  accentInk: "#181102",
  name: "#eab308",
  paperEdge: "#eab308",
  paperEdgeOpacity: 0.2,
  tagFill: "#eab308",
  tagFillOpacity: 0.08,
  paper: "#eab308",
  edge: "#ca8a04",
  glow: "#ca8a04",
  paperOpacity: 0.1,
  edgeOpacity: 0.55,
  fiber: "#fff0d8",
  fiberAccent: "#eab308",
  speck: "#785428",
  fiberScale: 1,
  warm: "#ffedd5",
  warmOpacity: 0.035,
  shadow: "#000000",
  shadowOpacity: 0.45,
  hanko: "#d9461b",
};

export const LIGHT: Palette = {
  mode: "light",
  bg: "#ece8e1",
  surface: "#f7f4ed",
  surfaceOpacity: 0.9,
  ink: "#1f1c18",
  heading: "#12100d",
  muted: "#5e574d",
  accent: "#d97706",
  accentHover: "#b45309",
  accentInk: "#ffffff",
  name: "#d97706",
  paperEdge: "#8c6e32",
  paperEdgeOpacity: 0.24,
  tagFill: "#eab308",
  tagFillOpacity: 0.1,
  paper: "#f59e0b",
  edge: "#ea580c",
  glow: "#f97316",
  paperOpacity: 0.13,
  edgeOpacity: 0.7,
  fiber: "#5c4a34",
  fiberAccent: "#b45309",
  speck: "#46301a",
  fiberScale: 0.85,
  warm: "#ffffff",
  warmOpacity: 0.45,
  shadow: "#785f28",
  shadowOpacity: 0.14,
  hanko: "#d9461b",
};

export const PALETTES: Palette[] = [DARK, LIGHT];
