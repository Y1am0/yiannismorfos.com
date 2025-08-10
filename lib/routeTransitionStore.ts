import { create } from "zustand";

interface RouteTransitionState {
  isExiting: boolean;
  startExit: () => void;
  clearExit: () => void;
}

export const useRouteTransitionStore = create<RouteTransitionState>((set) => ({
  isExiting: false,
  startExit: () => set({ isExiting: true }),
  clearExit: () => set({ isExiting: false }),
}));
