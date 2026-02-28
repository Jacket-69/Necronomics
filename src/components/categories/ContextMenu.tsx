import { useEffect } from "react";

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu = ({ items, position, onClose }: ContextMenuProps) => {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-50 min-w-[160px] rounded border py-1 shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: "#1a1f14",
        borderColor: "#4a5d23",
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.disabled) {
              item.onClick();
            }
          }}
          disabled={item.disabled}
          className="block w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors hover:bg-[#2a3320]"
          style={{
            color: item.disabled ? "#4a5d23" : "#c4cfb4",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
