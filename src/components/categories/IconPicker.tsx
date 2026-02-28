import { iconMap } from "./CategoryRow";
import type { CategoryType } from "../../types";

interface IconPickerProps {
  selectedIcon: string | null;
  onSelect: (iconName: string) => void;
  categoryType: CategoryType;
}

export const IconPicker = ({ selectedIcon, onSelect, categoryType }: IconPickerProps) => {
  const iconColor = categoryType === "income" ? "#7a9f35" : "#9f3535";
  const borderHighlight = categoryType === "income" ? "#7a9f35" : "#9f3535";

  return (
    <div
      className="grid max-h-52 grid-cols-5 gap-2 overflow-y-auto rounded border p-2"
      style={{
        borderColor: "#2a3518",
        backgroundColor: "#0a0f06",
      }}
    >
      {Object.entries(iconMap).map(([name, IconComp]) => {
        const isSelected = selectedIcon === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className="flex cursor-pointer flex-col items-center gap-1 rounded p-2 transition-colors"
            style={{
              border: isSelected ? `2px solid ${borderHighlight}` : "2px solid transparent",
              backgroundColor: isSelected ? "#1a2510" : "transparent",
            }}
            title={name}
          >
            <IconComp size={20} style={{ color: iconColor }} />
            <span
              className="truncate text-center text-[10px]"
              style={{ color: "#6b7c3e", maxWidth: "100%" }}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
