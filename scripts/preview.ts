/** Renders the first frame of every card to PNG (resvg ignores SMIL, so this is the resting pose). */
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { build } from "./build";
import { CACHE_DIR, previewFontFiles } from "./lib/fonts";

(async () => {
  const files = await build();
  const dir = path.join(CACHE_DIR, "preview");
  fs.mkdirSync(dir, { recursive: true });
  const only = process.argv.slice(2);
  for (const f of files) {
    const base = path.basename(f, ".svg");
    if (only.length && !only.some((o) => base.includes(o))) continue;
    const r = new Resvg(fs.readFileSync(f, "utf8"), {
      fitTo: { mode: "zoom", value: 1.5 },
      font: { fontFiles: [...previewFontFiles(), path.resolve(__dirname, "../fonts/KubosOrigami-YdXq.ttf")], loadSystemFonts: true, defaultFontFamily: "Switzer" },
    });
    fs.writeFileSync(path.join(dir, `${base}.png`), r.render().asPng());
  }
  console.log(`previews → ${dir}`);
})();
