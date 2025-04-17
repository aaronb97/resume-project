import { Outlet, createRootRoute } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="p-2 h-screen w-full">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
