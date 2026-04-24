"use server";

import { createSession, verifyPassword } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function loginAction(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb((env as any).DB);

    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.length === 0) {
      return { error: "Invalid email or password" };
    }

    const userData = user[0];

    if (!userData.isActive) {
      return { error: "This account is inactive" };
    }

    const passwordMatch = await verifyPassword(password, userData.password);

    if (!passwordMatch) {
      return { error: "Invalid email or password" };
    }

    await createSession(
      userData.id,
      userData.role,
      userData.mustChangePassword,
    );

    return {};
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login" };
  }
}
