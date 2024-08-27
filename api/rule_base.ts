import { hashString } from "./_utilities.ts";
import { Actions, subsetActions } from "./actions.ts";
import { Conditions } from "./conditions.ts";
import { EventInterop } from "./event.ts";
import { RuleInterop } from "./rule.ts";

////////////////////////////////////////////////////////////////////////////////////////

export class RuleComponent {
    title = "";
    disabled = false;
    actions = Actions();
    conditions = Conditions();
    priority = 0;
    constructor(public eventInterop: EventInterop) {}
}

////////////////////////////////////////////////////////////////////////////////////////

export function compileRule(rule: RuleComponent) {
    return `\
${rule.disabled ? "disabled " : ""}rule("${rule.title}")
{
${rule.eventInterop.compile()}
${rule.conditions._interop.compile()}
${rule.actions._interop.compile()}
}`;
}

export function mergeRule(base: RuleComponent, mergee: RuleComponent) {
    // same reference, do not duplicate
    if (base !== mergee) {
        const res = subsetActions(
            base.actions._interop,
            mergee.actions._interop,
        );
        if (res) { // is subset, use the larger set
            base.actions._interop = res;
        } else { // not subset, append
            base.actions.append(mergee.actions._interop._content);
        }
    }

    return base;
}

////////////////////////////////////////////////////////////////////////////////////////

// export const flatRules(rules: RuleBlock[]){

// }

const ruleRegistry: { [key: string]: RuleComponent[] } = {};

export const registerRule = (rule: RuleComponent, hash: string): void => {
    if (ruleRegistry[hash]) {
        ruleRegistry[hash].push(rule);
    } else {
        ruleRegistry[hash] = [rule];
    }
};

export const processRegistry = async (
    rs: RuleInterop[],
): Promise<RuleComponent[]> => {
    const hashes = [];
    for await (const r of rs) {
        hashes.push(hashString(r.signature()));
    }

    const processedRules: RuleComponent[] = [];

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

    //TODO break them up if too long?

    return processedRules;
};
////////////////////////////////////////////////////////////////////////////////////////
