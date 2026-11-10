/**
 * Pulls public GitHub numbers into data/stats.json (read by build.ts).
 *
 *   GITHUB_TOKEN=... npm run stats     # token optional; adds the contributions count
 *
 * Runs daily in .github/workflows/refold.yml.
 */
import fs from "node:fs";
import path from "node:path";
import { USERNAME } from "./content";

const OUT = path.resolve(__dirname, "../data/stats.json");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${USERNAME}-profile-readme`,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} ← ${url}`);
  return (await r.json()) as T;
}

interface Repo {
  name: string;
  fork: boolean;
  stargazers_count: number;
  languages_url: string;
  archived: boolean;
}

export interface Stats {
  updated: string;
  repos: number;
  stars: number;
  followers: number;
  since: number;
  languageCount: number;
  contributions: number | null;
  languages: { name: string; share: number }[];
}

async function contributions(): Promise<number | null> {
  if (!token) return null;
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}`;
  try {
    const r = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: USERNAME } }),
    });
    const j = (await r.json()) as any;
    return j?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const user = await gh<{ public_repos: number; followers: number; created_at: string }>(`https://api.github.com/users/${USERNAME}`);
  const repos = await gh<Repo[]>(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`);
  const own = repos.filter((r) => !r.fork);

  const bytes = new Map<string, number>();
  for (const r of own) {
    const langs = await gh<Record<string, number>>(r.languages_url);
    for (const [k, v] of Object.entries(langs)) bytes.set(k, (bytes.get(k) ?? 0) + v);
  }
  const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const sorted = [...bytes.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6).map(([name, v]) => ({ name, share: v / total }));
  const rest = sorted.slice(6).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) top.push({ name: "Other", share: rest / total });

  const stats: Stats = {
    updated: new Date().toISOString(),
    repos: user.public_repos,
    stars: own.reduce((s, r) => s + r.stargazers_count, 0),
    followers: user.followers,
    since: new Date(user.created_at).getUTCFullYear(),
    languageCount: bytes.size,
    contributions: await contributions(),
    languages: top,
  };

  // Keep the last known contributions count when running without a token.
  if (stats.contributions === null && fs.existsSync(OUT)) {
    const prev = JSON.parse(fs.readFileSync(OUT, "utf8")) as Stats;
    stats.contributions = prev.contributions;
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(stats, null, 2) + "\n");
  console.log(`stats → ${path.relative(process.cwd(), OUT)}`, stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
