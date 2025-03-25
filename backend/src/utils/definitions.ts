import { randomUUID as uuid, UUID } from "crypto";
import { Namespace, Socket } from "socket.io";

export type ClientData = {
  name: string;
  playerToken: string;
  socketId: string;
};

export enum GameStatus {
  Starting = "Starting",
  Waiting = "Waiting",
  InPlay = "InPlay",
  Finished = "Finished",
  Rendering = "Rendering",
}

export type MatchData = {
  id: string;
  playerList: string[];
  status: GameStatus;
  currentPlayerIndex: 0 | 1;
  state: {
    score: Record<string, number>;
    stage: number;
    half: 1 | 2;
    action: "attack" | "defend";
  };
};

export type LiveMatch = {
  playerList: Set<string>;
  matchStarted: boolean;
  stateHash: string;
};

export class LobbyQueue {
  public queue: Array<ClientData> = [];
  public processing: boolean = false;

  public addClient(client: ClientData): void {
    this.queue.push(client);
  }

  public shiftClient(): ClientData | undefined {
    let value: ClientData | undefined = this.queue.shift();
    return value;
  }

  public removeClient(socket: Socket) {
    const index = this.queue.findIndex(
      (client) => client.socketId === socket.id
    );
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  public batchProcess(io: Namespace, quorum: number) {
    this.processing = true;

    setTimeout(() => {
      while (this.queue.length >= quorum) {
        const player1 = this.shiftClient();
        const player2 = this.shiftClient();

        if (player1 && player2) {
          const matchId: string = btoa(
            Date.now().toString().concat(`#${player1.name}#${player2.name}`)
          );
          io.to(player1.socketId).emit("start_match", { matchId });
          io.to(player2.socketId).emit("start_match", { matchId });
        }
      }
      this.processing = false;
    });
  }
}
