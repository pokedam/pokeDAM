import { v4 } from "uuid";
import type { Lobby } from "./lobby.js";
import type { Game } from "./game.js";
import type { GroupId, Id, PlayerId } from "shared_types";

export type Group = Lobby | Game;


export interface Store<Val, Id> {
    get: (id: Id) => Val | undefined,
    set: (value: Val, id?: Id) => Id,
    all: () => [Id, Val][]
}

const _groups: Map<GroupId, Group> = new Map();
const _players: Map<PlayerId, GroupId> = new Map();

export const groups = {
    id: (id: Id): GroupId | undefined => {
        return typeof id === 'number' ? _players.get(id) : id;
    },
    get: (id: Id): Group | undefined => {
        let groupId = groups.id(id);
        if (groupId) return _groups.get(groupId);
    },
    set: (value: Group, id?: Id): GroupId => {
        const actualId = id
            ? typeof (id) === 'number'
                ? _players.get(id) ?? v4()
                : id
            : v4();
        _groups.set(actualId, value);
        return actualId;
    },
    delete: (id: GroupId) => _groups.delete(id),
    all: (): Iterable<[GroupId, Group]> => _groups.entries(),
};

export const lobbies = {
    id: groups.id,
    get: (id: Id): Lobby | undefined => {
        const res = groups.get(id);
        if (res && 'name' in res) return res;
    },
    set: groups.set,
    delete: groups.delete,
    all: function* (): Iterable<[GroupId, Lobby]> {
        for (const [id, group] of _groups.entries()) {
            if ('name' in group)
                yield [id, group];
        }
    },

};

export const games = {
    id: groups.id,
    get: (id: Id): Game | undefined => {
        const res = groups.get(id);
        if (res && !('name' in res)) return res;
    },
    set: groups.set,
    delete: groups.delete,
    all: function* (): Iterable<[GroupId, Game]> {
        for (const [id, group] of _groups.entries()) {
            if (!('name' in group))
                yield [id, group]
        }
    }
};

export const players = {
    set: (id: PlayerId, groupId: GroupId) => _players.set(id, groupId),
    delete: (id: PlayerId) => _players.delete(id),
};


function asGame(group: Group): group is Game {
    return !('name' in group);
}

function asLobby(group: Group): group is Lobby {
    return 'name' in group;
}