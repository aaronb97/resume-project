import { TopBar } from "@/components/TopBar";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />

      <div className="flex-1 self-center p-4 overflow-auto flex max-w-[2000px] w-full">
        <Outlet />
      </div>
    </div>
  );
}
