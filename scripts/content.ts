/**
 * Copy, distilled from lhu-website-v4 (Hero, About, Experience, Projects, Education).
 * Edit here and run `npm run build` to refold every card.
 */
import type { Run } from "./lib/fonts";

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/hikaruun/",
  site: "https://hikaruun.com",
  github: "https://github.com/lhurepo",
  soterraRepo: "https://github.com/lhurepo/soterra",
  soterraDevpost: "https://devpost.com/software/soterra-mtz1rv",
  soterraLive: "https://soterra-calhacks13.netlify.app/",
};

export const USERNAME = "lhurepo";

export const HERO = {
  name: "hikaru",
  lead: "product, technology, business, and the seam where they meet. final year of bucs at ubc.",
};

export const ABOUT = {
  title: "hi! thanks for stopping by.",
  facts: [
    ["status", "UBC BUCS (2027 grad)"],
    ["interests", "PM · TPM · software"],
    ["recent", "SWE · TELUS"],
    ["past", "PM · Tokyo (Creww, MODE)"],
    ["off-hours", "backpacking · reading · drums · photography"],
  ] as [string, string][],
  lead: (strong: string): Run[] => [
    { text: "My name is " },
    { text: "Hikaru", weight: 600, color: strong },
    { text: ". I’m a " },
    { text: "BUCS", weight: 600, color: strong },
    { text: " (Business + Computer Science) student at " },
    { text: "UBC", weight: 600, color: strong },
    { text: "." },
  ],
  body: [
    "My goal has always been to bridge the gap between business strategy and deep engineering: understanding how both sides collaborate to build software people genuinely value.",
    "In Tokyo, I worked in product management across two fast-growing startups (Creww and MODE), driving open-innovation accelerators and shaping IoT and generative-AI tools across bilingual teams.",
    "Most recently, I worked in software engineering at TELUS in Vancouver, building developer tools and AI automations, which gave me a much sharper appreciation for architecture and developer velocity.",
    "Outside of tech, you’ll usually find me outdoors backpacking and fishing, behind a camera, practicing drums, or reading about the deepest questions of life.",
  ],
};

export interface Role {
  when: string;
  role: string;
  org: string;
  place: string;
  desc: string;
  tags: string[];
}

export const EXPERIENCE: { title: string; roles: Role[] } = {
  title: "previous experience",
  roles: [
    {
      when: "Jan 2026 – Aug 2026",
      role: "Software Engineer Intern",
      org: "TELUS",
      place: "Vancouver, BC",
      desc: "Internal developer tooling and automations at one of Canada’s largest telecoms, streamlining day-to-day work for engineering teams.",
      tags: ["Internal Tools", "Automation", "React · Node"],
    },
    {
      when: "Apr 2025 – Sep 2025",
      role: "Product Manager Intern",
      org: "Creww, Inc.",
      place: "Tokyo, Japan",
      desc: "Moved a flagship open-innovation accelerator from kickoff to launch: specs, cross-team coordination, and usage data leadership could act on.",
      tags: ["Product Management", "Cross-functional", "Analytics", "日本語"],
    },
    {
      when: "Sep 2024 – Apr 2025",
      role: "Technical Product Manager Intern",
      org: "MODE, Inc.",
      place: "Tokyo, Japan",
      desc: "Shaped a mobile AI assistant on an IoT + generative-AI platform for on-site operations, between engineering and design.",
      tags: ["IoT · GenAI", "PRDs · Roadmap", "日本語"],
    },
    {
      when: "Sep 2022 – Jan 2025",
      role: "Product Manager",
      org: "UBC BizTech Network",
      place: "Vancouver, BC",
      desc: "Led product on a student-facing engagement platform at UBC’s largest tech club, plus experiments around events and networking.",
      tags: ["Product", "Community", "Roadmaps"],
    },
    {
      when: "May 2024 – Sep 2024",
      role: "Software Engineer Intern",
      org: "Sekigin",
      place: "Vancouver, BC",
      desc: "Full-stack web app for an online English-tutoring platform: scheduling, lessons, auth, data flows and integrations.",
      tags: ["Full-Stack", "Auth · APIs", "Cloud"],
    },
  ],
};

export const PROJECT = {
  title: "projects",
  event: "Cal Hacks 13.0",
  kind: "AI Disaster Hotline",
  name: "Soterra",
  desc: "An AI-powered phone hotline delivering real-time, verified natural disaster updates over regular phone calls: no internet, mobile data, or apps required. When storms or wildfires knock out power and cell networks, anyone can dial in and get answers synthesized from official emergency feeds (USGS, NWS, IPAWS, CalFire).",
  callout: ["Live Hotline:", "+1 (712) 600-3362", "· Toll-free voice agent"] as const,
  tags: ["Claude / Anthropic", "Cartesia Voice", "Convex", "Python", "TypeScript", "Swift", "Apify"],
};

/** Shown under the live stats; things the portfolio itself is folded from. */
export const TOOLKIT = [
  "TypeScript",
  "Python",
  "Swift",
  "React",
  "Next.js",
  "Node.js",
  "Three.js",
  "Tailwind",
  "Convex",
  "Claude API",
];
