"use server";

import { verifyPassword, hashPassword, verifySession, deleteSession, createSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string }> {
  try {
    const session = await verifySession();

    if (!session) {
      return { error: "Not authenticated" };
    }

    const { env } = await getCloudflareContext();
    const db = getDb((env as any).DB);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user || user.length === 0) {
      return { error: "User not found" };
    }

    const userData = user[0];

    const passwordMatch = await verifyPassword(
      currentPassword,
      userData.password,
    );

    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        mustChangePassword: false,
      })
      .where(eq(users.id, session.userId));

    await deleteSession();
    await createSession(session.userId, session.role, false);

    return {};
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "An error occurred while changing password" };
  }
}
