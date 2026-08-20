import { Injectable } from '@nestjs/common';

import { createDeliveryFingerprint } from './utils/delivery-fingerprint';

export type DeliveryPlanBadge = 'RECOMMENDED' | 'CHEAPEST' | 'FASTEST';

export type DeliveryPlan = {
  planId: string;
  title: string;
  badges: DeliveryPlanBadge[];
  customerPrice: number;
  currency: 'RUB';
  deliveryInterval?: { from: string; to: string };
  shipmentCount: number;
  expiresAt: string;
  parts: Array<{
    partId: string;
    items: Array<{
      orderItemId: string;
      title: string;
      quantity: number;
      image?: unknown;
    }>;
    provider: { code: string; name: string };
    service: {
      code: string;
      name: string;
      fulfillmentType: 'DOOR' | 'PICKUP';
    };
    deliveryInterval?: { from: string; to: string };
  }>;
};

export type InternalDeliveryPlan = DeliveryPlan & {
  selections: Array<{ groupKey: string; quoteId: string }>;
};

export type DeliveryPlanGroup = {
  groupKey: string;
  items: Array<{
    orderItemId: string;
    title: string;
    quantity: number;
    image?: unknown;
  }>;
  quotes: Array<{
    quoteId: string;
    provider: { code: string; name: string };
    service: {
      code: string;
      name: string;
      fulfillmentType: 'DOOR' | 'PICKUP';
    };
    customerPrice: number;
    currency: 'RUB';
    deliveryInterval?: { from: string; to: string };
    expiresAt: string;
  }>;
};

export type DeliveryPlanBuildInput = {
  groups: DeliveryPlanGroup[];
  destinationVersion: number;
  deliveryVersion: number;
  pricingVersion: number;
};

export const DELIVERY_PLAN_LIMITS = {
  candidatesPerGroup: 4,
  combinations: 64,
  publicPlans: 3,
} as const;

@Injectable()
export class DeliveryPlanBuilder {
  build(input: DeliveryPlanBuildInput): InternalDeliveryPlan[] {
    if (!input.groups.length) return [];
    const groups = [...input.groups]
      .sort((a, b) => a.groupKey.localeCompare(b.groupKey))
      .map((group) => ({
        ...group,
        quotes: group.quotes
          .filter(
            (quote) =>
              quote.service.fulfillmentType !== 'PICKUP' &&
              quote.currency === 'RUB' &&
              new Date(quote.expiresAt).getTime() > Date.now(),
          )
          .sort(
            (a, b) =>
              a.customerPrice - b.customerPrice ||
              this.end(a) - this.end(b) ||
              a.quoteId.localeCompare(b.quoteId),
          )
          .slice(0, DELIVERY_PLAN_LIMITS.candidatesPerGroup),
      }));
    if (groups.some((group) => !group.quotes.length)) return [];

    const combinations: Array<Array<DeliveryPlanGroup['quotes'][number]>> = [];
    const visit = (
      groupIndex: number,
      selected: Array<DeliveryPlanGroup['quotes'][number]>,
    ) => {
      if (combinations.length >= DELIVERY_PLAN_LIMITS.combinations) return;
      if (groupIndex === groups.length) {
        combinations.push([...selected]);
        return;
      }
      for (const quote of groups[groupIndex].quotes) {
        selected.push(quote);
        visit(groupIndex + 1, selected);
        selected.pop();
        if (combinations.length >= DELIVERY_PLAN_LIMITS.combinations) break;
      }
    };
    visit(0, []);

    const plans = combinations.map((quotes) =>
      this.toPlan(input, groups, quotes),
    );
    const unique = [
      ...new Map(
        plans.map((plan) => [
          plan.selections
            .map((selection) => selection.quoteId)
            .sort()
            .join(':'),
          plan,
        ]),
      ).values(),
    ];
    const cheapest = [...unique].sort(
      (a, b) =>
        a.customerPrice - b.customerPrice || a.planId.localeCompare(b.planId),
    )[0];
    const fastest = [...unique].sort(
      (a, b) =>
        this.planEnd(a) - this.planEnd(b) ||
        a.customerPrice - b.customerPrice ||
        a.planId.localeCompare(b.planId),
    )[0];
    const recommended = [...unique].sort(
      (a, b) =>
        new Set(a.parts.map((part) => part.provider.code)).size -
          new Set(b.parts.map((part) => part.provider.code)).size ||
        this.planEnd(a) - this.planEnd(b) ||
        a.customerPrice - b.customerPrice ||
        a.planId.localeCompare(b.planId),
    )[0];
    const ranked = [recommended, cheapest, fastest].filter(
      (plan, index, values): plan is InternalDeliveryPlan =>
        Boolean(plan) &&
        values.findIndex((value) => value?.planId === plan?.planId) === index,
    );
    for (const plan of ranked) {
      if (plan.planId === recommended?.planId) plan.badges.push('RECOMMENDED');
      if (plan.planId === cheapest?.planId) plan.badges.push('CHEAPEST');
      if (plan.planId === fastest?.planId) plan.badges.push('FASTEST');
      plan.title = this.title(plan);
    }
    return ranked.slice(0, DELIVERY_PLAN_LIMITS.publicPlans);
  }

