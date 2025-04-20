import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  useMockData: boolean;
  showDevTools: boolean;
  toggleMockData: () => void;
  toggleShowDevTools: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      useMockData: false,
      showDevTools: false,
      toggleMockData: () => set({ useMockData: !get().useMockData }),
      toggleShowDevTools: () => set({ showDevTools: !get().showDevTools }),
    }),
    { name: "settings" }
  )
);
