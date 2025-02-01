import { UserMe } from "@/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<{
  user: UserMe | null;
  token: string | null;
  login: (user: UserMe, token: string) => void;
  logout: () => void;
}>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user: UserMe, token: string) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "auth",
    }
  )
);
