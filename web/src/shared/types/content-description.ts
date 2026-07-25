export type ContentDescriptionBlock = {
  type: 'heading' | 'paragraph';
  text: string;
};

export type ContentDescription = {
  blocks: ContentDescriptionBlock[];
};
