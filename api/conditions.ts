import { LINTER_SETS, lintReport, lintResult } from "./_linters.ts";
import { removeCommentAnnotation } from "./_utilities.ts";
import {
    compileConditions,
    ConditionLike,
    normalizeConditions,
    T,
} from "./conditions_base.ts";

////////////////////////////////////////////////////////////////////////////////////////

export type ConditionsInterop = {
    _content: T;

    compile(options?: CompileConditionsOptions): string;
    signature(): string;
    lint(): lintResult<ConditionsInterop>;

    normalized(): ConditionLike[];
    purified(): ConditionLike[];
};
export interface CompileConditionsOptions {
    lint?: boolean;
}

////////////////////////////////////////////////////////////////////////////////////////

export const Conditions = () => {
    const conditions: T = [];

    let normalized: ConditionLike[] = [];
    let signature: string = "";
    let purified: ConditionLike[] = [];

    const todo = {
        normalized: false,
        signature: true,
        purified: false,
        all() {
            this.normalized = true;
            this.signature = true;
            this.purified = true;
        },
    };

    return {
        append(c: ConditionLike[]) {
            conditions.push(...c);
            todo.all();

            return this;
        },
        prepend(c: ConditionLike[]) {
            conditions.unshift(...c);
            todo.all();

            return this;
        },
        reset() {
            conditions.splice(0);
            todo.all();

            return this;
        },

        _interop: {
            _content: conditions,

            compile(options?: CompileConditionsOptions) {
                if (options?.lint && this.lint()) {
                    throw new Error(
                        "Rule failed on linting, aborting compile function.",
                    );
                }
                return compileConditions(conditions);
            },
            signature() {
                if (todo.signature) {
                    signature = JSON.stringify(this.normalized());
                    todo.signature = false;
                }
                return signature;
            },
            lint() {
                return lintReport<typeof this>(
                    this,
                    LINTER_SETS.conditions.basic,
                );
            },
            // no comments + no accidental trailing coma + no duplicate statements + ordered alphabetically + full lowercase
            normalized() {
                if (todo.normalized) {
                    normalized = normalizeConditions(this.purified());
                    todo.normalized = false;
                }
                return normalized;
            },
            // no comments
            purified() {
                if (todo.purified) {
                    purified = removeCommentAnnotation(conditions);
                    todo.purified = false;
                }
                return purified;
            },
        } as ConditionsInterop,
    };
};

////////////////////////////////////////////////////////////////////////////////////////
