export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
}

export const experiences: Experience[] = [
  {
    id: "focal-scope",
    role: "Associate Software Engineer",
    company: "Focal Scope",
    location: "Kathmandu, Nepal",
    period: "2022 – 2025",
    description:
      "3+ years building enterprise AOS and CMS systems for banks and financial institutions across Nepal. Led frontend architecture on multi-step account opening flows and admin tooling used by regulated banking clients.",
    achievements: [
      "Rebuilt RJSF form engine — reduced re-renders from 650 to 2 per array keystroke",
      "Cut form boilerplate from 18,227 → 1,757 lines across 13 steps (90% reduction)",
      "Built multi-role release management system — reduced manual release effort by 40%",
      "Upgraded legacy CMS to modern React with full state management overhaul",
      "Worked across AOS & CMS for multiple banks and financial institutions",
    ],
  },
];
