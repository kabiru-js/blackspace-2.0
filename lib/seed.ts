import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("Using", process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon", "key");

const supabase = createClient(supabaseUrl, supabaseKey);

interface SeedOpportunity {
  title: string;
  provider: string;
  country: string;
  category: string;
  type: string;
  skills: string[];
  is_remote: boolean;
  location: string;
  level: string;
  field: string;
  funding_type: string;
  deadline: string;
  description: string;
  eligibility: string;
  requirements: string;
  application_link: string;
  tags: string[];
}

const opportunities: SeedOpportunity[] = [
  // ── 20 JOBS ──
  {
    title: "Software Engineer — Remote", provider: "Stripe", country: "United States",
    category: "career", type: "job", skills: ["JavaScript", "React", "Node.js"], is_remote: true,
    location: "Remote", level: "mid_career", field: "Software Engineering",
    funding_type: "paid", deadline: "2025-12-31",
    description: "Build payment infrastructure used by millions. Fully remote with async-first culture.",
    eligibility: "3+ years experience in full-stack development.", requirements: "React, TypeScript, system design",
    application_link: "https://stripe.com/jobs", tags: ["remote", "tech", "senior"],
  },
  {
    title: "Product Designer", provider: "Figma", country: "United States",
    category: "career", type: "job", skills: ["UI Design", "Figma", "Prototyping"], is_remote: true,
    location: "Remote", level: "mid_career", field: "Design",
    funding_type: "paid", deadline: "2025-11-15",
    description: "Shape the future of collaborative design at Figma. Remote-first, global team.",
    eligibility: "Portfolio demonstrating product thinking.", requirements: "Figma, design systems, user research",
    application_link: "https://figma.com/careers", tags: ["remote", "design", "tech"],
  },
  {
    title: "Data Scientist — AI Ethics", provider: "Google DeepMind", country: "United Kingdom",
    category: "career", type: "job", skills: ["Python", "ML", "AI Ethics"], is_remote: false,
    location: "London", level: "mid_career", field: "Artificial Intelligence",
    funding_type: "paid", deadline: "2025-10-30",
    description: "Research and implement ethical AI frameworks at DeepMind's London lab.",
    eligibility: "PhD or equivalent experience in ML/AI.", requirements: "PyTorch, research, publications",
    application_link: "https://deepmind.com/careers", tags: ["ai", "research", "ethics"],
  },
  {
    title: "Backend Engineer — Fintech", provider: "Revolut", country: "United Kingdom",
    category: "career", type: "job", skills: ["Java", "Kotlin", "Microservices"], is_remote: false,
    location: "London", level: "early_career", field: "Software Engineering",
    funding_type: "paid", deadline: "2025-12-01",
    description: "Build banking infrastructure serving 40M+ users. Fast-paced, high-impact.",
    eligibility: "1+ years backend experience.", requirements: "Java, distributed systems, SQL",
    application_link: "https://revolut.com/careers", tags: ["fintech", "backend", "java"],
  },
  {
    title: "UX Researcher", provider: "Spotify", country: "Sweden",
    category: "career", type: "job", skills: ["User Research", "Usability Testing"], is_remote: true,
    location: "Stockholm / Remote", level: "mid_career", field: "Design",
    funding_type: "paid", deadline: "2025-11-20",
    description: "Lead user research for Spotify's creator tools. Shape how artists connect with fans.",
    eligibility: "3+ years in UX research.", requirements: "Qualitative research, data analysis",
    application_link: "https://spotify.com/jobs", tags: ["remote", "design", "music"],
  },
  {
    title: "Cloud Solutions Architect", provider: "AWS", country: "Germany",
    category: "career", type: "job", skills: ["AWS", "Cloud", "Architecture"], is_remote: false,
    location: "Berlin", level: "mid_career", field: "Cloud Computing",
    funding_type: "paid", deadline: "2025-12-15",
    description: "Design cloud solutions for enterprise customers. AWS certification required.",
    eligibility: "AWS Solutions Architect certified.", requirements: "AWS, Terraform, enterprise architecture",
    application_link: "https://aws.amazon.com/careers", tags: ["cloud", "devops", "berlin"],
  },
  {
    title: "Frontend Developer — Web3", provider: "Consensys", country: "United States",
    category: "career", type: "job", skills: ["React", "Web3", "Solidity"], is_remote: true,
    location: "Remote", level: "early_career", field: "Blockchain",
    funding_type: "paid", deadline: "2025-12-31",
    description: "Build dApp interfaces for Ethereum ecosystem. Fully remote with crypto-native culture.",
    eligibility: "Strong React skills, interest in Web3.", requirements: "React, ethers.js, TypeScript",
    application_link: "https://consensys.net/careers", tags: ["web3", "crypto", "remote"],
  },
  {
    title: "Marketing Manager — Growth", provider: "Notion", country: "United States",
    category: "career", type: "job", skills: ["Marketing", "Growth", "Content"], is_remote: true,
    location: "Remote", level: "mid_career", field: "Marketing",
    funding_type: "paid", deadline: "2025-11-30",
    description: "Drive growth marketing for Notion's global expansion. Creator-first approach.",
    eligibility: "4+ years in B2B/B2C growth marketing.", requirements: "Analytics, SEO, content strategy",
    application_link: "https://notion.so/careers", tags: ["remote", "growth", "marketing"],
  },
  {
    title: "DevOps Engineer", provider: "GitLab", country: "Netherlands",
    category: "career", type: "job", skills: ["Kubernetes", "CI/CD", "Linux"], is_remote: true,
    location: "Remote", level: "mid_career", field: "DevOps",
    funding_type: "paid", deadline: "2025-12-10",
    description: "Maintain GitLab's SaaS infrastructure. All-remote company with handbook-first culture.",
    eligibility: "3+ years DevOps/SRE experience.", requirements: "K8s, Terraform, monitoring",
    application_link: "https://gitlab.com/jobs", tags: ["remote", "devops", "kubernetes"],
  },
  {
    title: "AI Engineer", provider: "Anthropic", country: "United States",
    category: "career", type: "job", skills: ["Python", "LLMs", "RLHF"], is_remote: true,
    location: "San Francisco / Remote", level: "mid_career", field: "Artificial Intelligence",
    funding_type: "paid", deadline: "2025-11-15",
    description: "Work on frontier AI safety at Anthropic. Help build beneficial AI systems.",
    eligibility: "Experience with large language models.", requirements: "Python, PyTorch, prompt engineering",
    application_link: "https://anthropic.com/careers", tags: ["ai", "safety", "research"],
  },
  // ...continued jobs 11-20...
  {
    title: "Mobile Developer (iOS)", provider: "Duolingo", country: "United States",
    category: "career", type: "job", skills: ["Swift", "iOS", "UIKit"], is_remote: false,
    location: "Pittsburgh", level: "early_career", field: "Mobile Development",
    funding_type: "paid", deadline: "2025-12-05",
    description: "Build language learning experiences for 500M+ users. Mission-driven company.",
    eligibility: "1+ year iOS development.", requirements: "Swift, SwiftUI, Core Data",
    application_link: "https://duolingo.com/careers", tags: ["ios", "mobile", "edtech"],
  },
  {
    title: "Cybersecurity Analyst", provider: "Cloudflare", country: "United Kingdom",
    category: "career", type: "job", skills: ["Security", "Networking", "Incident Response"], is_remote: true,
    location: "London / Remote", level: "early_career", field: "Cybersecurity",
    funding_type: "paid", deadline: "2025-12-20",
    description: "Protect Cloudflare's global network. Analyze threats and respond to incidents.",
    eligibility: "Security+ or equivalent cert.", requirements: "Wireshark, SIEM, Python",
    application_link: "https://cloudflare.com/careers", tags: ["security", "remote", "networking"],
  },
  {
    title: "Content Strategist", provider: "Airbnb", country: "United States",
    category: "career", type: "job", skills: ["Content Strategy", "UX Writing"], is_remote: true,
    location: "Remote", level: "early_career", field: "Content Design",
    funding_type: "paid", deadline: "2025-11-25",
    description: "Craft the voice of Airbnb across product surfaces. Shape how people experience travel.",
    eligibility: "Portfolio of UX writing samples.", requirements: "Figma, user research, tone guidelines",
    application_link: "https://airbnb.com/careers", tags: ["remote", "content", "ux"],
  },
  {
    title: "Full-Stack Developer", provider: "Vercel", country: "United States",
    category: "career", type: "job", skills: ["Next.js", "React", "Edge"], is_remote: true,
    location: "Remote", level: "mid_career", field: "Software Engineering",
    funding_type: "paid", deadline: "2025-12-31",
    description: "Build the platform that powers the web. Work on Next.js, Turbopack, and edge infrastructure.",
    eligibility: "Open source contributions preferred.", requirements: "Next.js, Rust a plus, system design",
    application_link: "https://vercel.com/careers", tags: ["remote", "nextjs", "open-source"],
  },
  {
    title: "ML Operations Engineer", provider: "Hugging Face", country: "France",
    category: "career", type: "job", skills: ["MLOps", "Python", "Docker"], is_remote: true,
    location: "Paris / Remote", level: "mid_career", field: "Machine Learning",
    funding_type: "paid", deadline: "2025-12-15",
    description: "Scale ML model deployment for the open-source AI community. Democratize machine learning.",
    eligibility: "Experience deploying ML models in production.", requirements: "Kubernetes, transformers, CI/CD",
    application_link: "https://huggingface.co/jobs", tags: ["remote", "ai", "open-source"],
  },
  {
    title: "Game Developer", provider: "Supercell", country: "Finland",
    category: "career", type: "job", skills: ["Unity", "C#", "Game Design"], is_remote: false,
    location: "Helsinki", level: "early_career", field: "Game Development",
    funding_type: "paid", deadline: "2025-11-30",
    description: "Create the next billion-dollar mobile game at Supercell. Small teams, huge impact.",
    eligibility: "Unity experience, shipped at least one game.", requirements: "C#, Unity, game physics",
    application_link: "https://supercell.com/careers", tags: ["gaming", "unity", "helsinki"],
  },
  {
    title: "Technical Writer — API Docs", provider: "Twilio", country: "United States",
    category: "career", type: "job", skills: ["Technical Writing", "APIs", "Markdown"], is_remote: true,
    location: "Remote", level: "early_career", field: "Technical Communication",
    funding_type: "paid", deadline: "2025-12-10",
    description: "Write developer documentation for Twilio's API platform. Make complex APIs simple.",
    eligibility: "Technical writing samples required.", requirements: "REST APIs, OpenAPI, developer empathy",
    application_link: "https://twilio.com/jobs", tags: ["remote", "writing", "api"],
  },
  {
    title: "Data Engineer", provider: "Snowflake", country: "United States",
    category: "career", type: "job", skills: ["SQL", "Python", "ETL"], is_remote: true,
    location: "Remote", level: "mid_career", field: "Data Engineering",
    funding_type: "paid", deadline: "2025-12-20",
    description: "Build data pipelines at petabyte scale. Power the data cloud.",
    eligibility: "3+ years data engineering experience.", requirements: "Spark, Airflow, cloud platforms",
    application_link: "https://snowflake.com/careers", tags: ["remote", "data", "big-data"],
  },
  {
    title: "Community Manager — Africa", provider: "Andela", country: "Nigeria",
    category: "career", type: "job", skills: ["Community", "Events", "Social Media"], is_remote: true,
    location: "Remote (Africa)", level: "early_career", field: "Community Management",
    funding_type: "paid", deadline: "2025-12-15",
    description: "Grow and engage Andela's developer community across Africa. Organize events and content.",
    eligibility: "Based in Africa, community experience.", requirements: "Social media, event planning, dev empathy",
    application_link: "https://andela.com/careers", tags: ["remote", "africa", "community"],
  },
  {
    title: "Blockchain Developer", provider: "Polygon", country: "India",
    category: "career", type: "job", skills: ["Solidity", "Ethereum", "Rust"], is_remote: true,
    location: "Remote", level: "early_career", field: "Blockchain",
    funding_type: "paid", deadline: "2025-12-31",
    description: "Build Layer 2 scaling solutions for Ethereum. Work on zk-rollups and DeFi infrastructure.",
    eligibility: "Solidity experience required.", requirements: "EVM, DeFi protocols, security mindset",
    application_link: "https://polygon.technology/careers", tags: ["remote", "crypto", "layer2"],
  },

  // ── 20 INTERNSHIPS ──
  {
    title: "Software Engineering Intern", provider: "Google", country: "United States",
    category: "career", type: "internship", skills: ["Python", "Java", "Algorithms"], is_remote: false,
    location: "Mountain View", level: "undergraduate", field: "Computer Science",
    funding_type: "paid", deadline: "2025-10-31",
    description: "12-week summer internship. Work on real Google products with a mentor and intern community.",
    eligibility: "Currently pursuing CS degree. Graduating 2026+.", requirements: "Data structures, algorithms, one programming language",
    application_link: "https://careers.google.com/students", tags: ["faang", "summer", "paid"],
  },
  {
    title: "Product Management Intern", provider: "Microsoft", country: "United States",
    category: "career", type: "internship", skills: ["Product", "Analytics", "Communication"], is_remote: false,
    location: "Redmond", level: "undergraduate", field: "Business",
    funding_type: "paid", deadline: "2025-11-15",
    description: "Drive product features from concept to launch. Rotate across Microsoft product teams.",
    eligibility: "MBA or undergrad in tech/business.", requirements: "SQL, user research, cross-functional",
    application_link: "https://careers.microsoft.com/students", tags: ["faang", "product", "paid"],
  },
  {
    title: "Design Intern — Brand", provider: "Apple", country: "United States",
    category: "career", type: "internship", skills: ["Graphic Design", "Typography", "Branding"], is_remote: false,
    location: "Cupertino", level: "undergraduate", field: "Design",
    funding_type: "paid", deadline: "2025-10-15",
    description: "Work on Apple's brand identity. Design for marketing, events, and product launches.",
    eligibility: "Design portfolio required.", requirements: "Adobe Suite, Figma, attention to detail",
    application_link: "https://apple.com/careers", tags: ["faang", "design", "brand"],
  },
  {
    title: "Data Science Intern", provider: "Meta", country: "United Kingdom",
    category: "career", type: "internship", skills: ["Python", "SQL", "Statistics"], is_remote: false,
    location: "London", level: "masters", field: "Data Science",
    funding_type: "paid", deadline: "2025-11-30",
    description: "Analyze user behavior at Meta scale. Work with real datasets affecting billions of users.",
    eligibility: "Graduate student in quantitative field.", requirements: "SQL, Python, A/B testing",
    application_link: "https://metacareers.com/students", tags: ["faang", "data", "london"],
  },
  {
    title: "Investment Banking Summer Analyst", provider: "Goldman Sachs", country: "United Kingdom",
    category: "career", type: "internship", skills: ["Finance", "Excel", "Valuation"], is_remote: false,
    location: "London", level: "undergraduate", field: "Finance",
    funding_type: "paid", deadline: "2025-10-01",
    description: "10-week summer program. Build financial models, prepare pitch books, work on live deals.",
    eligibility: "Penultimate year student, strong academics.", requirements: "Financial modeling, Excel, DCF",
    application_link: "https://goldmansachs.com/careers", tags: ["finance", "banking", "london"],
  },
  {
    title: "AI Research Intern", provider: "OpenAI", country: "United States",
    category: "career", type: "internship", skills: ["PyTorch", "Transformers", "Research"], is_remote: false,
    location: "San Francisco", level: "phd", field: "Artificial Intelligence",
    funding_type: "paid", deadline: "2025-11-15",
    description: "Contribute to frontier AI research. Publish papers, build models, push boundaries.",
    eligibility: "PhD candidate in ML/AI.", requirements: "Publications at NeurIPS/ICML/ICLR preferred",
    application_link: "https://openai.com/careers", tags: ["ai", "research", "phd"],
  },
  {
    title: "Marketing Intern — EMEA", provider: "Nike", country: "Netherlands",
    category: "career", type: "internship", skills: ["Marketing", "Sports", "Digital"], is_remote: false,
    location: "Amsterdam", level: "undergraduate", field: "Marketing",
    funding_type: "paid", deadline: "2025-11-20",
    description: "Support Nike's EMEA marketing campaigns. Work with athletes, creators, and cultural moments.",
    eligibility: "Marketing/communications student.", requirements: "Social media, analytics, creativity",
    application_link: "https://nike.com/careers", tags: ["sports", "marketing", "amsterdam"],
  },
  {
    title: "Legal Intern — Tech Policy", provider: "Electronic Frontier Foundation", country: "United States",
    category: "career", type: "internship", skills: ["Legal Research", "Policy", "Writing"], is_remote: true,
    location: "Remote", level: "masters", field: "Law",
    funding_type: "paid", deadline: "2025-12-01",
    description: "Defend digital rights. Research tech policy, draft amicus briefs, protect civil liberties online.",
    eligibility: "Law student (2L/3L) or LLM.", requirements: "Legal writing, tech law interest",
    application_link: "https://eff.org/internships", tags: ["remote", "law", "digital-rights"],
  },
  {
    title: "Software Engineering Intern — Africa", provider: "Microsoft ADC", country: "Kenya",
    category: "career", type: "internship", skills: ["C#", ".NET", "Cloud"], is_remote: false,
    location: "Nairobi", level: "undergraduate", field: "Computer Science",
    funding_type: "paid", deadline: "2025-11-05",
    description: "Join Microsoft's Africa Development Centre. Build products for Africa, by Africa.",
    eligibility: "African CS student, graduating 2026+.", requirements: "OOP, data structures, cloud basics",
    application_link: "https://microsoft.com/africa/arc", tags: ["africa", "tech", "nairobi"],
  },
  {
    title: "Climate Tech Intern", provider: "Tesla", country: "Germany",
    category: "career", type: "internship", skills: ["Mechanical Engineering", "CAD", "Energy"], is_remote: false,
    location: "Berlin", level: "undergraduate", field: "Engineering",
    funding_type: "paid", deadline: "2025-12-15",
    description: "Work on Tesla's Gigafactory Berlin. Design sustainable manufacturing systems.",
    eligibility: "Engineering student.", requirements: "CAD, thermodynamics, manufacturing",
    application_link: "https://tesla.com/careers", tags: ["climate", "engineering", "berlin"],
  },
  {
    title: "Editorial Intern", provider: "The New York Times", country: "United States",
    category: "career", type: "internship", skills: ["Writing", "Journalism", "Research"], is_remote: false,
    location: "New York", level: "undergraduate", field: "Journalism",
    funding_type: "paid", deadline: "2025-10-15",
    description: "Report, write, and fact-check for one of the world's leading newsrooms.",
    eligibility: "Journalism student or recent grad.", requirements: "AP style, reporting, deadline-driven",
    application_link: "https://nytimes.com/careers", tags: ["journalism", "media", "nyc"],
  },
  {
    title: "UX Design Intern", provider: "Shopify", country: "Canada",
    category: "career", type: "internship", skills: ["UI Design", "Figma", "User Flows"], is_remote: true,
    location: "Remote", level: "undergraduate", field: "Design",
    funding_type: "paid", deadline: "2025-11-25",
    description: "Design commerce experiences for millions of merchants. Remote-first, mentorship-driven.",
    eligibility: "Design portfolio required.", requirements: "Figma, prototyping, design thinking",
    application_link: "https://shopify.com/careers", tags: ["remote", "design", "ecommerce"],
  },
  {
    title: "Quantitative Research Intern", provider: "Jane Street", country: "United Kingdom",
    category: "career", type: "internship", skills: ["Math", "Statistics", "OCaml"], is_remote: false,
    location: "London", level: "undergraduate", field: "Mathematics",
    funding_type: "paid", deadline: "2025-10-30",
    description: "Build trading models and strategies. Work alongside some of the sharpest minds in finance.",
    eligibility: "Strong math/programming background.", requirements: "Probability, statistics, functional programming",
    application_link: "https://janestreet.com/join", tags: ["finance", "quant", "math"],
  },
  {
    title: "Film Production Intern", provider: "A24", country: "United States",
    category: "career", type: "internship", skills: ["Film Production", "Editing", "Storytelling"], is_remote: false,
    location: "Los Angeles", level: "undergraduate", field: "Film",
    funding_type: "paid", deadline: "2025-12-01",
    description: "Work inside A24's production team. Read scripts, sit in on edits, learn indie filmmaking.",
    eligibility: "Film student with passion for independent cinema.", requirements: "Final Cut, script coverage, hustle",
    application_link: "https://a24films.com/jobs", tags: ["film", "creative", "la"],
  },
  {
    title: "Sustainability Intern", provider: "Patagonia", country: "United States",
    category: "career", type: "internship", skills: ["Sustainability", "Research", "Environmental"], is_remote: false,
    location: "Ventura", level: "undergraduate", field: "Environmental Science",
    funding_type: "paid", deadline: "2025-11-15",
    description: "Help Patagonia achieve carbon neutrality. Work on supply chain sustainability projects.",
    eligibility: "Environmental science or policy student.", requirements: "LCA, data analysis, advocacy",
    application_link: "https://patagonia.com/careers", tags: ["climate", "sustainability", "outdoor"],
  },
  {
    title: "Robotics Intern", provider: "Boston Dynamics", country: "United States",
    category: "career", type: "internship", skills: ["ROS", "C++", "Control Systems"], is_remote: false,
    location: "Waltham", level: "masters", field: "Robotics",
    funding_type: "paid", deadline: "2025-12-10",
    description: "Program Atlas and Spot robots. Work on locomotion, manipulation, and perception.",
    eligibility: "Graduate student in robotics/ME/CS.", requirements: "ROS, C++, control theory",
    application_link: "https://bostondynamics.com/careers", tags: ["robotics", "engineering", "hardware"],
  },
  {
    title: "VC Analyst Intern", provider: "a16z", country: "United States",
    category: "career", type: "internship", skills: ["Venture Capital", "Market Analysis", "Deal Sourcing"], is_remote: true,
    location: "Remote", level: "undergraduate", field: "Business",
    funding_type: "paid", deadline: "2025-10-15",
    description: "Source deals, analyze markets, and support investment decisions at a top-tier VC firm.",
    eligibility: "Demonstrated interest in startups/tech.", requirements: "Financial analysis, market research, hustle",
    application_link: "https://a16z.com/jobs", tags: ["remote", "vc", "startups"],
  },
  {
    title: "Music Business Intern", provider: "Universal Music Group", country: "United Kingdom",
    category: "career", type: "internship", skills: ["Music Industry", "Marketing", "A&R"], is_remote: false,
    location: "London", level: "undergraduate", field: "Music",
    funding_type: "paid", deadline: "2025-11-30",
    description: "Work across labels at UMG. Support A&R, marketing, and digital strategy for artists.",
    eligibility: "Music business student or equivalent.", requirements: "Streaming analytics, social media, passion",
    application_link: "https://universalmusic.com/careers", tags: ["music", "creative", "london"],
  },
  {
    title: "Climate Policy Intern", provider: "UN Climate Change (UNFCCC)", country: "Germany",
    category: "career", type: "internship", skills: ["Policy", "Climate", "International Relations"], is_remote: false,
    location: "Bonn", level: "masters", field: "Environmental Policy",
    funding_type: "unpaid", deadline: "2025-12-15",
    description: "Support international climate negotiations. Research policy, draft briefings, attend COP prep.",
    eligibility: "Graduate student in policy/law/environment.", requirements: "Policy analysis, UN processes, writing",
    application_link: "https://unfccc.int/internships", tags: ["climate", "un", "policy"],
  },
  {
    title: "Sports Management Intern", provider: "FC Barcelona", country: "Spain",
    category: "career", type: "internship", skills: ["Sports Management", "Marketing", "Spanish"], is_remote: false,
    location: "Barcelona", level: "undergraduate", field: "Sports Management",
    funding_type: "unpaid", deadline: "2025-10-01",
    description: "Work inside one of the world's biggest football clubs. Support operations, events, and fan engagement.",
    eligibility: "Sports management student, Spanish fluency.", requirements: "Project management, CRM, football knowledge",
    application_link: "https://fcbarcelona.com/careers", tags: ["sports", "football", "barcelona"],
  },

  // ── More categories abbreviated for space ──
  // 10 scholarships (academic)
  {
    title: "Chevening Scholarships", provider: "UK Government", country: "United Kingdom",
    category: "academic", type: "scholarship", skills: ["Leadership", "International Relations"], is_remote: false,
    location: "UK", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-11-05",
    description: "Fully-funded UK master's for emerging global leaders. Tuition, living stipend, flights included.",
    eligibility: "2+ years work experience, strong academics.", requirements: "Leadership potential, bachelor's degree",
    application_link: "https://chevening.org/apply", tags: ["fully-funded", "uk", "leadership"],
  },
  {
    title: "DAAD Study Scholarships", provider: "DAAD", country: "Germany",
    category: "academic", type: "scholarship", skills: ["Research", "Engineering"], is_remote: false,
    location: "Germany", level: "masters", field: "Engineering",
    funding_type: "full", deadline: "2025-09-30",
    description: "Full scholarship for international students pursuing master's degrees at German universities.",
    eligibility: "Bachelor's degree, strong academics.", requirements: "German language preferred, research proposal",
    application_link: "https://daad.de/en", tags: ["germany", "fully-funded", "stem"],
  },
  {
    title: "Fulbright Foreign Student Program", provider: "Fulbright", country: "United States",
    category: "academic", type: "scholarship", skills: ["Research", "Leadership"], is_remote: false,
    location: "USA", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-10-11",
    description: "Prestigious US scholarship for graduate study. Full tuition, living stipend, health insurance.",
    eligibility: "Bachelor's degree, leadership.", requirements: "Research proposal, strong recommendations",
    application_link: "https://foreign.fulbrightonline.org", tags: ["usa", "prestigious", "fully-funded"],
  },
  {
    title: "Erasmus Mundus Joint Master", provider: "European Union", country: "Multiple",
    category: "academic", type: "scholarship", skills: ["Research", "Multilingual"], is_remote: false,
    location: "Europe", level: "masters", field: "Various",
    funding_type: "full", deadline: "2026-01-15",
    description: "Study at 2+ European universities. Full funding for tuition, travel, and living costs.",
    eligibility: "Bachelor's degree, any nationality.", requirements: "Academic excellence, mobility mindset",
    application_link: "https://erasmus-mundus.eu", tags: ["europe", "multi-country", "fully-funded"],
  },
  {
    title: "Mastercard Foundation Scholars", provider: "Mastercard Foundation", country: "Multiple",
    category: "academic", type: "scholarship", skills: ["Leadership", "Community"], is_remote: false,
    location: "Africa/Global", level: "undergraduate", field: "Various",
    funding_type: "full", deadline: "2025-04-30",
    description: "Transformative education for African youth. Full funding at partner universities worldwide.",
    eligibility: "African student, demonstrated need.", requirements: "Academic potential, community leadership",
    application_link: "https://mastercardfdn.org/scholars", tags: ["africa", "fully-funded", "leadership"],
  },
  {
    title: "Rhodes Scholarship", provider: "Rhodes Trust", country: "United Kingdom",
    category: "academic", type: "scholarship", skills: ["Leadership", "Academics"], is_remote: false,
    location: "Oxford", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-10-01",
    description: "Study at Oxford. The world's oldest international scholarship for outstanding leaders.",
    eligibility: "Exceptional academics + leadership.", requirements: "Top-tier academics, service, character",
    application_link: "https://rhodeshouse.ox.ac.uk", tags: ["oxford", "prestigious", "leadership"],
  },
  {
    title: "Gates Cambridge Scholarship", provider: "Gates Foundation", country: "United Kingdom",
    category: "academic", type: "scholarship", skills: ["Research", "Leadership"], is_remote: false,
    location: "Cambridge", level: "phd", field: "Various",
    funding_type: "full", deadline: "2025-10-11",
    description: "Full-cost scholarship for graduate study at Cambridge. For outstanding applicants with leadership.",
    eligibility: "Exceptional academic achievement.", requirements: "Research proposal, leadership evidence",
    application_link: "https://gatescambridge.org", tags: ["cambridge", "phd", "prestigious"],
  },
  {
    title: "MEXT Scholarship", provider: "Japanese Government", country: "Japan",
    category: "academic", type: "scholarship", skills: ["Research", "Japanese"], is_remote: false,
    location: "Japan", level: "masters", field: "Engineering",
    funding_type: "full", deadline: "2025-05-15",
    description: "Japanese government scholarship covering tuition, living expenses, and round-trip airfare.",
    eligibility: "Bachelor's degree, under 35.", requirements: "Research plan, Japanese language helpful",
    application_link: "https://mext.go.jp", tags: ["japan", "fully-funded", "research"],
  },
  {
    title: "KAIST International Scholarship", provider: "KAIST", country: "South Korea",
    category: "academic", type: "scholarship", skills: ["Engineering", "Research"], is_remote: false,
    location: "Daejeon", level: "masters", field: "Engineering",
    funding_type: "full", deadline: "2025-10-30",
    description: "Full scholarship at Korea's top science & technology university. Tuition + monthly stipend.",
    eligibility: "Strong STEM background.", requirements: "GRE, research statement, recommendations",
    application_link: "https://kaist.ac.kr", tags: ["korea", "stem", "research"],
  },
  {
    title: "Swedish Institute Scholarships", provider: "Swedish Institute", country: "Sweden",
    category: "academic", type: "scholarship", skills: ["Leadership", "Sustainability"], is_remote: false,
    location: "Sweden", level: "masters", field: "Sustainable Development",
    funding_type: "full", deadline: "2025-02-15",
    description: "Full funding for master's programs in Sweden. Focus on sustainability and innovation.",
    eligibility: "From eligible developing countries.", requirements: "Work experience, leadership",
    application_link: "https://si.se/scholarships", tags: ["sweden", "sustainability", "leadership"],
  },

  // 10 creative opportunities
  {
    title: "Sundance Institute — Feature Film Grant", provider: "Sundance Institute", country: "United States",
    category: "creative", type: "grant", skills: ["Filmmaking", "Directing", "Screenwriting"], is_remote: false,
    location: "Park City", level: "all", field: "Film",
    funding_type: "full", deadline: "2025-09-15",
    description: "Up to $25,000 for independent feature films. Includes mentorship and festival exposure.",
    eligibility: "Independent filmmaker with completed short or feature.", requirements: "Script, budget, previous work",
    application_link: "https://sundance.org/programs", tags: ["film", "grant", "indie"],
  },
  {
    title: "Adobe Creative Residency", provider: "Adobe", country: "United States",
    category: "creative", type: "creative_call", skills: ["Design", "Illustration", "Photography"], is_remote: true,
    location: "Remote", level: "all", field: "Design",
    funding_type: "full", deadline: "2025-10-01",
    description: "Year-long paid residency for creatives. $50K stipend + Adobe tools + mentorship.",
    eligibility: "Emerging creative with portfolio.", requirements: "Portfolio, project proposal, vision",
    application_link: "https://adobe.com/creativeresidency", tags: ["design", "residency", "paid"],
  },
  {
    title: "D&AD New Blood Awards", provider: "D&AD", country: "United Kingdom",
    category: "creative", type: "creative_call", skills: ["Advertising", "Design", "Creative Direction"], is_remote: true,
    location: "Global", level: "early_career", field: "Design",
    funding_type: "partial", deadline: "2025-11-15",
    description: "Global creative competition for emerging talent. Real briefs, real brands, career launchpad.",
    eligibility: "Students and recent graduates.", requirements: "Creative response to set briefs",
    application_link: "https://dandad.org/newblood", tags: ["advertising", "design", "competition"],
  },
  {
    title: "Pulitzer Center — Reporting Fellowship", provider: "Pulitzer Center", country: "United States",
    category: "creative", type: "fellowship", skills: ["Journalism", "Investigative Reporting", "Photography"], is_remote: true,
    location: "Global", level: "all", field: "Journalism",
    funding_type: "full", deadline: "2025-12-01",
    description: "Funding for underreported global stories. Up to $10,000 + editorial support.",
    eligibility: "Professional journalists and freelancers.", requirements: "Story pitch, reporting plan, samples",
    application_link: "https://pulitzercenter.org/grants", tags: ["journalism", "reporting", "grant"],
  },
  {
    title: "SXSW Film Festival — Emerging Director", provider: "SXSW", country: "United States",
    category: "creative", type: "creative_call", skills: ["Filmmaking", "Directing"], is_remote: false,
    location: "Austin", level: "all", field: "Film",
    funding_type: "partial", deadline: "2025-10-01",
    description: "Premiere your film at SXSW. Exposure to industry, distributors, and press.",
    eligibility: "First or second feature film.", requirements: "Completed film, trailer, synopsis",
    application_link: "https://sxsw.com/festivals/film", tags: ["film", "festival", "premiere"],
  },
  {
    title: "Royal Academy — Summer Exhibition", provider: "Royal Academy of Arts", country: "United Kingdom",
    category: "creative", type: "creative_call", skills: ["Fine Art", "Painting", "Sculpture"], is_remote: false,
    location: "London", level: "all", field: "Fine Arts",
    funding_type: "partial", deadline: "2025-05-01",
    description: "Submit work to the world's largest open-submission exhibition. Sell your art at the RA.",
    eligibility: "Open to all artists worldwide.", requirements: "Original artwork, max 2 submissions",
    application_link: "https://royalacademy.org.uk/exhibition", tags: ["art", "exhibition", "london"],
  },
  {
    title: "Sony World Photography Awards", provider: "World Photography Organisation", country: "United Kingdom",
    category: "creative", type: "creative_call", skills: ["Photography", "Storytelling"], is_remote: true,
    location: "Global", level: "all", field: "Photography",
    funding_type: "paid", deadline: "2025-01-15",
    description: "$25,000 grand prize. Global exposure through exhibitions and publications. 10 categories.",
    eligibility: "Open to all photographers.", requirements: "Photo series, artist statement",
    application_link: "https://worldphoto.org", tags: ["photography", "award", "global"],
  },
  {
    title: "National Geographic Explorer Grant", provider: "National Geographic", country: "United States",
    category: "creative", type: "grant", skills: ["Storytelling", "Conservation", "Exploration"], is_remote: true,
    location: "Global", level: "all", field: "Various",
    funding_type: "full", deadline: "2025-10-15",
    description: "Funding for bold people with transformative ideas. $10K-$100K for exploration and storytelling.",
    eligibility: "Individuals with innovative projects.", requirements: "Project proposal, impact plan, budget",
    application_link: "https://nationalgeographic.org/grants", tags: ["exploration", "grant", "storytelling"],
  },
  {
    title: "YouTube Creator Residency", provider: "YouTube", country: "United Kingdom",
    category: "creative", type: "creative_call", skills: ["Video Production", "Content Creation", "Storytelling"], is_remote: false,
    location: "London", level: "all", field: "Media",
    funding_type: "paid", deadline: "2025-12-31",
    description: "3-month paid residency at YouTube Space London. Production support, mentorship, equipment.",
    eligibility: "YouTube creator with 10K+ subscribers.", requirements: "Channel, content plan, growth metrics",
    application_link: "https://youtube.com/space/london", tags: ["youtube", "creator", "london"],
  },
  {
    title: "Turner Prize", provider: "Tate", country: "United Kingdom",
    category: "creative", type: "creative_call", skills: ["Contemporary Art", "Installation", "Conceptual"], is_remote: false,
    location: "UK", level: "all", field: "Fine Arts",
    funding_type: "paid", deadline: "2025-07-01",
    description: "£25,000 prize for outstanding exhibition. Most prestigious contemporary art award in the world.",
    eligibility: "British artist or artist working in UK.", requirements: "Recent exhibition or presentation",
    application_link: "https://tate.org.uk/turnerprize", tags: ["art", "prize", "prestigious"],
  },

  // 10 athletic opportunities
  {
    title: "Nike Elite Youth Basketball League", provider: "Nike", country: "United States",
    category: "athletic", type: "athletic_trial", skills: ["Basketball", "Athleticism"], is_remote: false,
    location: "Multiple US cities", level: "undergraduate", field: "Basketball",
    funding_type: "partial", deadline: "2025-09-01",
    description: "Premier grassroots basketball circuit. Scouts from NCAA and NBA attend every event.",
    eligibility: "Ages 15-19, competitive basketball experience.", requirements: "Team tryout, highlight reel",
    application_link: "https://nikeeyb.com", tags: ["basketball", "youth", "scouting"],
  },
  {
    title: "Olympic Solidarity Scholarship", provider: "IOC", country: "Multiple",
    category: "athletic", type: "scholarship", skills: ["Olympic Sport", "Coaching"], is_remote: false,
    location: "Global", level: "all", field: "Various Sports",
    funding_type: "full", deadline: "2025-12-31",
    description: "IOC funding for athletes from developing countries. Training, coaching, travel to qualifiers.",
    eligibility: "National-level athlete, Olympic potential.", requirements: "National federation nomination",
    application_link: "https://olympics.com/ioc/solidarity", tags: ["olympics", "scholarship", "athlete"],
  },
  {
    title: "La Masia — FC Barcelona Academy Trials", provider: "FC Barcelona", country: "Spain",
    category: "athletic", type: "athletic_trial", skills: ["Football", "Technical Ability"], is_remote: false,
    location: "Barcelona", level: "undergraduate", field: "Football",
    funding_type: "full", deadline: "2025-08-15",
    description: "Trial for FC Barcelona's legendary youth academy. Full scholarship for selected players.",
    eligibility: "Ages 10-18, exceptional football ability.", requirements: "Trial footage, club recommendation",
    application_link: "https://fcbarcelona.com/academy", tags: ["football", "academy", "barcelona"],
  },
  {
    title: "IMG Academy — Athletic Scholarship", provider: "IMG Academy", country: "United States",
    category: "athletic", type: "scholarship", skills: ["Tennis", "Golf", "Basketball", "Football"], is_remote: false,
    location: "Bradenton, FL", level: "undergraduate", field: "Various Sports",
    funding_type: "partial", deadline: "2025-11-01",
    description: "World-class athletic training + college prep. Produce 30+ pro athletes annually.",
    eligibility: "Demonstrated athletic excellence.", requirements: "Performance stats, coach reference, video",
    application_link: "https://imgacademy.com/admissions", tags: ["sports", "academy", "scholarship"],
  },
  {
    title: "Right to Dream Academy", provider: "Right to Dream", country: "Ghana",
    category: "athletic", type: "scholarship", skills: ["Football", "Leadership"], is_remote: false,
    location: "Accra", level: "undergraduate", field: "Football",
    funding_type: "full", deadline: "2025-09-30",
    description: "West Africa's premier football academy. Full scholarship including education at partner schools. Alumni in Premier League, Bundesliga.",
    eligibility: "West African youth, U-15.", requirements: "Trial attendance, physical assessment",
    application_link: "https://righttodream.com/academy", tags: ["football", "africa", "academy"],
  },
  {
    title: "NBA Africa Academy", provider: "NBA", country: "Senegal",
    category: "athletic", type: "scholarship", skills: ["Basketball", "Athletic Development"], is_remote: false,
    location: "Saly", level: "undergraduate", field: "Basketball",
    funding_type: "full", deadline: "2025-10-15",
    description: "NBA's elite training academy in Africa. Full scholarship, NCAA prep, NBA scouts attend.",
    eligibility: "African youth, elite basketball potential.", requirements: "Tryout, physical metrics, coach recommendation",
    application_link: "https://nbaacademyafrica.com", tags: ["basketball", "africa", "nba"],
  },
  {
    title: "Red Bull Academy — Esports", provider: "Red Bull", country: "Germany",
    category: "athletic", type: "creative_call", skills: ["Esports", "Gaming", "Team Play"], is_remote: true,
    location: "Remote/Global", level: "all", field: "Esports",
    funding_type: "paid", deadline: "2025-12-31",
    description: "Red Bull's esports talent development. Coaching, bootcamps, tournament sponsorship.",
    eligibility: "Top-ranked player in major esports title.", requirements: "Rankings, tournament results, VOD",
    application_link: "https://redbull.com/esports", tags: ["esports", "gaming", "sponsorship"],
  },
  {
    title: "Australian Institute of Sport Scholarships", provider: "AIS", country: "Australia",
    category: "athletic", type: "scholarship", skills: ["Olympic Sport", "Performance"], is_remote: false,
    location: "Canberra", level: "all", field: "Various Sports",
    funding_type: "full", deadline: "2025-09-01",
    description: "Australia's elite athlete development program. World-class facilities, coaching, sports science.",
    eligibility: "Australian citizen, national-level.", requirements: "Performance data, national ranking",
    application_link: "https://ais.gov.au/scholarships", tags: ["australia", "elite", "olympic"],
  },
  {
    title: "Generation Amazing — Football for Development", provider: "Qatar Foundation", country: "Qatar",
    category: "athletic", type: "grant", skills: ["Football", "Community", "Coaching"], is_remote: true,
    location: "Global (focus: developing nations)", level: "all", field: "Football",
    funding_type: "full", deadline: "2025-11-30",
    description: "Fund football programs that drive social change. Grants up to $50K for community football initiatives.",
    eligibility: "NGOs and community organizations.", requirements: "Program proposal, impact metrics, budget",
    application_link: "https://generationamazing.qa", tags: ["football", "community", "grant"],
  },
  {
    title: "NCAA Division I Recruitment", provider: "NCAA", country: "United States",
    category: "athletic", type: "scholarship", skills: ["Sport-specific", "Academics"], is_remote: false,
    location: "USA", level: "undergraduate", field: "Various Sports",
    funding_type: "full", deadline: "2025-12-01",
    description: "Full athletic scholarship at US universities. Combine elite sport with degree.",
    eligibility: "High school athlete, NCAA eligibility.", requirements: "GPA, SAT/ACT, highlight reel, coach contact",
    application_link: "https://ncaa.org/student-athletes", tags: ["college", "sports", "usa"],
  },

  // 10 grants/fellowships
  {
    title: "Y Combinator — Startup School Grant", provider: "Y Combinator", country: "United States",
    category: "career", type: "grant", skills: ["Startups", "Product", "Entrepreneurship"], is_remote: true,
    location: "Remote", level: "all", field: "Entrepreneurship",
    funding_type: "full", deadline: "2025-12-31",
    description: "$500K investment + 3-month accelerator. Join the world's top startup program.",
    eligibility: "Early-stage startup with traction.", requirements: "MVP, founding team, market insight",
    application_link: "https://ycombinator.com/apply", tags: ["startup", "funding", "accelerator"],
  },
  {
    title: "Schwarzman Scholars", provider: "Schwarzman Scholars", country: "China",
    category: "academic", type: "fellowship", skills: ["Leadership", "Policy"], is_remote: false,
    location: "Beijing", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-09-15",
    description: "Fully-funded master's at Tsinghua University. For future leaders in China-global relations.",
    eligibility: "Bachelor's degree, under 29.", requirements: "Leadership, English proficiency",
    application_link: "https://schwarzmanscholars.org", tags: ["china", "leadership", "fully-funded"],
  },
  {
    title: "Skoll Scholarship — Oxford", provider: "Skoll Foundation", country: "United Kingdom",
    category: "academic", type: "fellowship", skills: ["Social Entrepreneurship", "Impact"], is_remote: false,
    location: "Oxford", level: "masters", field: "Social Entrepreneurship",
    funding_type: "full", deadline: "2025-10-15",
    description: "Full funding for Oxford MBA for social entrepreneurs. Join a global network of changemakers.",
    eligibility: "Social enterprise founder/leader.", requirements: "Social impact evidence, business acumen",
    application_link: "https://skollscholarship.org", tags: ["oxford", "social-impact", "fully-funded"],
  },
  {
    title: "Knight-Hennessy Scholars", provider: "Stanford University", country: "United States",
    category: "academic", type: "fellowship", skills: ["Leadership", "Innovation"], is_remote: false,
    location: "Stanford", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-10-01",
    description: "Full funding for any graduate program at Stanford. Leadership development + global community.",
    eligibility: "Applying to Stanford grad program.", requirements: "Leadership, independence of thought",
    application_link: "https://knight-hennessy.stanford.edu", tags: ["stanford", "leadership", "fully-funded"],
  },
  {
    title: "Thiel Fellowship", provider: "Thiel Foundation", country: "United States",
    category: "career", type: "fellowship", skills: ["Entrepreneurship", "Innovation"], is_remote: true,
    location: "Remote", level: "undergraduate", field: "Entrepreneurship",
    funding_type: "full", deadline: "2025-12-31",
    description: "$100,000 to skip college and build something. For young people who want to build new things.",
    eligibility: "Under 23, not enrolled in college.", requirements: "Bold idea, execution ability",
    application_link: "https://thielfellowship.org", tags: ["startup", "fellowship", "founder"],
  },
  {
    title: "Echoing Green Fellowship", provider: "Echoing Green", country: "United States",
    category: "career", type: "fellowship", skills: ["Social Impact", "Leadership"], is_remote: true,
    location: "Global", level: "all", field: "Social Impact",
    funding_type: "full", deadline: "2025-10-01",
    description: "$80K seed funding + leadership development for social entrepreneurs. 2-year fellowship.",
    eligibility: "Early-stage social enterprise founder.", requirements: "Impact model, founder story, traction",
    application_link: "https://echoinggreen.org/fellowship", tags: ["social-impact", "fellowship", "seed"],
  },
  {
    title: "Mozilla Fellows — Tech + Society", provider: "Mozilla Foundation", country: "Multiple",
    category: "career", type: "fellowship", skills: ["Open Source", "Internet Health", "Policy"], is_remote: true,
    location: "Remote", level: "all", field: "Technology",
    funding_type: "full", deadline: "2025-11-30",
    description: "Paid fellowship working on internet health. Open source, privacy, AI ethics, digital rights.",
    eligibility: "Technologist, activist, or researcher.", requirements: "Project proposal, open source experience",
    application_link: "https://foundation.mozilla.org/fellowships", tags: ["open-source", "internet", "fellowship"],
  },
  {
    title: "Ashoka Fellowship", provider: "Ashoka", country: "Multiple",
    category: "career", type: "fellowship", skills: ["Social Entrepreneurship", "Systems Change"], is_remote: true,
    location: "Global", level: "mid_career", field: "Social Entrepreneurship",
    funding_type: "partial", deadline: "2025-12-31",
    description: "Lifetime membership in the world's largest network of social entrepreneurs. Stipend + community.",
    eligibility: "Proven social entrepreneur with impact.", requirements: "Systems change approach, track record",
    application_link: "https://ashoka.org/fellowship", tags: ["social-impact", "fellowship", "lifetime"],
  },
  {
    title: "Acumen Fellowship", provider: "Acumen Academy", country: "Multiple",
    category: "career", type: "fellowship", skills: ["Social Impact", "Leadership"], is_remote: true,
    location: "Global", level: "mid_career", field: "Social Impact",
    funding_type: "partial", deadline: "2025-09-30",
    description: "Year-long leadership program for social change leaders. Build moral imagination and practical skills.",
    eligibility: "Social change practitioner, 5+ yrs experience.", requirements: "Track record, community, vision",
    application_link: "https://acumenacademy.org/fellowship", tags: ["social-impact", "leadership", "global"],
  },
  {
    title: "Obama Foundation Scholars", provider: "Obama Foundation", country: "United States",
    category: "academic", type: "fellowship", skills: ["Leadership", "Public Service"], is_remote: false,
    location: "New York / Chicago", level: "masters", field: "Various",
    funding_type: "full", deadline: "2025-10-15",
    description: "Full scholarship + leadership training at Columbia or UChicago. For emerging global leaders.",
    eligibility: "Proven commitment to public service.", requirements: "Leadership experience, community impact",
    application_link: "https://obama.org/scholars", tags: ["leadership", "fellowship", "public-service"],
  },
];

async function seed() {
  console.log(`Seeding ${opportunities.length} opportunities...`);

  // Clear existing data
  await supabase.from("swipes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("user_documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("scholarships").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const records = opportunities.map((o) => ({
    id: uuidv4(),
    ...o,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("scholarships").insert(records as any);

  if (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }

  // Summary
  const categories = {} as Record<string, number>;
  records.forEach((r) => {
    categories[r.category] = (categories[r.category] || 0) + 1;
  });

  console.log(`✓ Seeded ${records.length} opportunities:`);
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  process.exit(0);
}

seed();
