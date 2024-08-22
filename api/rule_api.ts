import {
    ActionLike,
    ConditionLike,
    INTEROP,
    INTEROP_SYMBOL,
    SubroutineReference,
} from "./_temp.ts";
import {
    EventInterop,
    GlobalEvent,
    PlayerEvent,
    PlayerEventOptions,
    SubroutineEvent,
} from "./event.ts";
import {
    compileRule,
    hashRule,
    lintRule,
    RuleBlock,
    RuleLinterFunction,
} from "./rule.ts";

////////////////////////////////////////////////////////////////////////////////////////
const LINTERS = {
    title_length(rule: RuleBlock) {
        return rule.title.length > 128
            ? "Title cannot exceed 128 characters."
            : "";
    },
    no_conditions(rule: RuleBlock) {
        return rule.conditions.expose().length
            ? "Subroutines cannot have conditions."
            : "";
    },
    no_eventplayer_ref(rule: RuleBlock) {
        return (rule.actions.expose().some((item) =>
                item.includes("Event Player")
            ) ||
                rule.conditions.expose().some((item) =>
                    item.includes("Event Player")
                ))
            ? 'Global rules cannot contain "Event Player" references.'
            : "";
    },
    no_attacker_or_victim_ref(rule: RuleBlock) {
        return (rule.actions.expose().some((item) =>
                item.includes("Attacker")
            ) ||
                rule.actions.expose().some((item) => item.includes("Victim")) ||
                rule.conditions.expose().some((item) =>
                    item.includes("Attacker")
                ) ||
                rule.conditions.expose().some((item) =>
                    item.includes("Victim")
                ))
            ? 'Non combat rules cannot contain "Attacker" or "Victim" references.'
            : "";
    },
} satisfies { [key: string]: RuleLinterFunction };

export const LINTER_SETS = {
    global: [LINTERS.title_length, LINTERS.no_eventplayer_ref],
    subroutine: [LINTERS.title_length, LINTERS.no_conditions],
    playerGeneral: [
        LINTERS.title_length,
        LINTERS.no_attacker_or_victim_ref,
    ],
    playerCombat: [LINTERS.title_length],
};

////////////////////////////////////////////////////////////////////////////////////////
export interface AddActionsOptions {
    prepend?: boolean;
}
export interface AddConditionsOptions {
    prepend?: boolean;
}
export interface RuleCompileOptions {
    lint?: boolean;
}

export type RuleInterop = {
    [INTEROP_SYMBOL]: ReturnType<typeof RuleBuilder>[INTEROP];
};

export const RuleBuilder = (
    event: EventInterop,
    linterSet: RuleLinterFunction[],
) => {
    const rule = new RuleBlock(event);

    const ruleApi = {
        title(title: string) {
            rule.title = title;
            return this;
        },
        enable() {
            rule.disabled = false;
            return this;
        },
        disable() {
            rule.disabled = true;
            return this;
        },
        actions(actions: ActionLike[], options?: AddActionsOptions) {
            if (options?.prepend) {
                rule.actions.prepend(actions);
            } else {
                rule.actions.append(actions);
            }
            return this;
        },
        conditions(
            conditions: ConditionLike[],
            options?: AddConditionsOptions,
        ) {
            if (options?.prepend) {
                rule.conditions.prepend(conditions);
            } else {
                rule.conditions.append(conditions);
            }
            return this;
        },
        [INTEROP_SYMBOL]: {
            compile(options?: RuleCompileOptions) {
                if (options?.lint && this.lint()) {
                    throw new Error(
                        "Rule failed on linting, aborting compile function.",
                    );
                }
                return compileRule(rule);
            },
            hash() {
                return hashRule(rule);
            },
            lint() {
                return lintRule(rule, linterSet);
            },
            expose() {
                return rule;
            },
        },
        priority(number: number) {
            rule.priority = number;
            return this;
        },
    };
    return ruleApi;
};
////////////////////////////////////////////////////////////////////////////////////////
export const GlobalRule = () => {
    return RuleBuilder(GlobalEvent()[INTEROP_SYMBOL], LINTER_SETS.global);
};
export const Subroutine = (ref: SubroutineReference) => {
    const res = RuleBuilder(
        SubroutineEvent(ref)[INTEROP_SYMBOL],
        LINTER_SETS.subroutine,
    );
    return res as Omit<typeof res, "conditions">;
};
export const PlayerRule = (options?: PlayerEventOptions) => {
    const event = PlayerEvent(options);
    return RuleBuilder(
        event[INTEROP_SYMBOL],
        (event.type === "general")
            ? LINTER_SETS.playerGeneral
            : LINTER_SETS.playerCombat,
    );
};
////////////////////////////////////////////////////////////////////////////////////////
