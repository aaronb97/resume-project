import { Switch } from "@/components/ui/switch"; //
import { useSettingsStore } from "@/store/useSettingsStore";

export function TopBar() {
  const { useMockData, toggleMockData } = useSettingsStore();

  return (
    <header className="flex items-center justify-between h-12 w-full border-b bg-neutral-900 px-4">
      <h1 className="text-sm font-semibold select-none">My App</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm select-none">Mock data</span>

        <Switch
          checked={useMockData}
          onCheckedChange={toggleMockData}
          aria-label="Toggle mock data"
        />
      </div>
    </header>
  );
}
