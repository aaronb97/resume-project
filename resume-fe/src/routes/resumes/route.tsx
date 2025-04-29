import { TopBar } from "@/components/TopBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";

export const Route = createFileRoute("/resumes")({
  component: RouteComponent,
});

function RouteComponent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />

      <div className="flex-1 self-center p-4 overflow-auto flex max-w-[2000px] w-full">
        {ready && <Outlet />}
      </div>
    </div>
  );
}
