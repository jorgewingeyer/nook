import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nook",
  description: "Next.js app with Cloudflare Workers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
