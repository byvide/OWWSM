import { ActionCollection, ConditionCollection } from "./_temp.ts";
import { EventInterop } from "./event.ts";

////////////////////////////////////////////////////////////////////////////////////////
export class RuleBlock {
    title = "";
    disabled = false;
    actions = new ActionCollection();
    conditions = new ConditionCollection();
    priority = 0;
    constructor(public eventInterop: EventInterop) {}
}
////////////////////////////////////////////////////////////////////////////////////////
export function compileRule(rule: RuleBlock) {
    return `\
${rule.disabled ? "disabled " : ""}rule("${rule.title}")
{
${rule.eventInterop.compile()}
${rule.conditions.compile()}
${rule.actions.compile()}
}`;
}

export async function hashRule(rule: RuleBlock) {
    return (+rule.disabled) + await rule.eventInterop.hash() +
        await rule.conditions.hash();
}

export type RuleLinterFunction = (r: RuleBlock) => string; // return empty string if everything is fine
export function lintRule(rule: RuleBlock, linterSet: RuleLinterFunction[]) {
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
    return null;
}

export function mergeRule(a: RuleBlock, b: RuleBlock) { // does not check for equality; when 'a' and 'b' are the same, actions will be duplicated
    a.actions.append(b.actions.expose());
    return a;
}
////////////////////////////////////////////////////////////////////////////////////////

// export const flatRules(rules: RuleBlock[]){

// }

const ruleRegistry: { [key: string]: RuleBlock[] } = {};

export const registerRule = (rule: RuleBlock, hash: string): void => {
    if (ruleRegistry[hash]) {
        ruleRegistry[hash].push(rule);
    } else {
        ruleRegistry[hash] = [rule];
    }
};

export const processRegistry = (): RuleBlock[] => {
    const processedRules: RuleBlock[] = [];

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

    //FIXME break them up if too long?

    return processedRules;
};
////////////////////////////////////////////////////////////////////////////////////////
