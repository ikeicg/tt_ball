export type ClientData = {
    name: string;
    socketId: string;
};

export enum GameStatus {
    Waiting = 'Waiting',
    InProgress = 'InProgress',
    Finished = 'Finished'
}

export type GameData = {
    'players': Array<ClientData>,
    'winner': ClientData | null
    'status': GameStatus
}