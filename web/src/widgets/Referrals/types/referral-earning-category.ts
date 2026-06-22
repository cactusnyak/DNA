import type { LucideIcon } from 'lucide-react';

export type ReferralEarningCategoryId =
  | 'personal-cashback'
  | 'referral-income'
  | 'drop-income';

export type ReferralEarningCategory = {
  id: ReferralEarningCategoryId;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  details: {
    title: string;
    paragraphs: string[];
    examples: string[];
  };
};