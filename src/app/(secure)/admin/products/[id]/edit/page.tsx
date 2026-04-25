import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { ProductForm } from "@/components/shared/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getCategoriesAction,
  getProductAction,
  updateProductAction,
} from "../../products.action";
import { getPriceHistoryAction } from "@/app/(secure)/admin/reports/reports.action";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const [product, categories, priceHistory] = await Promise.all([
    getProductAction(productId),
    getCategoriesAction(),
    getPriceHistoryAction(productId),
  ]);

  if (!product) notFound();

  const updateThisProduct = updateProductAction.bind(null, productId);

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
        <h1 className="text-2xl font-bold tracking-tight">Editar producto</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm
        product={product}
        categories={categories}
        action={updateThisProduct}
        mode="edit"
      />

      {priceHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Historial de precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {priceHistory.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">
                        {formatCurrency(entry.oldPrice)}
                      </span>
                      <span>→</span>
                      <span className="font-medium">{formatCurrency(entry.newPrice)}</span>
                    </div>
                    {entry.reason && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{entry.reason}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
