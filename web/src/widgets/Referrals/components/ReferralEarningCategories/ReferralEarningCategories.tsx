import type { ReferralEarningCategoryId } from '../../types/referral-earning-category';
import { referralEarningCategories } from '../../data/referral-earning-categories';

type ReferralEarningCategoriesProps = {
  activeCategoryId: ReferralEarningCategoryId;
  onActiveCategoryChange: (categoryId: ReferralEarningCategoryId) => void;
};

export function ReferralEarningCategories({
  activeCategoryId,
  onActiveCategoryChange,
}: ReferralEarningCategoriesProps) {
  return (
    <section className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:grid sm:grid-cols-3">
      {referralEarningCategories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <button
            key={category.id}
            type="button"
            className={[
              'flex flex-1 cursor-pointer items-center justify-center border p-3 text-center transition-colors duration-300 sm:rounded-2xl sm:p-4',
              'rounded-xl',
              isActive
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:border-foreground/30 hover:bg-muted/50',
            ].join(' ')}
            onClick={() => onActiveCategoryChange(category.id)}
          >
            <span className="block text-xs font-semibold leading-4 sm:text-sm md:text-base">
              {category.shortTitle}
            </span>
          </button>
        );
      })}
    </section>
  );
}