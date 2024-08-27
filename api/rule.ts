import {
    LINTER_SETS,
    LinterFunction,
    lintReport,
    lintResult,
} from "./_linters.ts";
import { SubroutineReference } from "./_temp.ts";
import { ActionLike } from "./actions_base.ts";
import { ConditionLike } from "./conditions_base.ts";
import {
    EventInterop,
    GlobalEvent,
    PlayerEvent,
    PlayerEventOptions,
    SubroutineEvent,
} from "./event.ts";
import { compileRule, RuleComponent } from "./rule_base.ts";

////////////////////////////////////////////////////////////////////////////////////////

export interface RuleInterop {
    _content: RuleComponent;

    compile(options?: CompileRuleOptions): string;
    signature(): string;

    lint(): lintResult<RuleInterop>;
}

////////////////////////////////////////////////////////////////////////////////////////

export interface ActionAddOptions {
    prepend?: boolean;
}
export interface ConditionsAddOptions {
    prepend?: boolean;
}
export interface CompileRuleOptions {
    lint?: boolean;
}

export const RuleFactory = (
    event: EventInterop,
    linterSet: LinterFunction<RuleInterop>[],
) => {
    const rule = new RuleComponent(event);

    let markTodo_signature = true;
    let signature: string = "";

    return {
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
        actions(actions: ActionLike[], options?: ActionAddOptions) {
            if (options?.prepend) {
                rule.actions.prepend(actions);
            } else {
                rule.actions.append(actions);
            }
            return this;
        },
        conditions(
            conditions: ConditionLike[],
            options?: ConditionsAddOptions,
        ) {
            if (options?.prepend) {
                rule.conditions.prepend(conditions);
            } else {
                rule.conditions.append(conditions);
            }
            return this;
        },
        ["_interop"]: {
            _content: rule,

            compile(options?: CompileRuleOptions) {
                if (options?.lint && this.lint()) {
                    throw new Error(
                        "Rule failed on linting, aborting compile function.",
                    );
                }
                return compileRule(rule);
            },
            signature() {
                if (markTodo_signature) {
                    signature = (rule.disabled) +
                        rule.eventInterop.signature() +
                        rule.conditions._interop.signature();
                    markTodo_signature = false;
                }
                return signature;
            },
            lint() {
                return lintReport<typeof this>(this, linterSet);
            },
        } as RuleInterop,

        priority(number: number) {
            rule.priority = number;
            return this;
        },
    };
};
////////////////////////////////////////////////////////////////////////////////////////

export const GlobalRule = () => {
    return RuleFactory(GlobalEvent()._interop, LINTER_SETS.rule.global);
};

export const Subroutine = (ref: SubroutineReference) => {
    const res = RuleFactory(
        SubroutineEvent(ref)._interop,
        LINTER_SETS.rule.subroutine,
    );
    return res as Omit<typeof res, "conditions">;
};

export const PlayerRule = (options?: PlayerEventOptions) => {
    const event = PlayerEvent(options);
    return RuleFactory(
        event._interop,
        LINTER_SETS.rule.player[event.type()],
    );
};

////////////////////////////////////////////////////////////////////////////////////////
