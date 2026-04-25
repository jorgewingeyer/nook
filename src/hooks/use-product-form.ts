"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { validateProduct, parseProductAttributes } from "@/lib/product-utils";
import {
  createCategoryAction,
  type ProductDetail,
  type ProductStatus,
} from "@/app/(secure)/admin/products/products.action";

type Category = { id: number; name: string };

interface UseProductFormOptions {
  product?: ProductDetail;
  categories: Category[];
  action: (formData: FormData) => Promise<{ error?: string; data?: { id: number } }>;
  mode: "create" | "edit";
}

export function useProductForm({ product, categories, action, mode }: UseProductFormOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [costPrice, setCostPrice] = useState(product?.costPrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId?.toString() ?? "none");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [minStock, setMinStock] = useState(product?.minStock?.toString() ?? "5");
  const [weight, setWeight] = useState(product?.weight?.toString() ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [tags, setTags] = useState(product?.tags ?? "");

  const attrs = parseProductAttributes(product?.attributes);
  const [color, setColor] = useState(attrs.color ?? "");
  const [material, setMaterial] = useState(attrs.material ?? "");

  const [newImagePreviews, setNewImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const existingImages = (product?.images ?? []).filter((img) => !deletedImageIds.includes(img.id));

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catList, setCatList] = useState<Category[]>(categories);
  const [catCreating, setCatCreating] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited && name) setSlug(slugify(name));
  }, [name, slugManuallyEdited]);

  useEffect(() => {
    return () => newImagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [newImagePreviews]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(index: number) {
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(id: number) {
    setDeletedImageIds((prev) => [...prev, id]);
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    setCatCreating(true);
    const result = await createCategoryAction(newCatName.trim());
    setCatCreating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setCatList((prev) => [...prev, result.data!]);
      setCategoryId(String(result.data.id));
      toast.success("Categoría creada");
    }
    setNewCatName("");
    setCatDialogOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateProduct({ name, sku, price });
    if (error) return void toast.error(error);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("sku", sku.trim());
      formData.append("description", description);
      formData.append("price", price);
      formData.append("costPrice", costPrice);
      formData.append("categoryId", categoryId === "none" ? "" : categoryId);
      formData.append("stock", stock);
      formData.append("minStock", minStock);
      formData.append("weight", weight);
      formData.append("status", status);
      formData.append("isFeatured", String(isFeatured));
      formData.append("tags", tags);
      formData.append("color", color);
      formData.append("material", material);
      newImagePreviews.forEach((p) => formData.append("images", p.file));
      deletedImageIds.forEach((id) => formData.append("deleteImageIds", String(id)));

      const result = await action(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(mode === "create" ? "Producto creado" : "Producto actualizado");
      router.push("/products");
      router.refresh();
    });
  }

  return {
    isPending,
    fileInputRef,
    name,
    setName,
    slug,
    setSlug,
    setSlugManuallyEdited,
    sku,
    setSku,
    description,
    setDescription,
    price,
    setPrice,
    costPrice,
    setCostPrice,
    categoryId,
    setCategoryId,
    stock,
    setStock,
    minStock,
    setMinStock,
    weight,
    setWeight,
    status,
    setStatus,
    isFeatured,
    setIsFeatured,
    tags,
    setTags,
    color,
    setColor,
    material,
    setMaterial,
    newImagePreviews,
    existingImages,
    catDialogOpen,
    setCatDialogOpen,
    newCatName,
    setNewCatName,
    catList,
    catCreating,
    handleFilesSelected,
    removeNewImage,
    removeExistingImage,
    handleCreateCategory,
    handleSubmit,
  };
}
