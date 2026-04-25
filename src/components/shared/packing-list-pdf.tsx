"use client";

import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, padding: 40, color: "#111" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#555", lineHeight: 1.5 },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#666", marginBottom: 6, letterSpacing: 1 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 110, color: "#555" },
  value: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 14 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 3, marginBottom: 4 },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  colName: { flex: 3 },
  colSku: { flex: 2 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 70, textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold" },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 8 },
  badge: { backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 9 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#aaa", textAlign: "center" },
});

function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
}

interface PackingListData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip: string;
  shippingMethod: string;
  trackingNumber: string | null;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  items: {
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

function PackingListDocument({ order }: { order: PackingListData }) {
  const date = new Date(order.createdAt).toLocaleDateString("es-AR");

  return (
    <Document title={`Packing List — ${order.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Nook</Text>
            <Text style={[styles.meta, { marginTop: 4 }]}>hola@nook.com.ar</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.bold, { fontSize: 12 }]}>{order.orderNumber}</Text>
            <Text style={[styles.meta, { marginTop: 2 }]}>Fecha: {date}</Text>
            <View style={[styles.badge, { marginTop: 4 }]}>
              <Text>{order.shippingMethod === "express" ? "Envío Express" : "Envío Estándar"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Packing List / Nota de Pedido</Text>
        <View style={styles.divider} />

        {/* Customer & Shipping */}
        <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{order.customerName}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{order.customerEmail}</Text></View>
            {order.customerPhone && <View style={styles.row}><Text style={styles.label}>Teléfono:</Text><Text style={styles.value}>{order.customerPhone}</Text></View>}
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
            <Text style={styles.value}>{order.shippingAddress}</Text>
            <Text style={styles.value}>{order.shippingCity}, {order.shippingProvince}</Text>
            <Text style={styles.value}>CP: {order.shippingZip}</Text>
            {order.trackingNumber && <View style={[styles.row, { marginTop: 6 }]}><Text style={styles.label}>Tracking:</Text><Text style={[styles.value, styles.bold]}>{order.trackingNumber}</Text></View>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items table */}
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Productos a embalar</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.bold]}>Producto</Text>
          <Text style={[styles.colSku, styles.bold]}>SKU</Text>
          <Text style={[styles.colQty, styles.bold]}>Cant.</Text>
          <Text style={[styles.colPrice, styles.bold]}>Precio u.</Text>
          <Text style={[styles.colPrice, styles.bold]}>Subtotal</Text>
        </View>
        {order.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colName}>{item.productName}</Text>
            <Text style={[styles.colSku, { color: "#666" }]}>{item.productSku}</Text>
            <Text style={[styles.colQty, styles.bold]}>{item.quantity}</Text>
            <Text style={[styles.colPrice, { color: "#666" }]}>{formatARS(item.unitPrice)}</Text>
            <Text style={styles.colPrice}>{formatARS(item.totalPrice)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={[styles.divider, { marginTop: 12 }]} />
        <View style={styles.total}>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <View style={styles.row}><Text style={[styles.label, { width: 80 }]}>Subtotal:</Text><Text style={[styles.value, { textAlign: "right" }]}>{formatARS(order.subtotal)}</Text></View>
            <View style={styles.row}><Text style={[styles.label, { width: 80 }]}>Envío:</Text><Text style={[styles.value, { textAlign: "right" }]}>{order.shippingCost === 0 ? "Gratis" : formatARS(order.shippingCost)}</Text></View>
            <View style={styles.row}><Text style={[styles.label, styles.bold, { width: 80, fontSize: 11 }]}>TOTAL:</Text><Text style={[styles.value, styles.bold, { textAlign: "right", fontSize: 11 }]}>{formatARS(order.total)}</Text></View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas</Text>
              <Text>{order.notes}</Text>
            </View>
          </>
        )}

        <Text style={styles.footer}>Generado por Nook · {order.orderNumber} · {date}</Text>
      </Page>
    </Document>
  );
}

export function PackingListButton({ order }: { order: PackingListData }) {
  const filename = `packing-list-${order.orderNumber}.pdf`;

  return (
    <PDFDownloadLink document={<PackingListDocument order={order} />} fileName={filename}>
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading} type="button">
          {loading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando…</>
            : <><Printer className="mr-2 h-4 w-4" />Packing List</>
          }
        </Button>
      )}
    </PDFDownloadLink>
  );
}
