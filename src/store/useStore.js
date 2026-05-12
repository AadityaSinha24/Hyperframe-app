// src/store/useStore.js
import { create } from "zustand";

export const useStore = create((set) => ({
  messages: [],
  composition: null,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setComposition: (composition) =>
    set(() => ({ composition })),

  resetChat: () =>
    set(() => ({ messages: [], composition: null })),
}));