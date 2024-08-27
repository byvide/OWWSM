import { Actions } from "./actions.ts";
import { Conditions } from "./conditions.ts";
import { GlobalEvent, PlayerEvent, SubroutineEvent } from "./event.ts";
import { GlobalRule, PlayerRule, Subroutine } from "./rule.ts";

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
    actions: Actions,
    conditions: Conditions,
};
