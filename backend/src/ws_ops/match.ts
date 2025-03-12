import { Server, Socket } from "socket.io";
import { ClientData, MatchData, GameStatus, LiveMatch } from "../definitions";

const LiveMatches = new Map<string, LiveMatch>();
const playerMatchMap = new Map<string, string>();
const socketPlayerMap = new Map<string, string>();

function handlePlayerDisconnect(socket: Socket) {
  const playerToken = socketPlayerMap.get(socket.id);
  if (!playerToken) return;

  const matchId = playerMatchMap.get(playerToken);
  if (!matchId) return;

  const match = LiveMatches.get(matchId);
  if (match) {
    match.playerList.delete(playerToken);
    if (match.playerList.size === 0) {
      LiveMatches.delete(matchId); // Remove match if empty
    }
  }

  // Clean up mappings
  socketPlayerMap.delete(socket.id);
  playerMatchMap.delete(playerToken);
}

function isMatchValid(matchId: string): boolean {
  const [T0] = atob(matchId).split("#");
  const gameAge = Date.now() - Number(T0);
  return gameAge <= 300000 || LiveMatches.has(matchId);
}

function matchSocketHandle(io: Server): void {
  const matchIO = io.of("/match");

  matchIO.on("connection", (socket: Socket) => {
    //player requests to join match, game starts and blank Match/game state is broadcasted
    socket.on(
      "join_match",
      ({ name, matchId }: { name: string; matchId: string }) => {
        // extract timestamp and players from matchId
        const [T0, player1, player2] = atob(matchId).split("#");
        const isPlayerValid = name === player1 || name === player2;

        // check if match is invalid or expired
        if (!isMatchValid(matchId)) {
          socket.emit("error", { message: "Invalid or expired match" });
          return;
        }

        // if player is not included, void the connection and stop
        if (!isPlayerValid) {
          socket.emit("error", { message: "Invalid player" });
          return;
        }

        // player and match is valid, now generate player token and client data
        const playerToken = `${matchId}#${name}`;
        let clientData: ClientData = {
          name,
          playerToken,
          socketId: socket.id,
        };

        //join the match room and create mappings
        socket.join(matchId);
        socketPlayerMap.set(socket.id, playerToken);
        playerMatchMap.set(playerToken, matchId);

        //add players to show a match is live
        let match = LiveMatches.get(matchId);
        let matchStarted = false;
        let stateHash = "";

        if (!match) {
          match = {
            playerList: new Set(),
            matchStarted,
            stateHash,
          };
          LiveMatches.set(matchId, match);
        }

        if (!match.playerList.has(playerToken)) {
          match.playerList.add(playerToken);
          socket.emit("client_info", { playerToken, clientData });

          //incase of rejoining, request the other player to share state
          if (match.matchStarted) {
            io.to(matchId).except(socket.id).emit("share_state", {});
            return;
          }

          if (match.playerList.size === 2) {
            match.matchStarted = true; //the match has kicked off

            let playerList = Array.from(match.playerList);

            let matchState: MatchData = {
              id: matchId,
              playerList,
              status: GameStatus.InPlay,
              state: {
                score: playerList.reduce<Record<string, number>>((x, y) => {
                  x[y] = 0;
                  return x;
                }, {}),
                stage: 1,
                role: 1,
              },
            };
            io.to(matchId).emit("start_match", matchState); // send fresh game/match state
          }
        }
      }
    ); // complete

    // client is sharing state
    socket.on("sharing_state", (matchId: string, message: object) => {
      io.to(matchId).except(socket.id).emit("sharing_state", { message });
    });

    // client registers attack attempt, server broadcasts an update to game state/progress
    socket.on("attack_attempt", (matchData) => {
      const { matchId, state } = matchData;

      if (state.role !== 0) {
        socket.emit("error", { message: "Invalid attack attempt" });
        io.to(matchId).emit("upgrade_state", matchData);
        return;
      }

      const newState = { ...state, role: 1 };

      io.to(matchId).emit("upgrade_state", { ...matchData, state: newState });
    });

    // client registers defense attempt, server broadcasts an update to game state/progress
    socket.on("defense_attempt", (matchData) => {
      const { matchId, state } = matchData;

      if (state.role !== 1) {
        socket.emit("error", { message: "Invalid defense attempt" });
        io.to(matchId).emit("upgrade_state", matchData);
        return;
      }

      const newState = { ...state, role: 0 };

      io.to(matchId).emit("upgrade_state", { ...matchData, state: newState });
    });

    // client intiates the scoring, server should request the critical params from the client which will be sent in another event
    socket.on("initiate_scoring", (matchId) => {
      io.to(matchId).emit("send_moves", {});
    });

    // client sends their game moves which the server sends to their opponent in the match room, which the clients use to render the scoring/animation
    socket.on("game_moves", ({ matchId, moves }) => {
      io.to(matchId).except(socket.id).emit("sending_moves", { moves });
    });

    // the scoring / rendering is done, each client sends the resulting state which the server compares for fairness and broadcasts an update to game state&progress
    // the game over event is broadcasted if the game progress is at maximum and winner announced.
    socket.on(
      "render_complete",
      ({
        matchId,
        stateHash,
        matchData,
      }: {
        matchId: string;
        stateHash: string;
        matchData: MatchData;
      }) => {
        let match = LiveMatches.get(matchId);
        if (!match) return;

        // first client reports back
        if (!match.stateHash) {
          match.stateHash = stateHash;
          return;
        }

        // second player reports back
        let fairnessCheck = match.stateHash === stateHash;

        if (fairnessCheck) {
          match.stateHash = "";
          let maxStage = 6;
          let { stage } = matchData.state;

          // check if the game should be over, if yes, send end_game event else update stage
          if (stage >= maxStage) {
            io.to(matchId).emit("end_game", {});
            return;
          }

          stage++;
          let newState = { ...matchData.state, stage };
          io.to(matchId).emit("upgrade_state", {
            ...matchData,
            state: newState,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      handlePlayerDisconnect(socket);
    });
  });
}

module.exports = matchSocketHandle;
