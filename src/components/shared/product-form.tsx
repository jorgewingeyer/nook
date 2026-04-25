"use client";

import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProductForm } from "@/hooks/use-product-form";
import { type ProductDetail, type ProductStatus } from "@/app/(secure)/admin/products/products.action";

type Category = { id: number; name: string };

interface ProductFormProps {
  product?: ProductDetail;
  categories: Category[];
  action: (formData: FormData) => Promise<{ error?: string; data?: { id: number } }>;
  mode: "create" | "edit";
}

export function ProductForm({ product, categories, action, mode }: ProductFormProps) {
  const router = useRouter();
  const form = useProductForm({ product, categories, action, mode });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Información básica</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="Lámpara de piso Nordic"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug URL</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    form.setSlug(e.target.value);
                    form.setSlugManuallyEdited(true);
                  }}
                  placeholder="lampara-de-piso-nordic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => form.setSku(e.target.value.toUpperCase())}
                  placeholder="LMP-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                placeholder="Describe el producto..."
                rows={4}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Precios</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio de venta (ARS) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => form.setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Precio de costo (ARS)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => form.setCostPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Atributos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={form.color}
                  onChange={(e) => form.setColor(e.target.value)}
                  placeholder="Negro, Blanco, Natural..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={form.material}
                  onChange={(e) => form.setMaterial(e.target.value)}
                  placeholder="Madera, Metal, Tela..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => form.setTags(e.target.value)}
                placeholder="nuevo, oferta, destacado..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={(e) => form.setWeight(e.target.value)}
                placeholder="1.5"
                className="sm:w-40"
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Imágenes</h2>

            {form.existingImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.existingImages.map((img) => (
                  <div key={img.id} className="group relative h-24 w-24 shrink-0">
                    <Image
                      src={`/api/media/${img.url}`}
                      alt="Imagen del producto"
                      fill
                      sizes="96px"
                      className="rounded-lg object-cover border"
                    />
                    {img.isMain && (
                      <Badge className="absolute -top-2 -left-2 z-10 text-xs px-1 py-0">Principal</Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => form.removeExistingImage(img.id)}
                      aria-label="Eliminar imagen"
                      className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.newImagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.newImagePreviews.map((preview, i) => (
                  <div key={preview.url} className="group relative h-24 w-24 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.url}
                      alt="Nueva imagen"
                      className="h-24 w-24 rounded-lg object-cover border-2 border-dashed border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => form.removeNewImage(i)}
                      aria-label="Eliminar imagen"
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <input
                ref={form.fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={form.handleFilesSelected}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => form.fileInputRef.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar imágenes
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP. Máximo 5 MB por imagen.</p>
            </div>
          </div>
        </div>

        {/* Right column — settings */}
        <div className="space-y-6">
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Organización</h2>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => form.setStatus(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categoría</Label>
                <Dialog open={form.catDialogOpen} onOpenChange={form.setCatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      + Nueva
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Nueva categoría</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="newCatName">Nombre</Label>
                      <Input
                        id="newCatName"
                        value={form.newCatName}
                        onChange={(e) => form.setNewCatName(e.target.value)}
                        placeholder="Iluminación"
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), form.handleCreateCategory())
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={form.handleCreateCategory}
                        disabled={form.catCreating}
                      >
                        {form.catCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={form.categoryId} onValueChange={form.setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {form.catList.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <input
                id="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => form.setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Producto destacado
                </Label>
                <p className="text-xs text-muted-foreground">Se mostrará en la página principal</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold">Inventario</h2>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock actual</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => form.setStock(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock mínimo (alerta)</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => form.setMinStock(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={form.isPending}>
          {form.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Crear producto" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/products")}
          disabled={form.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
