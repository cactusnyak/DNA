import { Injectable } from '@nestjs/common';
import { AdStatus } from '@prisma/client';

export type AdModerationInput = {
  title: string;
  description: string;
  price: number;
};

export type AdModerationDecision = {
  status: AdStatus;
  moderatedAt: Date | null;
  rejectionReason?: string;
};

/**
 * Moderation contract for advertisements.
 *
 * The current implementation always approves. It is intentionally isolated
 * behind this class so the auto-approve logic can be replaced with a real
 * moderation pipeline (manual review queue, automated checks, etc.) without
 * touching AdsService or the controllers.
 */
@Injectable()
export class AdsModerationService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moderateOnCreate(_input: AdModerationInput): AdModerationDecision {
    return {
      status: AdStatus.PUBLISHED,
      moderatedAt: new Date(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moderateOnUpdate(_input: AdModerationInput): AdModerationDecision {
    return {
      status: AdStatus.PUBLISHED,
      moderatedAt: new Date(),
    };
  }
}
