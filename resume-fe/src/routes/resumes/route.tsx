import { TopBar } from "@/components/TopBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/resumes")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />

      <div className="flex-1 self-center p-4 overflow-auto flex max-w-[2000px] w-full">
        <Outlet />
      </div>
    </div>
  );
}
