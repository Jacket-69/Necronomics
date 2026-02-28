import type { LucideProps } from "lucide-react";
import {
  Utensils,
  ShoppingCart,
  Home,
  Gamepad2,
  Hospital,
  BookOpen,
  Shirt,
  ClipboardList,
  Sandwich,
  Wine,
  Package,
  TrainFront,
  CarTaxiFront,
  Fuel,
  KeyRound,
  Lightbulb,
  Globe,
  Tv,
  Joystick,
  Beer,
  Pill,
  Stethoscope,
  Wallet,
  Laptop,
  TrendingUp,
  Banknote,
  Gift,
  Clock,
  Bus,
  Circle,
  DollarSign,
  CreditCard,
  Heart,
  Music,
  Phone,
  Plane,
} from "lucide-react";
import type { Category } from "../../types";

type IconComponent = React.ComponentType<LucideProps>;

/** Map of Lucide icon name strings to their components. Used by CategoryRow and icon picker (Plan 03). */
export const iconMap: Record<string, IconComponent> = {
  utensils: Utensils,
  "shopping-cart": ShoppingCart,
  home: Home,
  "gamepad-2": Gamepad2,
  hospital: Hospital,
  "book-open": BookOpen,
  shirt: Shirt,
  "clipboard-list": ClipboardList,
  sandwich: Sandwich,
  wine: Wine,
  package: Package,
  "train-front": TrainFront,
  "car-taxi-front": CarTaxiFront,
  fuel: Fuel,
  "key-round": KeyRound,
  lightbulb: Lightbulb,
  globe: Globe,
  tv: Tv,
  joystick: Joystick,
  beer: Beer,
  pill: Pill,
  stethoscope: Stethoscope,
  wallet: Wallet,
  laptop: Laptop,
  "trending-up": TrendingUp,
  banknote: Banknote,
  gift: Gift,
  clock: Clock,
  bus: Bus,
  circle: Circle,
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  heart: Heart,
  music: Music,
  phone: Phone,
  plane: Plane,
};

interface CategoryRowProps {
  category: Category;
  subcategoryCount: number;
  isSubcategory: boolean;
  onContextMenu: (e: React.MouseEvent, category: Category) => void;
}

export const CategoryRow = ({
  category,
  subcategoryCount,
  isSubcategory,
  onContextMenu,
}: CategoryRowProps) => {
  const IconComp = (category.icon && iconMap[category.icon]) || Circle;
  const iconColor = category.type === "income" ? "#7a9f35" : "#9f3535";

  return (
    <tr
      className="border-b transition-colors hover:bg-[#111a0a]"
      style={{
        borderColor: "#1a2510",
        color: "#a8b878",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, category);
      }}
    >
      {/* Icon */}
      <td className="w-10 px-4 py-3 text-center">
        <IconComp size={18} style={{ color: iconColor }} />
      </td>

      {/* Name */}
      <td
        className={`py-3 ${isSubcategory ? "pl-8" : "pl-2"} ${!isSubcategory ? "font-medium" : ""}`}
        style={{ color: "#c4d4a0" }}
      >
        {category.name}
      </td>

      {/* Subcategory count */}
      <td className="px-4 py-3 text-center" style={{ color: "#6b7c3e" }}>
        {isSubcategory ? "—" : subcategoryCount}
      </td>

      {/* Transaction count (placeholder) */}
      <td className="px-4 py-3 text-center" style={{ color: "#4a5d23" }}>
        0
      </td>

      {/* Total amount (placeholder) */}
      <td
        className="px-4 py-3 text-right"
        style={{
          color: "#4a5d23",
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        }}
      >
        —
      </td>
    </tr>
  );
};
