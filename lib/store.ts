import { create } from "zustand";
import { User, OpportunityWithMatch } from "./types";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  opportunities: OpportunityWithMatch[];
  setOpportunities: (opportunities: OpportunityWithMatch[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;

  likedIds: Set<string>;
  addLikedId: (id: string) => void;
  setLikedIds: (ids: string[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  opportunities: [],
  setOpportunities: (opportunities) => set({ opportunities, currentIndex: 0 }),
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),

  likedIds: new Set(),
  addLikedId: (id) =>
    set((state) => {
      const next = new Set(state.likedIds);
      next.add(id);
      return { likedIds: next };
    }),
  setLikedIds: (ids) => set({ likedIds: new Set(ids) }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      user: null,
      opportunities: [],
      currentIndex: 0,
      likedIds: new Set(),
      isLoading: false,
    }),
}));
