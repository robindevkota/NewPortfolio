export interface Project {
  id: string;
  name: string;
  tag: string;
  url: string;
  description: string;
  longDescription: string;
  stack: string[];
  highlights: string[];
}

export const projects: Project[] = [
  {
    id: "royal-suites",
    name: "Royal Suites",
    tag: "Hotel Management System",
    url: "https://royalsuitesnp.com",
    description:
      "Full hotel management system with QR-based guest portal, real-time kitchen board, live inventory, and Stripe billing.",
    longDescription:
      "Guests scan room QR to authenticate instantly — order food, track orders live, book spa, raise SOS requests — zero front desk interaction. Kitchen staff update order status in real-time via Socket.io. Every food order auto-deducts ingredients from stock. All charges consolidated in one live bill.",
    stack: ["Next.js 14", "Express", "MongoDB", "Socket.io", "Stripe", "Cloudinary", "Zustand", "Playwright", "Turborepo"],
    highlights: [
      "6-role RBAC system",
      "Real-time kitchen board",
      "Live inventory deduction",
      "Consolidated billing with Stripe",
    ],
  },
  {
    id: "agentinbox",
    name: "AgentInbox",
    tag: "AI Bug & Task Automation",
    url: "https://useagentinbox.com",
    description:
      "Open-source task inbox that connects non-technical clients to an AI coding agent. Published npm package.",
    longDescription:
      "Clients submit bugs via web form or Telegram — AI fixes them in the real codebase autonomously. Real-time PM dashboard with WebSocket notifications, task audit log, and AI-generated screenshots. Approval-gate mode: AI proposes a fix plan, PM approves before any code runs. Uses Claude Pro as execution engine — no API billing.",
    stack: ["TypeScript", "Express", "SQLite/Turso", "React", "Tailwind CSS", "WebSocket", "MCP Protocol", "Playwright"],
    highlights: [
      "Published agentinbox-mcp npm package",
      "Telegram integration for remote control",
      "Approval-gate mode for safety",
      "No Anthropic API billing needed",
    ],
  },
  {
    id: "newweb",
    name: "NewWeb",
    tag: "No-Code Website & App Factory",
    url: "https://saucycreation.com",
    description:
      "No-code platform generating full websites and native mobile apps from a single configuration.",
    longDescription:
      "Generates fully functional websites and native mobile apps from a single configuration — auth, database, admin panel, and pages included. 1 live production client + 35+ demo sites running on one shared engine. Adding a new site requires zero code changes or deployments.",
    stack: ["Next.js 14", "React Native", "MongoDB", "Tailwind CSS", "Cloudinary"],
    highlights: [
      "35+ sites on one engine",
      "Zero code per new site",
      "AI-powered generation",
      "Visual drag-and-drop builder",
    ],
  },
];
