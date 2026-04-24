import { verifySession } from "@/lib/session";
import Link from "next/link";

export default async function SecureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-8 text-lg font-bold">Nook</h2>
        <nav className="space-y-2">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          {session?.role === "admin" && (
            <>
              <Link
                href="/users"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Users
              </Link>
              <Link
                href="/settings"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Settings
              </Link>
            </>
          )}
        </nav>
        <hr className="my-6" />
        <p className="mb-4 text-xs text-gray-600">{session?.role}</p>
        <form
          action={async () => {
            "use server";
            const { deleteSession } = await import("@/lib/session");
            await deleteSession();
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
