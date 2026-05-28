export interface Milestone {
  title: string;
  desc: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  milestoneType: 'Academic' | 'Project' | 'Skill' | 'Internship' | 'Placement';
}

export interface CareerRoadmap {
  role: string;
  branch: string;
  expectedSalaries: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  years: {
    year1: Milestone[];
    year2: Milestone[];
    year3: Milestone[];
    year4: Milestone[];
  };
}

export const ROADMAP_TEMPLATES: { [key: string]: CareerRoadmap } = {
  'software-engineer': {
    role: 'Software Engineer',
    branch: 'Computer Science & Engineering',
    expectedSalaries: {
      tier1: '18 - 35 LPA (IIT/NIT/BITS)',
      tier2: '8 - 15 LPA (Top State/Private)',
      tier3: '4 - 7 LPA (Standard Service)'
    },
    years: {
      year1: [
        {
          title: 'Foundations of Programming',
          desc: 'Master coding fundamentals and object-oriented paradigms.',
          skills: ['C++', 'Python', 'Object-Oriented Programming (OOP)'],
          certifications: ['HackerRank Problem Solving Badge'],
          projects: ['CommandLine Calculator', 'Library Records system'],
          milestoneType: 'Academic'
        },
        {
          title: 'Basic Algorithms',
          desc: 'Understand complexity limits and foundational memory structures.',
          skills: ['Data Structures (Arrays, Lists, Stacks)', 'Big O Notation'],
          certifications: [],
          projects: ['Interactive Student Contact Directory'],
          milestoneType: 'Skill'
        }
      ],
      year2: [
        {
          title: 'Advanced DSA & Web Development',
          desc: 'Solve complex problems and build responsive fullstack web apps.',
          skills: ['Trees, Graphs, Dynamic Programming', 'React.js', 'Node.js', 'Express', 'PostgreSQL'],
          certifications: ['Meta Front-End Developer Certificate'],
          projects: ['Responsive SaaS Discovery Panel', 'Realtime Chat Application'],
          milestoneType: 'Skill'
        },
        {
          title: 'Databases & System Design',
          desc: 'Design relational tables and microservices.',
          skills: ['Database Normalization', 'SQL Queries', 'Docker Basics'],
          certifications: [],
          projects: ['E-Commerce Backend API'],
          milestoneType: 'Project'
        }
      ],
      year3: [
        {
          title: 'Cloud Systems & Industry Projects',
          desc: 'Deploy platforms to cloud clusters and match real company scale.',
          skills: ['AWS (S3, EC2)', 'Kubernetes', 'CI/CD Pipelines'],
          certifications: ['AWS Certified Developer - Associate'],
          projects: ['Distributed Task Scheduler Client', 'Serverless Media Transcoder'],
          milestoneType: 'Project'
        },
        {
          title: 'Pre-Placement Internships',
          desc: 'Secure summer engineering internships and participate in hackathons.',
          skills: ['System Design (HLD/LLD)', 'Mock Coding Audits', 'LeetCode (300+ Solved)'],
          certifications: [],
          projects: ['Open Source contributions to Next.js/Prisma'],
          milestoneType: 'Internship'
        }
      ],
      year4: [
        {
          title: 'Cracking Placements & High-Level System Design',
          desc: 'Optimize microservices performance, prepare behavioral HR profiles, and crack premium placements.',
          skills: ['Distributed Caching (Redis)', 'Message Brokers (Kafka)', 'System Scalability'],
          certifications: [],
          projects: ['Production-Grade Ad bidding Network'],
          milestoneType: 'Placement'
        }
      ]
    }
  },
  'data-scientist': {
    role: 'Data Scientist',
    branch: 'Data Science / AI & ML',
    expectedSalaries: {
      tier1: '20 - 40 LPA (Tier 1)',
      tier2: '9 - 18 LPA (Tier 2)',
      tier3: '5 - 8 LPA (Tier 3)'
    },
    years: {
      year1: [
        {
          title: 'Linear Algebra & Python',
          desc: 'Master the mathematical foundations of vector spaces and numeric programming.',
          skills: ['Python Coding', 'NumPy', 'Pandas Basics', 'Calculus & Vectors'],
          certifications: ['Coursera Linear Algebra Certificate'],
          projects: ['Scientific Math Solver Script', 'Data Aggregations Panel'],
          milestoneType: 'Academic'
        }
      ],
      year2: [
        {
          title: 'Data Wrangling & Statistical Inference',
          desc: 'Gather, clean, and visualize statistical insights from messy public datasets.',
          skills: ['Data Cleaning', 'Matplotlib / Seaborn', 'Probability & Hypotheses'],
          certifications: ['Google Data Analytics Professional Certificate'],
          projects: ['Exploratory Data Analysis (EDA) of NIRF Datasets'],
          milestoneType: 'Skill'
        }
      ],
      year3: [
        {
          title: 'Machine Learning Models & Deep Learning',
          desc: 'Build, tune, and evaluate predictive machine learning algorithms.',
          skills: ['Scikit-Learn', 'Regression & Decision Trees', 'TensorFlow / PyTorch basics'],
          certifications: ['DeepLearning.AI TensorFlow Developer'],
          projects: ['Predictive Admissions Placement Engine', 'Fuzzy Text Similarity Parser'],
          milestoneType: 'Project'
        }
      ],
      year4: [
        {
          title: 'MLOps, LLMs & Big Data Analytics',
          desc: 'Deploy ML algorithms to live API servers and manage heavy Spark datasets.',
          skills: ['MLflow', 'Docker', 'Apache Spark', 'LLM Prompt Engineering'],
          certifications: [],
          projects: ['Dynamic Real-Time Recommender System'],
          milestoneType: 'Placement'
        }
      ]
    }
  },
  'product-manager': {
    role: 'Product Manager',
    branch: 'Management / MBA / Tech',
    expectedSalaries: {
      tier1: '22 - 38 LPA (IIM/IIT)',
      tier2: '10 - 18 LPA (Top B-Schools)',
      tier3: '5 - 9 LPA (Standard MBA)'
    },
    years: {
      year1: [
        {
          title: 'Business & Tech Foundations',
          desc: 'Understand corporate operations, finance, and software lifecycles.',
          skills: ['Agile Methodologies', 'Scrum Principles', 'Basic UI/UX design (Figma)'],
          certifications: ['Professional Scrum Master I (PSM I)'],
          projects: ['SaaS App Feature Wireframe', 'Competitive Product Analysis'],
          milestoneType: 'Academic'
        }
      ],
      year2: [
        {
          title: 'Product Analytics & Metrics',
          desc: 'Define and track user acquisition, retention, and growth metrics.',
          skills: ['A/B Testing', 'Google Analytics', 'SQL for Data Extraction'],
          certifications: ['Product Management Certificate (Pragmatic)'],
          projects: ['User Retention Improvement proposal for a SaaS app'],
          milestoneType: 'Skill'
        }
      ],
      year3: [
        {
          title: 'Product Strategy & Roadmap',
          desc: 'Design strategic roadmaps, manage backlogs, and write detailed PRDs.',
          skills: ['Product Requirement Documents (PRD)', 'Jira', 'Roadmap tools'],
          certifications: [],
          projects: ['Complete PRD for a Peer-to-Peer College Discovery system'],
          milestoneType: 'Project'
        }
      ],
      year4: [
        {
          title: 'Mock Case Competitions & Placements',
          desc: 'Prepare product execution and business strategy case studies to crack top-tier PM hires.',
          skills: ['Business Case Interviews', 'Market Sizing estimations', 'Growth Hacking'],
          certifications: [],
          projects: ['National Case Competition Winning Deck'],
          milestoneType: 'Placement'
        }
      ]
    }
  }
};

export function generateRoadmap(roleKey: string, branch: string, college: string): CareerRoadmap {
  const base = ROADMAP_TEMPLATES[roleKey] || ROADMAP_TEMPLATES['software-engineer'];
  return {
    ...base,
    branch: branch || base.branch,
    role: base.role
  };
}
