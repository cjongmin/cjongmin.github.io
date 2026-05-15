// ============================================================
// EDIT THIS FILE to manage your publications.
//
// Fields:
//   id       — unique string key (used internally)
//   title    — full paper title
//   authors  — array; your name will be highlighted automatically
//   venue    — conference/journal short name (e.g. "NeurIPS", "CVPR")
//   year     — publication year (number)
//   order    — within the same year, lower = shown first
//   image    — optional: path under /public (e.g. "/publications/paper1.jpg")
//   tags     — optional topic tags
//   links    — optional; omit any key that doesn't exist for this paper
//   bibtex   — optional; if present a BibTeX button appears
// ============================================================

export interface PublicationLink {
  paper?: string
  scholar?: string
  code?: string
  project?: string
}

export interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  year: number
  order: number
  image?: string
  tags?: string[]
  links?: PublicationLink
  bibtex?: string
}

export const publications: Publication[] = [
  {
    id: 'vlm-reasoning-2025',
    title: 'Enhancing Visual Reasoning in Large Vision-Language Models via Chain-of-Thought Grounding',
    authors: ['Jongmin Choi', 'Seokhyun Park', 'Yuna Kim', 'Hyunwoo J. Kim'],
    venue: 'NeurIPS',
    year: 2025,
    order: 1,
    image: '/publications/vlm-reasoning.jpg',
    tags: ['Vision-Language Models', 'Visual Reasoning', 'Chain-of-Thought'],
    links: {
      paper: 'https://arxiv.org/abs/2500.00001',
      scholar: 'https://scholar.google.com/scholar?q=example',
      code: 'https://github.com/YOUR_USERNAME/vlm-reasoning',
      project: 'https://vlm-reasoning.github.io',
    },
    bibtex: `@inproceedings{choi2025vlmreasoning,
  title     = {Enhancing Visual Reasoning in Large Vision-Language Models via Chain-of-Thought Grounding},
  author    = {Choi, Jongmin and Park, Seokhyun and Kim, Yuna and Kim, Hyunwoo J.},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2025}
}`,
  },
  {
    id: 'multimodal-align-2025',
    title: 'Fine-Grained Cross-Modal Alignment for Robust Multimodal Representation Learning',
    authors: ['Jongmin Choi', 'Minji Lee', 'Taehoon Kim'],
    venue: 'ICCV',
    year: 2025,
    order: 2,
    tags: ['Multimodal Learning', 'Contrastive Learning', 'Representation Learning'],
    links: {
      paper: 'https://arxiv.org/abs/2500.00002',
      code: 'https://github.com/YOUR_USERNAME/multimodal-align',
    },
    bibtex: `@inproceedings{choi2025multimodalalign,
  title     = {Fine-Grained Cross-Modal Alignment for Robust Multimodal Representation Learning},
  author    = {Choi, Jongmin and Lee, Minji and Kim, Taehoon},
  booktitle = {Proceedings of the IEEE/CVF International Conference on Computer Vision},
  year      = {2025}
}`,
  },
  {
    id: 'hci-llm-2025',
    title: 'Towards Explainable Human-AI Interaction: Surfacing Model Uncertainty in Conversational Agents',
    authors: ['Jongmin Choi', 'Soyeon Park', 'Junho Lee', 'Jinwoo Shin'],
    venue: 'ACL',
    year: 2025,
    order: 3,
    tags: ['Human-AI Interaction', 'Explainability', 'LLM'],
    links: {
      paper: 'https://arxiv.org/abs/2500.00003',
      scholar: 'https://scholar.google.com/scholar?q=example2',
    },
    bibtex: `@inproceedings{choi2025hcillm,
  title     = {Towards Explainable Human-AI Interaction: Surfacing Model Uncertainty in Conversational Agents},
  author    = {Choi, Jongmin and Park, Soyeon and Lee, Junho and Shin, Jinwoo},
  booktitle = {Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics},
  year      = {2025}
}`,
  },
  {
    id: 'clip-adapt-2024',
    title: 'Parameter-Efficient Adaptation of CLIP for Domain-Specific Vision-Language Tasks',
    authors: ['Jongmin Choi', 'Hyunwoo J. Kim'],
    venue: 'EMNLP',
    year: 2024,
    order: 1,
    tags: ['CLIP', 'Parameter-Efficient Fine-Tuning', 'Vision-Language'],
    links: {
      paper: 'https://arxiv.org/abs/2400.00001',
      code: 'https://github.com/YOUR_USERNAME/clip-adapt',
    },
    bibtex: `@inproceedings{choi2024clipadapt,
  title     = {Parameter-Efficient Adaptation of CLIP for Domain-Specific Vision-Language Tasks},
  author    = {Choi, Jongmin and Kim, Hyunwoo J.},
  booktitle = {Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing},
  year      = {2024}
}`,
  },
]

// Venue categories for the filter bar.
// The "All" filter is added automatically.
// Each entry maps a display label to the venue strings it covers.
export const venueCategories: Record<string, string[]> = {
  'NLP / LLM': ['ACL', 'EMNLP', 'NAACL', 'ICLR'],
  'Vision': ['CVPR', 'ICCV', 'ECCV'],
  'General ML': ['NeurIPS', 'ICML', 'ICLR'],
}