  toPublic(plan: InternalDeliveryPlan): DeliveryPlan {
    return {
      planId: plan.planId,
      title: plan.title,
      badges: plan.badges,
      customerPrice: plan.customerPrice,
      currency: plan.currency,
      deliveryInterval: plan.deliveryInterval,
      shipmentCount: plan.shipmentCount,
      expiresAt: plan.expiresAt,
      parts: plan.parts,
    };
  }

  private toPlan(
    input: DeliveryPlanBuildInput,
    groups: DeliveryPlanGroup[],
    quotes: Array<DeliveryPlanGroup['quotes'][number]>,
  ): InternalDeliveryPlan {
    const selections = quotes.map((quote, index) => ({
      groupKey: groups[index].groupKey,
      quoteId: quote.quoteId,
    }));
    const intervals = quotes.flatMap((quote) =>
      quote.deliveryInterval ? [quote.deliveryInterval] : [],
    );
    return {
      planId: createDeliveryFingerprint({
        version: 1,
        quoteIds: selections.map((value) => value.quoteId).sort(),
        destinationVersion: input.destinationVersion,
        deliveryVersion: input.deliveryVersion,
        pricingVersion: input.pricingVersion,
      }),
      title: '',
      badges: [],
      customerPrice: quotes.reduce(
        (sum, quote) => sum + quote.customerPrice,
        0,
      ),
      currency: 'RUB',
      ...(intervals.length
        ? {
            deliveryInterval: {
              from: intervals.map((value) => value.from).sort()[0],
              to: intervals
                .map((value) => value.to)
                .sort()
                .at(-1)!,
            },
          }
        : {}),
      shipmentCount: groups.length,
      expiresAt: quotes.map((quote) => quote.expiresAt).sort()[0],
      parts: quotes.map((quote, index) => ({
        partId: createDeliveryFingerprint({
          version: 1,
          planPart: index,
          quoteId: quote.quoteId,
        }).slice(0, 24),
        items: groups[index].items,
        provider: quote.provider,
        service: quote.service,
        deliveryInterval: quote.deliveryInterval,
      })),
      selections,
    };
  }

  private title(plan: InternalDeliveryPlan) {
    const providers = new Map(
      plan.parts.map((part) => [part.provider.code, part.provider.name]),
    );
    if (providers.size === 1) return [...providers.values()][0];
    if (plan.badges.includes('FASTEST') && !plan.badges.includes('CHEAPEST'))
      return 'Самая быстрая доставка';
    if (plan.badges.includes('CHEAPEST') && !plan.badges.includes('FASTEST'))
      return 'Самая выгодная доставка';
    return 'Оптимальная доставка';
  }

  private end(quote: DeliveryPlanGroup['quotes'][number]) {
    return quote.deliveryInterval
      ? new Date(quote.deliveryInterval.to).getTime()
      : Number.MAX_SAFE_INTEGER;
  }

  private planEnd(plan: InternalDeliveryPlan) {
    return plan.deliveryInterval
      ? new Date(plan.deliveryInterval.to).getTime()
      : Number.MAX_SAFE_INTEGER;
  }
}
