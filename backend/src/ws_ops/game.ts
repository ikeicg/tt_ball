import {Server, Socket} from 'socket.io';

function gameSocketHandle (io: Server): void {

    const gameIO = io.of("/game");

    gameIO.on("connection", (socket: Socket) => {
        console.log("inside games")
    })
} 

module.exports = gameSocketHandle