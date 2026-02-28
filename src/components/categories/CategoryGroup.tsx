import type { Category } from "../../types";
import { CategoryRow } from "./CategoryRow";

interface CategoryGroupProps {
  parent: Category;
  subcategories: Category[];
  onContextMenu: (e: React.MouseEvent, category: Category) => void;
}

export const CategoryGroup = ({ parent, subcategories, onContextMenu }: CategoryGroupProps) => {
  return (
    <>
      <CategoryRow
        category={parent}
        subcategoryCount={subcategories.length}
        isSubcategory={false}
        onContextMenu={onContextMenu}
      />
      {subcategories.map((sub) => (
        <CategoryRow
          key={sub.id}
          category={sub}
          subcategoryCount={0}
          isSubcategory={true}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  );
};
