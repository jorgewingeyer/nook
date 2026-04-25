import { Suspense } from "react";
import { Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { getAuditLogsAction } from "@/app/(secure)/admin/reports/reports.action";
import { getInventoryAction } from "@/app/(secure)/admin/inventory/inventory.action";
import { formatCurrency } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  "inventory.in": "Entrada de stock",
  "inventory.out": "Salida de stock",
  "inventory.adjustment": "Ajuste de stock",
  "product.create": "Producto creado",
  "product.update": "Producto editado",
  "product.archive": "Producto archivado",
  "price.update": "Precio actualizado",
};

async function AuditContent() {
  const { logs } = await getAuditLogsAction();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acción</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead className="hidden sm:table-cell">Usuario</TableHead>
            <TableHead className="hidden md:table-cell">Cambio</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                Sin registros de auditoría
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId}` : ""}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {log.userName ?? "Sistema"}
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-xs">
                  {log.oldValue && log.newValue ? (
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      {Object.entries(JSON.parse(log.newValue) as Record<string, unknown>).map(
                        ([key, val]) => {
                          const oldObj = JSON.parse(log.oldValue ?? "{}") as Record<string, unknown>;
                          if (oldObj[key] === val) return null;
                          return (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{" "}
                              <span className="line-through">{String(oldObj[key])}</span>
                              {" → "}
                              <span className="text-foreground">{String(val)}</span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(log.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

async function LowStockContent() {
  const items = await getInventoryAction({ lowStockOnly: true });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stock actual</TableHead>
            <TableHead className="text-right">Stock mínimo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                Todos los productos tienen stock suficiente
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {item.stock}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{item.minStock}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Auditoría del sistema y alertas de stock</p>
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Auditoría
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Alertas de stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Log de acciones del sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<Skeleton className="m-4 h-48" />}>
                <AuditContent />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Productos con stock bajo o agotado</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<Skeleton className="m-4 h-48" />}>
                <LowStockContent />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
