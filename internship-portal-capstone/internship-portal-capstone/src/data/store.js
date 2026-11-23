const internships = [
  {
    id: "int-101",
    title: "Frontend Engineering Intern",
    company: "Kaveri Cloud Systems",
    location: "Bengaluru, Karnataka (Hybrid)",
    stipend: "₹25,000 / month",
    duration: "6 Months",
    domain: "Web Development",
    skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    deadline: "2026-12-15",
    description: "Build accessible, responsive customer dashboards and collaborate with product designers on design-system components.",
    responsibilities: [
      "Develop reusable UI components with keyboard accessibility",
      "Integrate REST APIs with proper loading and error states",
      "Write unit tests for critical user flows"
    ]
  },
  {
    id: "int-102",
    title: "Backend & API Intern",
    company: "Narmada FinTech Labs",
    location: "Chennai, Tamil Nadu (On-site)",
    stipend: "₹30,000 / month",
    duration: "6 Months",
    domain: "Backend",
    skills: ["Node.js", "PostgreSQL", "Docker", "REST"],
    deadline: "2026-12-20",
    description: "Design resilient microservices, implement structured observability, and optimize database queries for payment workflows.",
    responsibilities: [
      "Build validated REST endpoints with structured logging",
      "Write integration and regression tests for API contracts",
      "Monitor service health metrics and latency"
    ]
  },
  {
    id: "int-103",
    title: "Data & ML Engineering Intern",
    company: "Vindhya Analytics",
    location: "Remote (India)",
    stipend: "₹22,000 / month",
    duration: "4 Months",
    domain: "Data Science",
    skills: ["Python", "Pandas", "SQL", "Scikit-learn"],
    deadline: "2026-12-10",
    description: "Clean real-world telemetry datasets, train lightweight classification pipelines, and surface insights to operations teams.",
    responsibilities: [
      "Build reproducible data cleaning and feature pipelines",
      "Evaluate model accuracy and document edge cases",
      "Create clear summary reports for stakeholders"
    ]
  },
  {
    id: "int-104",
    title: "Full-Stack Product Intern",
    company: "Nilgiri HealthTech",
    location: "Coimbatore, Tamil Nadu (Hybrid)",
    stipend: "₹20,000 / month",
    duration: "3 Months",
    domain: "Full Stack",
    skills: ["JavaScript", "Node.js", "HTML/CSS", "SQLite"],
    deadline: "2026-12-28",
    description: "Work across frontend and backend features for patient appointment scheduling and clinic onboarding.",
    responsibilities: [
      "Implement mobile-first booking screens",
      "Ensure input validation and data privacy across forms",
      "Participate in weekly code reviews and sprint demos"
    ]
  }
];

// In-memory store keyed by user email for demo simplicity
const applications = [
  {
    id: "app-1",
    internshipId: "int-101",
    applicantName: "Aarav Sharma",
    applicantEmail: "aarav@example.com",
    resumeUrl: "https://example.com/aarav-resume.pdf",
    note: "Built two React + TypeScript dashboards and contributed to open-source UI accessibility.",
    status: "Under Review",
    appliedAt: "2026-11-20T10:30:00.000Z"
  }
];

const savedIdsByUser = {
  "aarav@example.com": ["int-102"]
};

module.exports = {
  internships,
  applications,
  savedIdsByUser
};
