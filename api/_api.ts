import { GlobalEvent, PlayerEvent, SubroutineEvent } from "./event.ts";
import { GlobalRule, PlayerRule, Subroutine } from "./rule.ts";
import { SLOT, TEAM } from "./values.const.ts";

export const api = {
    event: {
        global: GlobalEvent,
        player: PlayerEvent,
        subroutine: SubroutineEvent,
    },
    rule: {
        global: GlobalRule,
        player: PlayerRule,
        subroutine: Subroutine,
    },
    values: {
        team: TEAM,
        slot: SLOT,
    },
};
