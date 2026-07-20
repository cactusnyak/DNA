import { ArrowRight, Info } from 'lucide-react';

import { referralEarningCategories } from '../../data/referral-earning-categories';
import type { ReferralEarningCategoryId } from '../../types/referral-earning-category';

type ReferralEarningDescriptionProps = {
  activeCategoryId: ReferralEarningCategoryId;
};

type InfoBlockType = 'description' | 'examples';

type InfoBlock = {
  title: string;
  items: string[];
  type: InfoBlockType;
};

function getInfoBlocks(activeCategory: (typeof referralEarningCategories)[number]): InfoBlock[] {
  return [
    {
      title: 'Описание',
      items: activeCategory.details.paragraphs,
      type: 'description',
    },
    {
      title: 'Примеры расчёта',
      items: activeCategory.details.examples,
      type: 'examples',
    },
  ];
}

function ReferralEarningDescriptionItem({
  item,
  type,
}: {
  item: string;
  type: InfoBlockType;
}) {
  const isDescription = type === 'description';
  const Icon = isDescription ? Info : ArrowRight;

  return (
    <li
      className={[
        'flex gap-2',
      ].join(' ')}
    >
      <span
        className={[
          'flex size-5 shrink-0 justify-center rounded-full text-muted-foreground mt-[4.5px]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon className="size-3.5" />
      </span>

      <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
        {item}
      </p>
    </li>
  );
}

export function ReferralEarningDescription({
  activeCategoryId,
}: ReferralEarningDescriptionProps) {
  const activeCategory =
    referralEarningCategories.find(
      (category) => category.id === activeCategoryId,
    ) ?? referralEarningCategories[0];

  const infoBlocks = getInfoBlocks(activeCategory);

  return (
    <section>
      <div className="px-5">
        <div className="mt-5 flex flex-col gap-5">
          {infoBlocks.map((block) => (
            <div
              key={block.title}
              className="flex flex-col gap-4 rounded-2xl bg-muted/50 p-6"
            >
              <p className="text-sm font-semibold">{block.title}</p>

              <ul className="grid gap-2 p-1">
                {block.items.map((item) => (
                  <ReferralEarningDescriptionItem
                    key={item}
                    item={item}
                    type={block.type}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}