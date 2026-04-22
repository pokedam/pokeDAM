import { create } from "./lobby.create.js";
import { getAll } from "./lobby.get-all.js";
import { get } from "./lobby.get.js";
import { leave, leaveWithLobbyId } from "./lobby.leave.js";

export const lobbyService = {
    get,
    getAll,
    leave,
    leaveWithLobbyId,
    create,
};
