import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MatchData } from "./definitions";
import { GameStatus } from "./definitions";

type GameStore = {
  match: MatchData | null;
  message: string;
  setMatch: (match: MatchData) => void;
  setStatus: (status: GameStatus) => void;
  toggleCurrentPlayer: () => void;
  updateScore: (playerToken: string) => void;
  updateStage: () => void;
  updateHalf: () => void;
  toggleAction: () => void;
  setMessage: (message: string) => void;
};

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      match: null,

      message: "",

      setMatch: (match) => set({ match }),

      setStatus: (status) =>
        set((state) =>
          state.match ? { match: { ...state.match, status } } : state
        ),

      toggleCurrentPlayer: () =>
        set((state) =>
          state.match
            ? {
                match: {
                  ...state.match,
                  currentPlayerIndex:
                    state.match.currentPlayerIndex === 0 ? 1 : 0,
                },
              }
            : state
        ),

      updateScore: (playerToken) =>
        set((state) =>
          state.match
            ? {
                match: {
                  ...state.match,
                  state: {
                    ...state.match.state,
                    score: {
                      ...state.match.state.score,
                      [playerToken]:
                        (state.match.state.score[playerToken] || 0) + 1,
                    },
                  },
                },
              }
            : state
        ),

      updateStage: () =>
        set((state) =>
          state.match
            ? {
                match: {
                  ...state.match,
                  state: {
                    ...state.match.state,
                    stage: state.match.state.stage + 1,
                  },
                },
              }
            : state
        ),

      updateHalf: () =>
        set((state) =>
          state.match
            ? {
                match: {
                  ...state.match,
                  state: {
                    ...state.match.state,
                    half: state.match.state.half === 0 ? 1 : 0,
                  },
                },
              }
            : state
        ),

      toggleAction: () =>
        set((state) =>
          state.match
            ? {
                match: {
                  ...state.match,
                  state: {
                    ...state.match.state,
                    action:
                      state.match.state.action === "attack"
                        ? "defend"
                        : "attack",
                  },
                },
              }
            : state
        ),

      setMessage: (message) => set({ message }),
    }),
    { name: "match-storage" }
  )
);

export default useGameStore;
