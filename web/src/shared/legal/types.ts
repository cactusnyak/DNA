export type ServiceStatus = 'active' | 'planned' | 'notConfigured' | 'requiresReview';

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  path: string;
  title: string;
  description: string;
  revisionDate: string;
  sections: LegalSection[];
};

