import { TopBar } from "@/components/TopBar";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 p-2 overflow-auto flex mt-2">
        <Outlet />
      </div>
    </div>
  );
}
