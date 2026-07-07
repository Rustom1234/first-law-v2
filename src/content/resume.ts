import type { ResumeData } from './types';

/**
 * Real content. A few things marked TODO are still gaps: an updated resume with more
 * complete experience/project details is coming soon, at which point this file gets a
 * real pass. Until then this is deliberately honest about what's known vs. placeholder.
 *
 * NOTE: a phone number is intentionally left off this public site (spam/privacy
 * default): email, LinkedIn, and GitHub are on the page. Say the word if you'd
 * rather have it listed.
 *
 * Logos/images: university crests and city imagery are original, generated assets
 * (not scraped photos or official branding). Employer logos are NOT invented here;
 * those stay as initials placeholders until you supply the real files.
 */
export const resume: ResumeData = {
  profile: {
    name: 'Rustom Dubash',
    tagline: 'Computer Science @ Haverford and University of Pennsylvania',
    portrait: undefined, // TODO: path to a portrait image, e.g. "/portrait.jpg"
    bio: [
      "I'm a computer science student at Haverford College and the University of Pennsylvania, with experience in AI and computational biology research. My interests sit at memory-efficient ML, computational biology, and AI safety.",
      'Outside of that: varsity cricket, guitar, and entirely too much fantasy fiction, hence the website.',
    ],
    email: 'rustommdubash@gmail.com',
    links: [
      { label: 'Email', url: 'mailto:rustommdubash@gmail.com' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/rustom-dubash' },
      { label: 'GitHub', url: 'https://github.com/Rustom1234' },
    ],
    resumeUrl: '/resume.pdf',
  },

  // TODO(rustom): a fuller resume is coming; ContinuServe/Equitech/Mathieson Lab/NUS
  // below are real (from the June 2026 resume), UNMC and SpaceKnow are new entries
  // you named but haven't detailed yet, placeholder until the update lands.
  experience: [
    {
      title: 'AI Solutions Engineer Intern',
      org: 'ContinuServe',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'June 2026 – Present',
      blurb: 'Building a Financial Intelligence Agent (4-agent pipeline) automating P&L and balance-sheet reporting.',
      tags: ['LLM Agents', 'Vector DBs', 'OpenAI/Claude APIs'],
    },
    {
      title: 'TODO: role title',
      org: 'UNMC',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'TODO: dates',
      blurb: 'TODO: one-line description, pending the updated resume.',
      tags: ['TODO'],
    },
    {
      title: "Applied Data Institute Scholar '25",
      org: 'Equitech Futures',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'Sept 2025 – Dec 2025',
      blurb:
        'One of 16 fellows in a fully-funded global fellowship; built KPI dashboards and a RAG chatbot for water-utility managers across Uganda, Cameroon, Lesotho, and Malawi, impacting 5M+ citizens.',
      tags: ['RAG', 'ChromaDB', 'Dashboards'],
    },
    {
      title: 'Machine Learning Researcher',
      org: 'Mathieson Lab, Haverford College',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'May 2025 – Aug 2025',
      blurb:
        'Trained Transformer and long-context sequence models (including HyenaDNA-style sparse attention) in PyTorch on a 21GB genomic corpus, extending context length 12x over baseline Transformers.',
      tags: ['PyTorch', 'Transformers'],
    },
    {
      title: 'Research Assistant, Dept. of Economics',
      org: 'National University of Singapore',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'June 2024 – Aug 2024',
      blurb:
        'Led data compilation and built web-scraping pipelines extracting 10K+ records for a study on salary incentives and political corruption in Indian state legislatures.',
      tags: ['Data', 'Web Scraping'],
    },
    {
      title: 'TODO: role title',
      org: 'SpaceKnow',
      logo: undefined, // TODO: real company logo file, not invented here
      period: 'TODO: dates',
      blurb: 'TODO: one-line description, pending the updated resume.',
      tags: ['TODO'],
    },
  ],

  // GeoCNN, Outreach Desk, and Citation Graph Forecasting exist on GitHub but are
  // still private: make them public from GitHub Settings > General > Danger Zone
  // (or `gh repo edit --visibility public` from an authenticated machine) for the
  // links below to resolve. PINN has no matching repo under this account yet.
  projects: [
    {
      title: 'Residual-Boosted Transformer Ensembles',
      image: undefined, // TODO: "/projects/residual-boosted.jpg"
      blurb:
        'Residual boosting over ensemble logits with weak Transformers: 93% accuracy on Yelp Polarity with a 10M-parameter budget (SOTA: 98% at 355M).',
      tags: ['TensorFlow', 'Ensembling'],
      link: 'https://github.com/Rustom1234/residual-boosted-transformers',
    },
    {
      title: 'Morphology-Focused Learning for Histopathology',
      image: undefined, // TODO: "/projects/histopathology.jpg"
      blurb:
        'Used Grad-CAM to diagnose spurious color/stain correlations in a histopathology CNN, then trained a morphology-focused model matching RGB performance in grayscale (0.84 acc).',
      tags: ['TensorFlow', 'Grad-CAM'],
      link: 'https://github.com/Rustom1234/morphology-focused-adversarial-defense-histopathology',
    },
    {
      title: 'Financial Sentiment Stock Predictor',
      image: undefined, // TODO: "/projects/stock-predictor.jpg"
      blurb:
        'FinBERT + VADER sentiment across 50k+ headlines feeding an XGBoost model to predict next-day stock returns, with automated yfinance ingestion and backtesting.',
      tags: ['XGBoost', 'FinBERT'],
      link: undefined, // TODO: add repo link if public
    },
    {
      title: 'T20 Cricket Score Predictor',
      image: undefined, // TODO: "/projects/t20-predictor.jpg"
      blurb:
        'A Flask + React app predicting live T20 first-innings scores from an XGBoost pipeline trained on ball-by-ball data.',
      tags: ['Flask', 'React', 'XGBoost'],
      link: 'https://github.com/Rustom1234/t20-score-predictor',
    },
    {
      title: 'Sparse-Attention Hyena',
      image: undefined, // TODO: "/projects/sparse-attention-hyena.jpg"
      blurb: 'TODO: one-line description of this one beyond the Mathieson Lab work above.',
      tags: ['PyTorch', 'Sparse Attention'],
      link: 'https://github.com/Rustom1234/sparse-attention-hyena',
    },
    {
      title: 'GeoCNN',
      image: undefined, // TODO: repo has real matplotlib figures (confusion matrices, accuracy bar chart) but on a white background; restyle or crop to fit the dark theme
      blurb: 'CLIP-embedding + MLP classifier that geolocates Street View photos into 211 world regions, reaching ~90% continent-level accuracy.',
      tags: ['CLIP', 'Geolocation'],
      link: 'https://github.com/Rustom1234/GeoCNN', // TODO: repo is currently private, make it public
    },
    {
      title: 'Outreach Desk',
      image: '/projects/outreach-desk.svg',
      blurb: 'A configurable four-stage cold-outreach pipeline (research, draft, QA-filter, deliver) that personalizes messages via Claude and blocks AI-slop phrasing.',
      tags: ['LLM Pipeline', 'Automation'],
      link: 'https://github.com/Rustom1234/outreach-desk', // TODO: repo is currently private, make it public
    },
    {
      title: 'PINN',
      image: '/projects/pinn.svg',
      blurb: 'A physics-informed neural network project (repo not yet public under this account, so details are TODO once pushed).',
      tags: ['PyTorch', 'Physics-Informed ML'],
      link: undefined, // TODO: no matching repo found on GitHub yet; add the real link once it's pushed
    },
    {
      title: 'Citation Graph Forecasting',
      image: undefined, // TODO: repo has real matplotlib figures (pred-vs-actual, feature importance, error breakdowns) but on a white background; restyle or crop to fit the dark theme
      blurb: 'Forecasts a paper’s future citations from an OpenAlex citation graph using leakage-audited temporal features and an XGBoost baseline (Spearman 0.70).',
      tags: ['XGBoost', 'Graph ML'],
      link: 'https://github.com/Rustom1234/citation-graph-forecasting', // TODO: repo is currently private, make it public
    },
    {
      title: 'CardDeckEncoderDecoder',
      image: undefined, // TODO: "/projects/card-deck.jpg"
      blurb: 'TODO: one-line description.',
      tags: ['TODO'],
      link: 'https://github.com/Rustom1234/CardDeckEncoderDecoder',
    },
    {
      title: 'Connect4Bot',
      image: undefined, // TODO: "/projects/connect4bot.jpg"
      blurb: 'TODO: one-line description (what approach does the bot use?).',
      tags: ['TODO'],
      link: 'https://github.com/Rustom1234/Connect4Bot',
    },
  ],

  education: [
    {
      title: 'MSE, Computer and Information Science (Submatriculation)',
      org: 'University of Pennsylvania',
      logo: '/logos/upenn.svg',
      period: 'Incoming',
      blurb: 'Graduate-level coursework completed concurrently with undergraduate study at Haverford.',
      gpa: undefined,
      coursework: [],
    },
    {
      title: 'Study Abroad',
      org: 'AIT Budapest (Aquincum Institute of Technology)',
      logo: '/logos/ait-budapest.svg',
      period: 'TODO: dates',
      blurb: 'A semester studying in Budapest.',
      gpa: undefined,
      coursework: ['Combinatorial Optimization', 'Deep Learning', 'Applied Cryptography'],
    },
    {
      title: 'BSc Computer Science and Economics',
      org: 'Haverford College',
      logo: undefined, // TODO: optional Haverford crest
      period: 'Graduation: May 2027',
      blurb: 'Varsity Cricket Team.',
      gpa: '3.93 / 4.0',
      coursework: [
        'ECON 105 (Intro to Economics)',
        'ECON 201 (Analytical Methods for Economics)',
        'ECON 203 (Statistical Methods in Economics)',
        'MATH 118 (Calculus: Dynamics and Integration)',
        'MATH 121 (Multivariable Calculus)',
        'CS 106 (Introduction to Data Structures)',
        'CS 231 (Discrete Mathematics)',
        'CS 260 (Foundations of Data Science)',
        'CS 340 (Analysis of Algorithms)',
        'CS 360 (Machine Learning)',
        'BIO 104 (Introduction to Programming in Biology)',
      ],
    },
    {
      title: 'High School Diploma',
      org: 'UWCSEA Dover',
      logo: '/logos/uwc.svg',
      period: 'TODO: dates',
      blurb: 'United World College South East Asia, Dover campus.',
      gpa: undefined,
      coursework: [],
    },
  ],

  paper: {
    title: 'Self-Promotion in LLM Recommendations',
    venue: "18th ACM Web Science Conference (WebSci '26)",
    date: 'May 26 to 29, 2026 · Braunschweig, Germany',
    authors: 'Rustom M. Dubash, Sorelle A. Friedler',
    abstract:
      "An audit of OpenAI, Anthropic, and Google's LLM recommendation behavior, comparing each provider's self-rankings against real benchmark performance across coding, math, and reasoning tasks. Found consistent self-promotional bias in all three, with OpenAI showing the strongest tendency to rank its own models above what benchmarks would justify.",
    link: 'https://doi.org/10.1145/3795766.3799780',
    image: undefined, // TODO: the paper's main graph/figure, supplied by the user
  },
};
