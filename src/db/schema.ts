import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "agent", "customer"] })
    .default("agent")
    .notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  mustChangePassword: integer("must_change_password", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentId: integer("parent_id"), // self-reference: subcategories
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sku: text("sku").notNull().unique(),
  price: real("price").notNull(),
  costPrice: real("cost_price"),
  categoryId: integer("category_id").references(() => categories.id),
  stock: integer("stock").default(0).notNull(),
  minStock: integer("min_stock").default(5).notNull(),
  weight: real("weight"),
  // JSON: { length: number, width: number, height: number }
  dimensions: text("dimensions"),
  // JSON: { color: string, material: string, size: string, ... }
  attributes: text("attributes"),
  // JSON: string[]
  tags: text("tags"),
  status: text("status", {
    enum: ["active", "inactive", "archived", "draft"],
  })
    .default("draft")
    .notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // R2 key or public URL
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isMain: integer("is_main", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Price History ────────────────────────────────────────────────────────────

export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  oldPrice: real("old_price").notNull(),
  newPrice: real("new_price").notNull(),
  reason: text("reason"),
  changedBy: integer("changed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["in", "out", "adjustment"] }).notNull(),
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  reason: text("reason"),
  reference: text("reference"), // order number, invoice, etc.
  userId: integer("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(), // e.g. NOOK-2026-0001
  customerId: integer("customer_id").references(() => users.id), // null = guest
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingProvince: text("shipping_province").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingMethod: text("shipping_method", {
    enum: ["standard", "express"],
  })
    .default("standard")
    .notNull(),
  shippingCost: real("shipping_cost").default(0).notNull(),
  subtotal: real("subtotal").notNull(),
  discount: real("discount").default(0).notNull(),
  total: real("total").notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "refunded"],
  })
    .default("pending")
    .notNull(),
  mpPaymentId: text("mp_payment_id"),
  mpPreferenceId: text("mp_preference_id"),
  status: text("status", {
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
  })
    .default("pending")
    .notNull(),
  notes: text("notes"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id), // nullable: product may be deleted
  productName: text("product_name").notNull(), // snapshot at order time
  productSku: text("product_sku").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(), // snapshot at order time
  totalPrice: real("total_price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const orderStatusHistory = sqliteTable("order_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
  }).notNull(),
  note: text("note"),
  changedBy: integer("changed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Finance ──────────────────────────────────────────────────────────────────

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id),
  type: text("type", {
    enum: ["sale", "refund", "commission", "adjustment", "other"],
  }).notNull(),
  amount: real("amount").notNull(), // positive = income, negative = expense
  currency: text("currency").default("ARS").notNull(),
  method: text("method", {
    enum: ["mercadopago", "transfer", "cash", "other"],
  }).notNull(),
  status: text("status", {
    enum: ["pending", "completed", "failed"],
  })
    .default("pending")
    .notNull(),
  mpTransactionId: text("mp_transaction_id"),
  mpPaymentId: text("mp_payment_id"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const refunds = sqliteTable("refunds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  requestedBy: integer("requested_by").references(() => users.id),
  amount: real("amount").notNull(),
  reason: text("reason").notNull(),
  status: text("status", {
    enum: ["pending", "processing", "completed", "rejected"],
  })
    .default("pending")
    .notNull(),
  mpRefundId: text("mp_refund_id"),
  processedBy: integer("processed_by").references(() => users.id),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cart = sqliteTable("cart", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").unique(), // guest cart
  userId: integer("user_id")
    .unique()
    .references(() => users.id, { onDelete: "cascade" }), // registered cart
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cartId: integer("cart_id")
    .notNull()
    .references(() => cart.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  addedAt: integer("added_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlist = sqliteTable("wishlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // e.g. "product.create", "price.update"
  entityType: text("entity_type").notNull(), // e.g. "product", "order"
  entityId: integer("entity_id"),
  oldValue: text("old_value"), // JSON string
  newValue: text("new_value"), // JSON string
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});
