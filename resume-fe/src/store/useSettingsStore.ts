import { create } from "zustand";
import { persist } from "zustand/middleware";

type Viewer = "microsoft" | "google";

interface SettingsState {
  useMockData: boolean;
  showDevTools: boolean;
  viewer: Viewer;
  showRemovedText: boolean;
  toggleMockData: () => void;
  toggleShowDevTools: () => void;
  setViewer: (viewer: Viewer) => void;
  toggleShowRemovedText: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      useMockData: false,
      showDevTools: false,
      viewer: "microsoft",
      showRemovedText: true,
      toggleMockData: () => set({ useMockData: !get().useMockData }),
      toggleShowDevTools: () => set({ showDevTools: !get().showDevTools }),
      setViewer: (viewer) => set({ viewer }),
      toggleShowRemovedText: () =>
        set({ showRemovedText: !get().showRemovedText }),
    }),
    { name: "settings" },
  ),
);
