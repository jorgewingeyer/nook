"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/session";
import { hashPassword } from "@/lib/session";

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
};

export async function getUsersAction(): Promise<UserListItem[]> {
  const session = await verifySession();
  if (session?.role !== "admin") return [];

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(sql`${users.role} != 'customer'`)
    .orderBy(desc(users.createdAt));
}

export async function createUserAction(
  name: string,
  email: string,
  role: "admin" | "agent",
  temporaryPassword: string,
): Promise<{ error?: string; data?: { id: number } }> {
  const session = await verifySession();
  if (session?.role !== "admin") return { error: "No autorizado" };

  if (!name.trim() || !email.trim() || !temporaryPassword) {
    return { error: "Todos los campos son obligatorios" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  try {
    const hashedPw = await hashPassword(temporaryPassword);
    const [user] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPw,
        role,
        mustChangePassword: true,
      })
      .returning({ id: users.id });
    return { data: { id: user.id } };
  } catch {
    return { error: "Ya existe un usuario con ese email" };
  }
}

export async function toggleUserActiveAction(
  userId: number,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session?.role !== "admin") return { error: "No autorizado" };
  if (session.userId === userId) return { error: "No podés desactivar tu propio usuario" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const user = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, userId)).get();
  if (!user) return { error: "Usuario no encontrado" };

  await db.update(users).set({ isActive: !user.isActive }).where(eq(users.id, userId));
  return {};
}

export async function resetUserPasswordAction(
  userId: number,
  newPassword: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session?.role !== "admin") return { error: "No autorizado" };

  if (!newPassword || newPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const hashedPw = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ password: hashedPw, mustChangePassword: true })
    .where(eq(users.id, userId));

  return {};
}
