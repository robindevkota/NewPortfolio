export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["React.js", "Next.js 14", "TypeScript", "JavaScript ES6+", "React Native", "Tailwind CSS", "Framer Motion", "Ant Design", "Zustand", "RJSF"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "Socket.io", "WebSocket", "MCP Protocol"],
  },
  {
    id: "database",
    label: "Database",
    items: ["MongoDB", "Mongoose", "SQLite", "Turso", "SQL"],
  },
  {
    id: "ai-automation",
    label: "AI & Automation",
    items: ["Claude Code", "Groq", "Ollama", "RAG Pipelines", "ChromaDB", "GitHub Actions", "Playwright"],
  },
  {
    id: "payments",
    label: "Payments & Tools",
    items: ["Stripe", "eSewa", "Khalti", "Cloudinary", "Vercel", "Turborepo", "Git", "Postman"],
  },
  {
    id: "methodologies",
    label: "Methodologies",
    items: ["Multi-tenant SaaS", "RBAC", "AI Orchestration", "Agile", "Real-time Systems"],
  },
];
