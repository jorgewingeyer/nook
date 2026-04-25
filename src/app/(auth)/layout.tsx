export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-sand/60 bg-warm-white px-8 py-10 shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
