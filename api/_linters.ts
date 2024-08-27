import { ConditionsInterop } from './conditions.ts';
import { PlayerEventCategory } from './event.ts';
import { ModuleInterop } from './module.ts';
import { RuleInterop } from './rule.ts';

////////////////////////////////////////////////////////////////////////////////////////

export type LinterFunction<T> = (x: T) => string; // return empty string if everything is fine

export type lintResult<T> = ReturnType<typeof lintReport<T>>;
export function lintReport<T>(
    component: T,
    linterSet: LinterFunction<T>[],
) {
    const report: string[] = [];
    linterSet.forEach((linter) => {
        const res = linter(component);
        if (res) {
            report.push(res);
        }
    });
    console.log('REPORT', report);

    return report.filter((item) => item);
}

////////////////////////////////////////////////////////////////////////////////////////

const CONDITIONS_LINTERS = {
    no_duplicates(c: ConditionsInterop) {
        // duplicates are checked only during linting, not within setters or utilities,
        // because the order of conditions may be significant
        // the framework should not make decisions about which one to keep or remove

        const normalizedConditions = c.normalized();
        const duplicates: string[] = [];

        for (let i = 1; i < normalizedConditions.length; i++) {
            if (normalizedConditions[i] === normalizedConditions[i - 1]) {
                duplicates.push(normalizedConditions[i]);
            }
        }

        if (duplicates.length > 0) {
            return `Duplicate conditions found: ${duplicates.join(', ')}`;
        }

        return '';
    },
} satisfies { [key: string]: LinterFunction<ConditionsInterop> };

const RULE_LINTERS = {
    conditions_ok(rule: RuleInterop) { //FIXME
        const res = rule._content.conditions._interop.lint();
        console.log('RULE LINT: COND', res);
        return res.flat().join('\n');
    },
    title_length(rule: RuleInterop) {
        return rule._content.title.length > 128 ? 'Title cannot exceed 128 characters.' : '';
    },
    no_conditions(rule: RuleInterop) {
        return rule._content.conditions._interop._content.length
            ? 'Subroutines cannot have conditions.'
            : '';
    },
    no_eventplayer_ref(rule: RuleInterop) {
        const regex = /\b([Ee]vent [Pp]layer)\b/;

        return (rule._content.actions._interop.purified().some((item) => regex.test(item)) ||
                rule._content.conditions._interop.purified().some((item) => regex.test(item)))
            ? 'Global rules cannot contain "Event Player" references. If this have been accidentally triggered by content of a workshop string, you can resolve this by using full uppercase "EVENT PLAYER" in your text.'
            : '';
    },
    no_attacker_or_victim_ref(rule: RuleInterop) {
        const attackerRegex = /\b(Attacker|attacker)\b/;
        const victimRegex = /\b(Victim|victim)\b/;

        return (rule._content.actions._interop.purified().some((item) =>
                attackerRegex.test(item) || victimRegex.test(item)
            ) ||
                rule._content.conditions._interop.purified().some((item) =>
                    attackerRegex.test(item) || victimRegex.test(item)
                ))
            ? 'Non combat rules cannot contain "Attacker" or "Victim" references. If this have been accidentally triggered by content of a workshop string, you can resolve this by using full uppercase "ATTACKER" or "VICTIM" in your text.'
            : '';
    },
    no_healer_or_healee_ref(rule: RuleInterop) {
        const healerRegex = /\b(Healer|healer)\b/;
        const healeeRegex = /\b(Healee|healee)\b/;

        return (rule._content.actions._interop.purified().some((item) =>
                healerRegex.test(item) || healeeRegex.test(item)
            ) ||
                rule._content.conditions._interop.purified().some((item) =>
                    healerRegex.test(item) || healeeRegex.test(item)
                ))
            ? 'Non heal rules cannot contain "Healer" or "Healee" references. If this have been accidentally triggered by content of a workshop string, you can resolve this by using full uppercase "HEALER" or "HEALEE" in your text.'
            : '';
    },
} satisfies { [key: string]: LinterFunction<RuleInterop> };

const MODULE_LINTERS = {
    rules_ok(m: ModuleInterop) { //FIXME
        const res = m._content.ruleInterops.map((item) => item.lint());
        console.log('MOD LINT: RULES', res);
        return res.flat().join('\n');
    },
} satisfies { [key: string]: LinterFunction<ModuleInterop> };

export const LINTER_SETS = {
    conditions: {
        basic: [CONDITIONS_LINTERS.no_duplicates],
    },
    rule: { //TODO refact linter collections
        global: [
            RULE_LINTERS.conditions_ok,
            RULE_LINTERS.title_length,
            RULE_LINTERS.no_eventplayer_ref,
        ],
        subroutine: [
            RULE_LINTERS.title_length,
            RULE_LINTERS.no_conditions,
        ],
        player: {
            general: [
                RULE_LINTERS.conditions_ok,
                RULE_LINTERS.title_length,
                RULE_LINTERS.no_attacker_or_victim_ref,
                RULE_LINTERS.no_healer_or_healee_ref,
            ],
            combat: [
                RULE_LINTERS.conditions_ok,
                RULE_LINTERS.title_length,
                RULE_LINTERS.no_healer_or_healee_ref,
            ],
            heal: [
                RULE_LINTERS.conditions_ok,
                RULE_LINTERS.title_length,
                RULE_LINTERS.no_attacker_or_victim_ref,
            ],
        } satisfies {
            [key in PlayerEventCategory]: LinterFunction<RuleInterop>[];
        },
    },
    module: {
        basic: [MODULE_LINTERS.rules_ok],
    },
};
