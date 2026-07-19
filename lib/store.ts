import { create } from "zustand";
import { User, ScholarshipWithMatch } from "./types";

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Scholarships
  scholarships: ScholarshipWithMatch[];
  setScholarships: (scholarships: ScholarshipWithMatch[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;

  // Liked scholarship IDs
  likedIds: Set<string>;
  addLikedId: (id: string) => void;
  setLikedIds: (ids: string[]) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  scholarships: [],
  setScholarships: (scholarships) => set({ scholarships, currentIndex: 0 }),
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),

  likedIds: new Set(),
  addLikedId: (id) =>
    set((state) => {
      const newSet = new Set(state.likedIds);
      newSet.add(id);
      return { likedIds: newSet };
    }),
  setLikedIds: (ids) => set({ likedIds: new Set(ids) }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      user: null,
      scholarships: [],
      currentIndex: 0,
      likedIds: new Set(),
      isLoading: false,
    }),
}));
