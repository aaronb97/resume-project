import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

export function TopBar() {
  const { useMockData, toggleMockData, showDevTools, toggleShowDevTools } =
    useSettingsStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        toggleShowDevTools();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleShowDevTools]);

  return (
    <header className="flex items-center justify-between h-12 w-full border-b bg-stone-900/50 px-4">
      <h1 className="text-sm font-semibold select-none">Resume Project</h1>

      {showDevTools && (
        <div className="flex items-center gap-2">
          <span className="text-sm select-none">Mock data</span>

          <Switch
            checked={useMockData}
            onCheckedChange={toggleMockData}
            aria-label="Toggle mock data"
          />
        </div>
      )}
    </header>
  );
}
