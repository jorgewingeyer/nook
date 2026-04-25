import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInventoryAction } from "./inventory.action";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { stockLevelClassName } from "@/lib/inventory-utils";

export default async function InventoryPage() {
  const [allItems, lowItems] = await Promise.all([
    getInventoryAction(),
    getInventoryAction({ lowStockOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted-foreground">{allItems.length} productos</p>
      </div>

      {lowItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {lowItems.length} producto{lowItems.length > 1 ? "s" : ""} con stock bajo
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {lowItems.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Todos
            <Badge variant="secondary" className="ml-2">{allItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="low">
            Stock bajo
            {lowItems.length > 0 && (
              <Badge variant="destructive" className="ml-2">{lowItems.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <InventoryTable items={allItems} />
        </TabsContent>

        <TabsContent value="low" className="mt-4">
          {lowItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Package className="h-10 w-10" />
              <p>No hay productos con stock bajo</p>
            </div>
          ) : (
            <InventoryTable items={lowItems} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InventoryTable({ items }: { items: Awaited<ReturnType<typeof getInventoryAction>> }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="hidden sm:table-cell">SKU</TableHead>
            <TableHead className="hidden md:table-cell">Categoría</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Mínimo</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                No hay productos
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.isLow && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden font-mono text-sm sm:table-cell">{item.sku}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {item.categoryName ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <span className={stockLevelClassName(item.stock, item.isLow)}>
                  {item.stock}
                </span>
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                {item.minStock}
              </TableCell>
              <TableCell className="text-right">
                <StockAdjustmentDialog
                  productId={item.id}
                  productName={item.name}
                  currentStock={item.stock}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
