// ============================================================
// EDIT THIS FILE to manage your experience / timeline entries.
// ============================================================

export interface Experience {
  id: string
  title: string
  organization: string
  location: string
  startDate: string   // e.g. "Sep 2023"
  endDate: string     // e.g. "Present"
  description: string
  tags?: string[]
  link?: string
}

export const experiences: Experience[] = [
  {
    id: 'ms-mmai',
    title: 'MS Student in Multimodal AI',
    organization: 'MMAI Lab, Your University',
    location: 'Seoul, South Korea',
    startDate: 'Sep 2023',
    endDate: 'Present',
    description:
      'Conducting research on vision-language models and multimodal representation learning. Advised by Prof. [Advisor Name]. Working on improving cross-modal reasoning and alignment in large foundation models.',
    tags: ['Vision-Language Models', 'Multimodal AI', 'Research'],
    link: 'https://your-lab-website.com',
  },
  {
    id: 'intern-kaist',
    title: 'Research Intern',
    organization: 'AI Research Institute',
    location: 'Seoul, South Korea',
    startDate: 'Jun 2023',
    endDate: 'Aug 2023',
    description:
      'Worked on parameter-efficient fine-tuning of large language models for domain adaptation. Contributed to internal benchmarking infrastructure and model evaluation pipelines.',
    tags: ['LLM', 'Fine-Tuning', 'NLP'],
  },
  {
    id: 'undergrad-ra',
    title: 'Undergraduate Research Assistant',
    organization: 'Computer Vision Lab, Your University',
    location: 'Seoul, South Korea',
    startDate: 'Mar 2022',
    endDate: 'Aug 2023',
    description:
      'Assisted with experiments on image-text contrastive learning and dataset curation. Implemented baseline models and reproduced results from recent CLIP-based papers.',
    tags: ['CLIP', 'Contrastive Learning', 'Computer Vision'],
  },
  {
    id: 'bs',
    title: 'Bachelor of Science in Computer Science',
    organization: 'Your University',
    location: 'Seoul, South Korea',
    startDate: 'Mar 2019',
    endDate: 'Aug 2023',
    description: 'Graduated with honors. Coursework in machine learning, computer vision, and natural language processing.',
    tags: ['B.S. Computer Science'],
  },
]
