import { create } from 'zustand';

interface UiLoadingState {
  pendingRequests: number;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
}

export const useUiLoadingStore = create<UiLoadingState>((set) => ({
  pendingRequests: 0,
  isLoading: false,
  startLoading: () =>
    set((state) => {
      const nextPending = state.pendingRequests + 1;
      return {
        pendingRequests: nextPending,
        isLoading: nextPending > 0,
      };
    }),
  stopLoading: () =>
    set((state) => {
      const nextPending = Math.max(0, state.pendingRequests - 1);
      return {
        pendingRequests: nextPending,
        isLoading: nextPending > 0,
      };
    }),
  resetLoading: () =>
    set({
      pendingRequests: 0,
      isLoading: false,
    }),
}));
