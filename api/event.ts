import { SubroutineReference } from "./_temp.ts";
////////////////////////////////////////////////////////////////////////////////////////
//TODO remove value types from here, how to expose them as values at the api?
export const TEAM = {
    ["both"]: "All",
    ["blue"]: "Team 1",
    ["red"]: "Team 2",
} as const;
export type Team = typeof TEAM[keyof typeof TEAM];

export const SLOT = {
    0: "Slot 0",
    1: "Slot 1",
    2: "Slot 2",
    3: "Slot 3",
    4: "Slot 4",
    5: "Slot 5",
    6: "Slot 6",
    7: "Slot 7",
    8: "Slot 8",
    9: "Slot 9",
    10: "Slot 10",
    11: "Slot 11",
} as const;
export type Slot = typeof SLOT[keyof typeof SLOT];

export const HEROES = {
    Ana: "Ana",
    Ashe: "Ashe",
    Baptiste: "Baptiste",
    Bastion: "Bastion",
    Brigitte: "Brigitte",
    Cassidy: "Cassidy",
    DVa: "D.Va",
    Doomfist: "Doomfist",
    Echo: "Echo",
    Genji: "Genji",
    Hanzo: "Hanzo",
    Illari: "Illari",
    JunkerQueen: "Junker Queen",
    Junkrat: "Junkrat",
    Juno: "Juno",
    Kiriko: "Kiriko",
    Lifeweaver: "Lifeweaver",
    Lucio: "Lúcio",
    Mei: "Mei",
    Mercy: "Mercy",
    Moira: "Moira",
    Mauga: "Mauga",
    Orisa: "Orisa",
    Pharah: "Pharah",
    Ramattra: "Ramattra",
    Reaper: "Reaper",
    Reinhardt: "Reinhardt",
    Roadhog: "Roadhog",
    Sigma: "Sigma",
    Sojourn: "Sojourn",
    Soldier76: "Soldier: 76",
    Sombra: "Sombra",
    Symmetra: "Symmetra",
    Torbjorn: "Torbjörn",
    Tracer: "Tracer",
    Venture: "Venture",
    Widowmaker: "Widowmaker",
    Winston: "Winston",
    WreckingBall: "Wrecking Ball",
    Zarya: "Zarya",
    Zenyatta: "Zenyatta",
} as const;
export type Hero = keyof typeof HEROES;

export type Player = "All" | Slot | Hero;

////////////////////////////////////////////////////////////////////////////////////////

export interface EventInterop {
    compile: () => string;
    signature: () => string;
}

////////////////////////////////////////////////////////////////////////////////////////

export type Event = { ["_interop"]: EventInterop };
export type PlayerEvent = Event & { type: () => PlayerEventCategory };

export type PlayerEventCategory = "general" | "combat" | "heal";
type PlayerEventType = keyof typeof PET_TO_CAT;
const PET_TO_CAT = {
    "Ongoing - Each Player": "general",
    "Player Earned Elimination": "combat",
    "Player Dealt Final Blow": "combat",
    "Player Dealt Damage": "combat",
    "Player Took Damage": "combat",
    "Player Died": "combat",
    "Player Dealt Healing": "heal",
    "Player Received Healing": "heal",
    "Player Joined Match": "general",
    "Player Left Match": "general",
    "Player Dealt Knockback": "combat",
    "Player Received Knockback": "combat",
} satisfies { [key: string]: PlayerEventCategory };

////////////////////////////////////////////////////////////////////////////////////////

export const GlobalEvent: () => Event = (() => {
    const content = "Ongoing - Global";
    const wrappedContent = compileEvent([content]);

    return () => {
        return {
            _interop: {
                compile: () => wrappedContent,
                signature: () => wrappedContent,
            },
        };
    };
})();

export const SubroutineEvent = (
    ref: SubroutineReference,
): Event => {
    const content = ["Subroutine", ref];
    return {
        _interop: {
            compile() {
                return compileEvent(content);
            },
            signature() {
                return content.join();
            },
        },
    };
};

export interface PlayerEventOptions {
    type?: PlayerEventType;
    team?: Team;
    player?: Player;
}
export const PlayerEvent = (
    opt?: PlayerEventOptions,
): PlayerEvent => {
    const type: PlayerEventType = opt?.type ?? "Ongoing - Each Player";
    const team: Team = opt?.team ?? "All";
    const player: Player = opt?.player ?? "All";

    const content = [type, team, player];
    return {
        type: () => PET_TO_CAT[type],
        _interop: {
            compile() {
                return compileEvent(content as string[]);
            },
            signature() {
                return content.join();
            },
        },
    };
};
////////////////////////////////////////////////////////////////////////////////////////

function compileEvent(content: string[]): string {
    return `\
    event
    {
        ${content.join(";\n\t")};
    }`;
}

////////////////////////////////////////////////////////////////////////////////////////
