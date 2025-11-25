import { config } from "@/lib/config";
import { hashPin } from "@/lib/pin";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminState = {
  pinHash: string | null;
  isUnlocked: boolean;
};

type AdminActions = {
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
};

const STORAGE_KEY = "mundough-admin";

export const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set) => ({
      pinHash: null,
      isUnlocked: false,
      unlock: async (pin: string) => {
        const candidate = await hashPin(pin);
        if (candidate !== config.adminPinHash) {
          return false;
        }
        set({ pinHash: candidate, isUnlocked: true });
        return true;
      },
      lock: () => set({ pinHash: null, isUnlocked: false }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ pinHash: state.pinHash }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.pinHash === config.adminPinHash) {
          state.isUnlocked = true;
        } else {
          state.pinHash = null;
          state.isUnlocked = false;
        }
      },
    },
  ),
);

export const getAdminPinHash = () => {
  const { pinHash } = useAdminStore.getState();
  if (pinHash && pinHash === config.adminPinHash) {
    return pinHash;
  }
  return null;
};
