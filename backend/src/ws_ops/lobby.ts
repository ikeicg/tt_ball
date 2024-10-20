import { Server, Socket } from 'socket.io';
import { ClientData } from '../definitions';

function lobbySocketHandle(io: Server): void {
    const lobbyIO = io.of("/lobby");
    const gameLobby: Array<ClientData> = [];

    lobbyIO.on("connection", (socket: Socket) => {
        console.log("A user connected to the lobby:", socket.id);

        socket.on('join_game', ({ name }: { name: string }) => {
            const existingClient = gameLobby.find(client => client.socketId === socket.id);
            if (existingClient) {
                return;
            }

            const newClient: ClientData = {
                name,
                socketId: socket.id
            };

            gameLobby.push(newClient);
            console.log(`${name} joined the lobby.`);

            if (gameLobby.length === 2) {
                gameLobby.forEach(client => {
                    lobbyIO.to(client.socketId).emit('start_game', {gameId: 101});
                });
                console.log('Game started with players:', gameLobby);
                gameLobby.length = 0;
            }
        });

        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected.`);
            const index = gameLobby.findIndex(client => client.socketId === socket.id);
            if (index !== -1) {
                gameLobby.splice(index, 1);
            }
        });
    });
}

module.exports = lobbySocketHandle;
