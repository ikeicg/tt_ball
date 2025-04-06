export type MatchData = {
  id: string;
  playerList: string[];
  status: GameStatus;
  currentPlayerIndex: 0 | 1;
  state: {
    score: Record<string, number>;
    stage: number;
    half: 0 | 1;
    action: "attack" | "defend";
  };
};

export enum GameStatus {
  Starting = "Starting",
  Waiting = "Waiting",
  InPlay = "InPlay",
  Finished = "Finished",
  Rendering = "Rendering",
}
