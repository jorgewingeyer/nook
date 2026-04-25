import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { verifySession } from "@/lib/session";

export default async function SecureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <SidebarProvider>
      <AppSidebar userRole={session?.role ?? "agent"} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sand/40 bg-warm-white px-4 shadow-xs">
          <SidebarTrigger className="-ml-1 text-warm-gray hover:text-espresso" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-sand/60" />
          <span className="text-sm text-warm-gray">Panel de Administración</span>
        </header>
        <div className="flex flex-1 flex-col bg-cream p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
