import { Server, Socket } from "socket.io";
import { ClientData, LobbyQueue } from "../utils/definitions";

function lobbySocketHandle(io: Server): void {
  const lobbyIO = io.of("/lobby");
  const lobby = new LobbyQueue();

  lobbyIO.on("connection", (socket: Socket) => {
    // player requests to join match, gets validated, added to the lobby queue, then batch process the lobby
    socket.on("join_match", ({ name }: { name: string }) => {
      const existingClient = lobby.queue.find(
        (client) => client.socketId === socket.id
      );
      if (existingClient) {
        return;
      }

      const newClient: ClientData = {
        name,
        socketId: socket.id,
        playerToken: "",
      };

      lobby.addClient(newClient);

      if (!lobby.processing) {
        lobby.batchProcess(lobbyIO, 2);
      }
    });

    socket.on("disconnect", () => {
      lobby.removeClient(socket);
    });
  });
}

module.exports = lobbySocketHandle;
