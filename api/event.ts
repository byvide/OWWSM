import { hashString, SubroutineREF } from "./_temp.ts";
import { Team } from "./values.const.ts";
import { Player } from "./values.derived.ts";
////////////////////////////////////////////////////////////////////////////////////////
export interface EventAPI {
    compile: () => string;
    hash: () => Promise<string>;
}
export interface PlayerEventAPI extends EventAPI {
    type: PlayerEventCategory;
}
////////////////////////////////////////////////////////////////////////////////////////
type PlayerEventCategory = "general" | "combat";
type PlayerEventType = keyof typeof PET_TO_CAT;
const PET_TO_CAT = {
    "Ongoing - Each Player": "general",
    "Player Earned Elimination": "combat",
    "Player Dealt Final Blow": "combat",
    "Player Dealt Damage": "combat",
    "Player Took Damage": "combat",
    "Player Died": "combat",
    "Player Dealt Healing": "general",
    "Player Received Healing": "general",
    "Player Joined Match": "general",
    "Player Left Match": "general",
    "Player Dealt Knockback": "combat",
    "Player Received Knockback": "combat",
} satisfies { [key: string]: PlayerEventCategory };
////////////////////////////////////////////////////////////////////////////////////////
function compileEvent(content: string[]): string {
    return `\
    event
    {
        ${content.join(";\n\t")};
    }`;
}
function hashEvent(content: string) {
    return hashString(content);
}
////////////////////////////////////////////////////////////////////////////////////////
export const GlobalEvent: () => EventAPI = (() => {
    const content = "Ongoing - Global";
    const wrappedContent = compileEvent([content]);
    const hashedContent = hashEvent(content);

    return () => {
        return {
            compile: () => wrappedContent,
            hash: () => hashedContent,
        };
    };
})();

export const SubroutineEvent = (ref: SubroutineREF): EventAPI => {
    const content = ["Subroutine", ref];
    return {
        compile: () => compileEvent(content),
        hash: () => hashEvent(content.join()),
    };
};

export interface PlayerEventOptions {
    type?: PlayerEventType;
    team?: Team;
    player?: Player;
}
export const PlayerEvent = (opt?: PlayerEventOptions): PlayerEventAPI => {
    const type: PlayerEventType = opt?.type ?? "Ongoing - Each Player";
    const team: Team = opt?.team ?? "All";
    const player: Player = opt?.player ?? "All";

    const content = [type, team, player];
    return {
        compile: () => compileEvent(content as string[]),
        hash: () => hashEvent(content.join()),
        type: PET_TO_CAT[type],
    };
};
////////////////////////////////////////////////////////////////////////////////////////
