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
    id: "mbl",
    role: "Associate Software Engineer",
    company: "MBL (Account Opening & CMS)",
    location: "Kathmandu, Nepal",
    period: "2025 – Present",
    description:
      "Developing multi-step account opening systems and CMS interfaces using React and custom RJSF validation schemas for regulated environments.",
    achievements: [
      "Reduced form submission errors by 30%+ through improved validation logic and conditional field rendering",
      "Collaborated with backend teams to integrate server-side validations across departments",
      "Designed reactive state machines for multi-department workflows"
    ],
  },
  {
    id: "focal-scope",
    role: "Associate Software Engineer",
    company: "Focal Scope",
    location: "Kathmandu, Nepal",
    period: "2024 – 2025",
    description:
      "Built comprehensive admin dashboards for mobile application management, focusing on real-time activity monitoring and content moderation workflows.",
    achievements: [
      "Designed interactive data visualization charts and dashboards using React graphing components",
      "Developed granular role-based access controls (RBAC) and integrated REST APIs for live synchronization",
      "Optimized mobile-app API endpoints resulting in 20% faster initial dashboards load"
    ],
  },
  {
    id: "aos-cms",
    role: "Associate Software Engineer — AOS & CMS",
    company: "Multiple Banks & Financial Institutions",
    location: "Kathmandu, Nepal",
    period: "2023 – 2024",
    description:
      "Delivered AOS and CMS systems in enterprise banking environments. Re-architected key rendering systems to solve severe enterprise UI performance blocks.",
    achievements: [
      "Rebuilt the RJSF form engine from scratch, reducing arrays re-renders from 650 down to 2 per keystroke",
      "Eliminated 300ms+ unmount flashes during API operations and preserved clean local inputs",
      "Reduced JavaScript form boilerplate code from 18,227 lines to 1,757 lines (90% reduction)",
      "Implemented a multi-role release management framework cutting release cycle efforts by 40%"
    ],
  }
];
