import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategoryStore } from "../../stores/categoryStore";
import { IconPicker } from "./IconPicker";
import type { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from "../../types";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Maximo 50 caracteres"),
  categoryType: z.enum(["income", "expense"], { message: "Selecciona un tipo" }),
  icon: z.string().nullable(),
  parentId: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  editCategory?: Category;
  parentCategory?: Category;
  categories: Category[];
}

export const CategoryFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editCategory,
  parentCategory,
  categories,
}: CategoryFormModalProps) => {
  const { addCategory, updateCategory } = useCategoryStore();
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!editCategory;
  const isSubcategoryMode = !!parentCategory;

  const defaultType: CategoryType = editCategory
    ? editCategory.type
    : parentCategory
      ? parentCategory.type
      : "expense";

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onBlur",
    defaultValues: {
      name: editCategory?.name ?? "",
      categoryType: defaultType,
      icon: editCategory?.icon ?? parentCategory?.icon ?? null,
      parentId: isSubcategoryMode ? parentCategory.id : (editCategory?.parentId ?? null),
    },
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      reset({
        name: editCategory?.name ?? "",
        categoryType: editCategory
          ? editCategory.type
          : parentCategory
            ? parentCategory.type
            : "expense",
        icon: editCategory?.icon ?? parentCategory?.icon ?? null,
        parentId: isSubcategoryMode ? parentCategory.id : (editCategory?.parentId ?? null),
      });
    }
  }, [isOpen, editCategory, parentCategory, isSubcategoryMode, reset]);

  const watchedType = watch("categoryType");
  const watchedIcon = watch("icon");

  // Determine if editing a parent that has subcategories (cannot demote to subcategory)
  const hasSubcategories = editCategory
    ? categories.some((c) => c.parentId === editCategory.id)
    : false;

  // Filter parent options: only parents (parentId === null) of same type, exclude self
  const parentOptions = categories.filter(
    (c) => c.parentId === null && c.type === watchedType && c.id !== editCategory?.id
  );

  // Inline duplicate name check
  const watchedName = watch("name");
  const watchedParentId = watch("parentId");
  const isDuplicateName = categories.some(
    (c) =>
      c.name.toLowerCase() === watchedName?.toLowerCase() &&
      c.type === watchedType &&
      c.parentId === (watchedParentId ?? null) &&
      c.id !== editCategory?.id
  );

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("Descartar cambios?");
      if (!confirmed) return;
    }
    onClose();
  };

  const onSubmit = async (data: CategoryFormData) => {
    setFormError(null);
    try {
      if (isEditMode && editCategory) {
        const input: UpdateCategoryInput = {
          name: data.name,
          categoryType: data.categoryType,
          icon: data.icon,
          parentId: data.parentId,
        };
        await updateCategory(editCategory.id, input);
        onSuccess("Categoria actualizada");
      } else {
        const input: CreateCategoryInput = {
          name: data.name,
          categoryType: data.categoryType,
          icon: data.icon,
          parentId: data.parentId,
        };
        await addCategory(input);
        onSuccess("Categoria creada");
      }
    } catch (e) {
      setFormError(String(e));
    }
  };

  if (!isOpen) return null;

  const title = isEditMode
    ? "Editar categoria"
    : isSubcategoryMode
      ? `Nueva subcategoria de ${parentCategory.name}`
      : "Nueva categoria";

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const labelStyle = { color: "#6b7c3e", fontFamily: fontMono };
  const inputStyle = {
    backgroundColor: "#111a0a",
    borderColor: "#2a3518",
    color: "#c4d4a0",
    fontFamily: fontMono,
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-lg border p-6"
          style={{
            backgroundColor: "#0a0f06",
            borderColor: "#4a5d23",
            fontFamily: fontMono,
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 cursor-pointer text-lg"
            style={{ color: "#6b7c3e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a8b878";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7c3e";
            }}
          >
            x
          </button>

          {/* Title */}
          <h2 className="mb-5 text-lg font-semibold" style={{ color: "#c4d4a0" }}>
            {title}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Nombre
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="Nombre de la categoria"
              />
              {errors.name && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.name.message}
                </p>
              )}
              {isDuplicateName && watchedName.length > 0 && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  Este nombre ya existe
                </p>
              )}
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm" style={labelStyle}>
                Tipo
              </label>
              <div className="flex gap-4">
                {(
                  [
                    { value: "income", label: "Ingreso" },
                    { value: "expense", label: "Gasto" },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm"
                    style={{
                      color: "#a8b878",
                      fontFamily: fontMono,
                      opacity: isSubcategoryMode ? 0.5 : 1,
                    }}
                  >
                    <input
                      {...register("categoryType")}
                      type="radio"
                      value={option.value}
                      disabled={isSubcategoryMode}
                      className="accent-[#7fff00]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.categoryType && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.categoryType.message}
                </p>
              )}
              {isEditMode && !isSubcategoryMode && (
                <p className="mt-1 text-xs" style={{ color: "#a87832" }}>
                  Cambiar el tipo tambien cambiara el tipo de todas las subcategorias.
                </p>
              )}
            </div>

            {/* Icon */}
            <div className="mb-4">
              <label className="mb-2 block text-sm" style={labelStyle}>
                Icono {watchedIcon ? `(${watchedIcon})` : "(ninguno)"}
              </label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <IconPicker
                    selectedIcon={field.value}
                    onSelect={(name) => {
                      // Toggle: click same icon to deselect
                      field.onChange(field.value === name ? null : name);
                    }}
                    categoryType={watchedType}
                  />
                )}
              />
            </div>

            {/* Parent category */}
            {!isSubcategoryMode && (
              <div className="mb-4">
                <label className="mb-1 block text-sm" style={labelStyle}>
                  Categoria padre
                </label>
                <select
                  {...register("parentId")}
                  className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                  disabled={hasSubcategories}
                >
                  <option value="">Ninguna (categoria principal)</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {hasSubcategories && (
                  <p className="mt-1 text-xs" style={{ color: "#a87832" }}>
                    No se puede cambiar: esta categoria tiene subcategorias.
                  </p>
                )}
              </div>
            )}

            {/* Subcategory mode: show locked parent */}
            {isSubcategoryMode && (
              <div className="mb-4">
                <label className="mb-1 block text-sm" style={labelStyle}>
                  Categoria padre
                </label>
                <input
                  type="text"
                  value={parentCategory.name}
                  disabled
                  className="w-full rounded border px-3 py-2 text-sm opacity-60"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Form-level error */}
            {formError && (
              <div
                className="mb-4 rounded border px-3 py-2 text-xs"
                style={{
                  borderColor: "#8b0000",
                  backgroundColor: "#1a0a0a",
                  color: "#ff4444",
                }}
              >
                {formError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isDuplicateName}
                className="flex-1 cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#4a5d23",
                  color: "#c4d4a0",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.color = "#7fff00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#c4d4a0";
                }}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer rounded border px-4 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#2a3518",
                  color: "#6b7c3e",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a8b878";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6b7c3e";
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
