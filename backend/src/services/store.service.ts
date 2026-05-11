// import { v4 } from "uuid";
// import type { Joiner } from "../sockets/lobby.models.js";

// export type GroupId = string;
// export type PlayerId = number;

// export type Id = GroupId | PlayerId;

// export type Group = Lobby | Game;

// export interface Game { }

// export interface Lobby {
//     name: string;
//     password?: string | null;
//     hostId: PlayerId;
//     hostNickname: string;
//     joiners: Map<PlayerId, Joiner>;
//     maxPlayers: number;
// }

// export function lobbies(): [GroupId, Lobby][] {
//     return Array.from(groups.entries()).filter((group): group is [GroupId, Lobby] => 'name' in group[1]);
// }

// export function games(): [GroupId, Game][] {
//     return Array.from(groups.entries()).filter((group): group is [GroupId, Game] => !('name' in group[1]));
// }

// export function add(group: Group): GroupId {
//     const id = v4();
//     groups.set(id, group);
//     return id;
// }

// export function group(id: Id): Group | undefined {
//     if (typeof id === 'number') {
//         const groupId = players.get(id);
//         if (groupId) return groups.get(groupId);
//     } else return groups.get(id)

// }

// export function lobby(id: Id): Lobby | undefined {
//     const res = group(id);
//     if (res && asLobby(res)) return res;
// }

// export function game(id: Id): Game | undefined {
//     const res = group(id);
//     if (res && asGame(res)) return res;
// }

// const groups: Map<GroupId, Group> = new Map();
// const players: Map<PlayerId, GroupId> = new Map();

// export function asGame(group: Group): group is Game {
//     return !('name' in group);
// }

// export function asLobby(group: Group): group is Lobby {
//     return 'name' in group;
// }