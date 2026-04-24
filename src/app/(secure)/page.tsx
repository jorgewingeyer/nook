import { verifySession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await verifySession();

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Welcome to Nook. You are logged in as {session?.role}.
      </p>
      <div className="mt-8 rounded-lg bg-blue-50 p-6">
        <h2 className="font-semibold text-blue-900">Getting Started</h2>
        <p className="mt-2 text-sm text-blue-700">
          This is a clean Next.js project with Cloudflare Workers, D1, R2, and authentication set up. You can now build your application.
        </p>
      </div>
    </div>
  );
}
