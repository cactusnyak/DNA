import { CatalogDropdown } from '@/widgets/CatalogDropdown';

type HeaderCatalogDropdownProps = {
  onClose: () => void;
};

export function HeaderCatalogDropdown({ onClose }: HeaderCatalogDropdownProps) {
  return (
    <div
      className="
        absolute top-full right-0 left-0 hidden
        px-4 pb-4 md:block
        bg-white/5
      "
    >
      <div className="w-full">
        <CatalogDropdown onClose={onClose} />
      </div>
    </div>
  );
}