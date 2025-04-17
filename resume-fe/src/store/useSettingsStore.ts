import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  useMockData: boolean;
  toggleMockData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      useMockData: false,
      toggleMockData: () => set({ useMockData: !get().useMockData }),
    }),
    { name: "useMockData" }
  )
);
