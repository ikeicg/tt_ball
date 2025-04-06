import { MatchData } from "./definitions";

export interface GameInfo {
  currentPlayer: string;
  currentPlayerRole: string;
  scoreboard: string;
  notification: string;
}

export function extractGameInfo(data: MatchData): GameInfo | null {
  const { playerList, currentPlayerIndex, state } = data;

  if (
    !playerList?.[currentPlayerIndex] ||
    Object.keys(state.score).length < 2
  ) {
    return null;
  }

  const [teamA, teamB] = Object.entries(state.score).map((x) => {
    x[0] = x[0].split("#")[1];
    return x;
  });
  const currentPlayer = playerList[currentPlayerIndex].split("#")[1];

  const actionVerb = state.action === "attack" ? "attacking" : "defending";

  const gameInfo: GameInfo = {
    currentPlayer,
    currentPlayerRole: actionVerb,
    notification: `${currentPlayer} is ${actionVerb}...`,
    scoreboard: `${teamA[0].toUpperCase()}  vs  ${teamB[0].toUpperCase()} ${
      teamA[1]
    } : ${teamB[1]} -- ${state.half} Half`,
  };

  return gameInfo;
}
