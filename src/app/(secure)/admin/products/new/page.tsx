import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/shared/product-form";
import { createProductAction, getCategoriesAction } from "../products.action";

export default async function NewProductPage() {
  const categories = await getCategoriesAction();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo producto</h1>
      </div>
      <ProductForm
        categories={categories}
        action={createProductAction}
        mode="create"
      />
    </div>
  );
}
