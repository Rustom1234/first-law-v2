import type { ResumeData } from './types';

/**
 * Real content, pulled from your June 2026 resume. A few things marked TODO below
 * are gaps the resume doesn't cover (course lists, GPA on two entries, an abstract,
 * a couple of links): fill those in whenever. Everything else here is drawn
 * directly from what you sent, not invented.
 *
 * NOTE: your phone number was on the resume but is deliberately left off this
 * public site (spam/privacy default): email, LinkedIn, and GitHub are on the page.
 * Say the word if you'd rather have it listed.
 */
export const resume: ResumeData = {
  profile: {
    name: 'Rustom Dubash',
    tagline: 'AI engineer. Builder. Lifelong fantasy reader.',
    portrait: undefined, // TODO: path to a portrait image, e.g. "/portrait.jpg"
    bio: [
      "I'm a computer science and economics student at Haverford College, submatriculating into a master's at Penn, currently building AI agent pipelines as an AI Solutions Engineer at ContinuServe. Most of what I work on lives at the intersection of machine learning and systems people actually use: financial agents, sequence models, dashboards someone really opens.",
      "Outside of that: I play guitar badly but happily, and I play cricket for Haverford's varsity team, mostly batting, occasional off-spin when no one else wants to bowl.",
      "And yes, I am exactly enough of a fantasy book nerd that a personal resume site like this felt like the only honest way to build one. The ash in the War chapter, the small glowing companions riding along the progress track, the waystones on the Education plateau, a Red Rising nod or two if you're looking: you were meant to notice. This whole thing is a love letter to the books that got me through finals weeks.",
    ],
    email: 'rustommdubash@gmail.com',
    links: [
      { label: 'Email', url: 'mailto:rustommdubash@gmail.com' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/rustom-dubash' },
      { label: 'GitHub', url: 'https://github.com/Rustom1234' },
    ],
    resumeUrl: '/resume.pdf',
  },

  experience: [
    {
      title: 'AI Solutions Engineer Intern',
      org: 'ContinuServe',
      logo: undefined, // TODO: "/logos/continuserve.png"
      period: 'June 2026 – Present',
      blurb:
        'Building a Financial Intelligence Agent on a 4-agent pipeline (data collection, anomaly analysis, executive KPI reporting, and a semantic-retrieval accounting assistant), integrating vector databases and LLM APIs to automate P&L and balance-sheet reporting.',
      tags: ['LLM Agents', 'Vector DBs', 'OpenAI/Claude APIs'],
    },
    {
      title: 'Teaching Assistant, Intro to CS & Data Science',
      org: 'Haverford College',
      logo: undefined, // TODO: "/logos/haverford.png"
      period: 'Sept 2025 – Jan 2026',
      blurb: 'Held weekly office hours supporting 80+ students learning Python, algorithms, and data analysis.',
      tags: ['Python', 'Teaching'],
    },
    {
      title: "Applied Data Institute Scholar '25",
      org: 'Equitech Futures',
      logo: undefined, // TODO: "/logos/equitech-futures.png"
      period: 'Sept 2025 – Dec 2025',
      blurb:
        'One of 16 fellows in a fully-funded global fellowship; built KPI dashboards and a RAG chatbot for water-utility managers across Uganda, Cameroon, Lesotho, and Malawi, impacting 5M+ citizens.',
      tags: ['RAG', 'ChromaDB', 'Dashboards'],
    },
    {
      title: 'Machine Learning Researcher',
      org: 'Mathieson Lab, Haverford College',
      logo: undefined, // TODO: "/logos/haverford.png"
      period: 'May 2025 – Aug 2025',
      blurb:
        'Trained Transformer and long-context sequence models (including HyenaDNA-style sparse attention) in PyTorch on a 21GB genomic corpus, extending context length 12x over baseline Transformers.',
      tags: ['PyTorch', 'Transformers'],
    },
    {
      title: 'Research Assistant, Dept. of Economics',
      org: 'National University of Singapore',
      logo: undefined, // TODO: "/logos/nus.png"
      period: 'June 2024 – Aug 2024',
      blurb:
        'Led data compilation and built web-scraping pipelines extracting 10K+ records for a study on salary incentives and political corruption in Indian state legislatures.',
      tags: ['Data', 'Web Scraping'],
    },
  ],

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
      period: 'Incoming',
      blurb: 'Graduate-level coursework completed concurrently with undergraduate study at Haverford.',
      gpa: undefined, // TODO
      coursework: [], // TODO: add course list
    },
    {
      title: 'BSc Computer Science and Economics',
      org: 'Haverford College',
      period: 'Graduation: May 2027',
      blurb: 'Varsity Cricket Team.',
      gpa: '3.93 / 4.0',
      coursework: [], // TODO: add course list
    },
    {
      title: 'Study Abroad',
      org: 'AIT Budapest (Aquincum Institute of Technology)',
      period: 'TODO: dates',
      blurb: 'TODO: a line on the semester (what you studied, what stuck with you).',
      gpa: undefined,
      coursework: [], // TODO: add course list
    },
  ],

  paper: {
    title: 'Self-Promotion in LLM Recommendations',
    venue: "18th ACM Web Science Conference (WebSci '26)",
    date: 'May 26 to 29, 2026 · Braunschweig, Germany',
    authors: 'Rustom M. Dubash, Sorelle A. Friedler',
    abstract: 'TODO: one or two sentences on what the paper is about and what it found.',
    link: undefined, // TODO: ACM DOI / arXiv link once available
  },
};
