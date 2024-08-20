import { hashString, SubroutineREF } from "./_temp.ts";
import {
    EventAPI,
    GlobalEvent,
    PlayerEvent,
    PlayerEventOptions,
    SubroutineEvent,
} from "./event.ts";

////////////////////////////////////////////////////////////////////////////////////////
type ActionLike = string;

class ActionCollection {
    private actions: ActionLike[] = [];

    append(a: ActionLike[]) {
        this.actions.push(...a);
    }
    prepend(a: ActionLike[]) {
        this.actions.unshift(...a);
    }

    expose() {
        return this.actions;
    }

    compile() { //FIXME ";" when 0
        return `\
    actions
    {
		${this.actions.join(";\n\t")};
    }`;
    }
}
////////////////////////////////////////////////////////////////////////////////////////
type ConditionLike = string;

class ConditionCollection {
    private conditions: ActionLike[] = [];

    append(a: ActionLike[]) {
        this.conditions.push(...a);
    }
    prepend(a: ActionLike[]) {
        this.conditions.unshift(...a);
    }

    expose() {
        return this.conditions;
    }

    compile() {
        if (!this.conditions.length) {
            return "";
        }

        return `\
    conditions
    {
	${this.conditions.join(";\n\t")};
    }`;
    }
    hash() {
        return hashString(JSON.stringify(this.conditions)); //FIXME order of conditions !!!
    }
}
////////////////////////////////////////////////////////////////////////////////////////
type LinterFunction = (r: Rule) => string; // return empty string if everything is fine

const LINTERS = {
    title_length(rule: Rule) {
        return rule.title.length > 128
            ? "Title cannot exceed 128 characters."
            : "";
    },
    NO_conditions(rule: Rule) {
        return rule.conditions.expose().length
            ? "Subroutines cannot have conditions."
            : "";
    },
    NO_eventplayer_ref(rule: Rule) {
        return (rule.actions.expose().some((item) =>
                item.includes("EVENTPLAYER")
            ) ||
                rule.conditions.expose().some((item) =>
                    item.includes("EVENTPLAYER")
                ))
            ? "Global rules cannot contain Event Player references."
            : "";
    },
    NO_attacker_or_victim_ref(rule: Rule) {
        return (rule.actions.expose().some((item) =>
                item.includes("ATTACKER")
            ) ||
                rule.actions.expose().some((item) => item.includes("VICTIM")) ||
                rule.conditions.expose().some((item) =>
                    item.includes("ATTACKER")
                ) ||
                rule.conditions.expose().some((item) =>
                    item.includes("VICTIM")
                ))
            ? "Non combat rules cannot contain Attacker or Victim references."
            : "";
    },
} satisfies { [key: string]: LinterFunction };

const LINTER_SETS = {
    global: [LINTERS.title_length, LINTERS.NO_eventplayer_ref],
    subroutine: [LINTERS.title_length, LINTERS.NO_conditions],
    playerGeneral: [
        LINTERS.title_length,
        LINTERS.NO_attacker_or_victim_ref,
    ],
    playerCombat: [LINTERS.title_length],
};
////////////////////////////////////////////////////////////////////////////////////////
class Rule {
    title = "";
    disabled = false;
    actions = new ActionCollection();
    conditions = new ConditionCollection();
    priority = 0;
    constructor(public event: EventAPI) {}
}
////////////////////////////////////////////////////////////////////////////////////////
function compileRule(rule: Rule) {
    return `\
${rule.disabled ? "disabled " : ""}rule("${rule.title}")
{
${rule.event.compile()}
${rule.conditions.compile()}
${rule.actions.compile()}
}`;
}
async function hashRule(rule: Rule) {
    return (+rule.disabled) + await rule.event.hash() +
        await rule.conditions.hash();
}
function lintRule(rule: Rule, linterSet: LinterFunction[]) {
    const report: string[] = [];
    linterSet.forEach((linter) => {
        const res = linter(rule);
        if (res) {
            report.push(res);
        }
    });

    if (report.length) {
        return { ref: rule, problems: report };
    }
    return false;
}
function mergeRule(a: Rule, b: Rule) { // does not check for equality; when 'a' and 'b' are the same, actions will be duplicated
    a.actions.append(b.actions.expose());
    return a;
}
////////////////////////////////////////////////////////////////////////////////////////
export interface AddActionsOptions {
    prepend: boolean;
}
export interface AddConditionsOptions {
    prepend: boolean;
}

const createRuleAPI = (
    event: EventAPI,
    linterSet: LinterFunction[],
) => {
    const rule = new Rule(event);

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

        _compile() {
            return compileRule(rule);
        },
        _hash() {
            return hashRule(rule);
        },
        _lint() {
            return lintRule(rule, linterSet);
        },
        _expose() {
            return rule;
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
    return createRuleAPI(GlobalEvent(), LINTER_SETS.global);
};
export const Subroutine = (ref: SubroutineREF) => {
    const res = createRuleAPI(SubroutineEvent(ref), LINTER_SETS.subroutine);
    return res as Omit<typeof res, "conditions">;
};
export const PlayerRule = (options?: PlayerEventOptions) => {
    const event = PlayerEvent(options);
    return createRuleAPI(
        event,
        (event.type === "general")
            ? LINTER_SETS.playerGeneral
            : LINTER_SETS.playerCombat,
    );
};
////////////////////////////////////////////////////////////////////////////////////////
const ruleRegistry: { [key: string]: Rule[] } = {};

export const registerRule = (rule: Rule, hash: string): void => {
    if (ruleRegistry[hash]) {
        ruleRegistry[hash].push(rule);
    } else {
        ruleRegistry[hash] = [rule];
    }
};

export const processRegistry = (): Rule[] => {
    const processedRules: Rule[] = [];

    for (const hash in ruleRegistry) {
        const rules = ruleRegistry[hash];

        rules.sort((a, b) => b.priority - a.priority); // descending

        if (rules.length > 1 && !rules[0].disabled) { // !rules[0].disabled = when the first is disabled then the others in that array will be as well because disabled state is part of the hash and hash is used as the key = dont merge disabled rules with the same hash
            const mergedRule = rules.reduce((acc, curr) =>
                mergeRule(acc, curr)
            );
            processedRules.push(mergedRule);
        } else {
            processedRules.push(...rules);
        }
    }

    return processedRules;
};
////////////////////////////////////////////////////////////////////////////////////////
