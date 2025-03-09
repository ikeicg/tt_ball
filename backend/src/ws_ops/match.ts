import { Server, Socket } from "socket.io";
import { ClientData, MatchData, GameStatus } from "../definitions";

const LiveMatches = new Map<string, [Set<string>, boolean]>();
const playerMatchMap = new Map<string, string>();
const socketPlayerMap = new Map<string, string>();

function handlePlayerDisconnect(socket: Socket) {
  const playerToken = socketPlayerMap.get(socket.id);
  if (!playerToken) return;

  const matchId = playerMatchMap.get(playerToken);
  if (!matchId) return;

  const players = LiveMatches.get(matchId);
  if (players) {
    players[0].delete(playerToken);
    if (players[0].size === 0) {
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
        let players = LiveMatches.get(matchId);
        let matchStarted = false;

        if (!players) {
          players = [new Set(), matchStarted];
          LiveMatches.set(matchId, players);
        }

        if (!players[0].has(playerToken)) {
          players[0].add(playerToken);
          socket.emit("client_info", { playerToken, clientData });

          //incase of rejoining, request the other player to share state
          if (players[1]) {
            io.to(matchId).except(socket.id).emit("share_state", {});
            return;
          }

          if (players[0].size === 2) {
            players[1] = true; //the match has kicked off

            let playerList = Array.from(players[0]);

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

    // client intiates the scorring, server should request the critical params from the client which will be sent in another event
    socket.on("initiate_scoring", () => {});

    // client sends their game param which the server sends to their opponent in the match room, which the clients use to render the scoring/animation
    socket.on("game_param", () => {});

    // the scoring / rendering is done, each client sends the resulting state which the server compares for fairness and broadcasts an update to game state&progress
    // the game over event is broadcasted if the game progress is at maximum and winner announced.
    socket.on("render_complete", () => {});

    socket.on("disconnect", () => {
      handlePlayerDisconnect(socket);
    });
  });
}

module.exports = matchSocketHandle;
