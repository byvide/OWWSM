// type slotNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// type slotFormat<N extends number> = `Slot ${N}`; //TODO note : Template Literal Types
// type PlayerSlot = slotFormat<slotNumbers[number]>;
////////////////////////////////////////////////////////////////////////////////////////////////
export const TEAM = {
    ["both"]: "All",
    ["blue"]: "Team 1",
    ["red"]: "Team 2",
} as const;
export type Team = typeof TEAM[keyof typeof TEAM];
////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////
const HEROES = [
    "Ana",
    "Ashe",
    "Baptiste",
    "Bastion",
    "Brigitte",
    "Cassidy",
    "D.Va",
    "Doomfist",
    "Echo",
    "Genji",
    "Hanzo",
    "Illari",
    "Junker Queen",
    "Junkrat",
    "Juno",
    "Kiriko",
    "Lifeweaver",
    "Lúcio",
    "Mei",
    "Mercy",
    "Moira",
    "Mauga",
    "Orisa",
    "Pharah",
    "Ramattra",
    "Reaper",
    "Reinhardt",
    "Roadhog",
    "Sigma",
    "Sojourn",
    "Soldier: 76",
    "Sombra",
    "Symmetra",
    "Torbjörn",
    "Tracer",
    "Venture",
    "Widowmaker",
    "Winston",
    "Wrecking Ball",
    "Zarya",
    "Zenyatta",
] as const;
export type Hero = typeof HEROES[keyof typeof HEROES];
////////////////////////////////////////////////////////////////////////////////////////////////
