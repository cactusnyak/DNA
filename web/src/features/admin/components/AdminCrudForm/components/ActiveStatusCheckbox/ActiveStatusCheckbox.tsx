type ActiveStatusCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ActiveStatusCheckbox({
  checked,
  onChange,
}: ActiveStatusCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        name="isActive"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      Активно
    </label>
  );
}
