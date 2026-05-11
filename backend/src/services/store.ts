import { v4 } from "uuid";
import type { Lobby } from "./lobby.js";
import type { Game } from "./game.js";

export type GroupId = string;
export type PlayerId = number;

export type Id = GroupId | PlayerId;

export type Group = Lobby | Game;


export interface Store<Val, Id> {
    get: (id: Id) => Val | undefined,
    set: (value: Val, id?: Id) => Id,
    all: () => [Id, Val][]
}

const _groups: Map<GroupId, Group> = new Map();
const _players: Map<PlayerId, GroupId> = new Map();

export const groups = {
    get: (id: Id): Group | undefined => {
        if (typeof id === 'number') {
            const groupId = _players.get(id);
            if (groupId) return _groups.get(groupId);
        } else return _groups.get(id);
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
    get: (id: Id): Game | undefined => {
        const res = groups.get(id);
        if (res && !('name' in res)) return res;
    },
    set: groups.set,
    delete: groups.delete,
    all: function* (): Iterable<[GroupId, Game]> { 
        for(const [id, group] of _groups.entries()) {
            if (!('name' in group))
                yield [id, group]
        }
    }        
};

export const players = {
    get: (id: PlayerId): GroupId | undefined => _players.get(id),
    set: (id: PlayerId, groupId: GroupId) => _players.set(id, groupId),
    delete: (id: PlayerId) => _players.delete(id),
};


function asGame(group: Group): group is Game {
    return !('name' in group);
}

function asLobby(group: Group): group is Lobby {
    return 'name' in group;
}