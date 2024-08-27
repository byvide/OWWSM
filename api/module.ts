import { LINTER_SETS, lintReport, lintResult } from "./_linters.ts";
import { SubroutineReference } from "./_temp.ts";
import { PlayerEventOptions } from "./event.ts";
import { ModuleComponent } from "./module_base.ts";
import { GlobalRule, PlayerRule, Subroutine } from "./rule.ts";
import { indexVariableSet, VariableMap, VariableSet } from "./variables.ts";
import { compileVariableSets } from "./workshop.ts";
////////////////////////////////////////////////////////////////////////////////////////////////

export interface ModuleInterop {
    _content: ModuleComponent;

    compile(options?: CompileModuleOptions): string;
    signature(): { //FIXME wtf is this signature
        tag: string;
        global: boolean;
        player: boolean;
    };

    lint(): lintResult<ModuleInterop>;
}

export interface CompileModuleOptions {
    lint?: boolean;
    includeVariablesAs?: number;
}

////////////////////////////////////////////////////////////////////////////////////////

type ModuleContext<
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
> = {
    name: string;
    global: TGlobal;
    player: TPlayer;
};

export const Module = <
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
>(context: ModuleContext<TGlobal, TPlayer>) => {
    const mod = new ModuleComponent(
        context.name,
        indexVariableSet(context.global),
        indexVariableSet(context.player),
    );

    const mirroredGlobalVars = bakeVariables(
        mod.globalVariables,
        mod.name,
        "Global",
    ) as {
        [K in keyof TGlobal]: () => string;
    };
    const mirroredPlayerVars = bakeVariables(
        mod.playerVariables,
        mod.name,
        "Event Player",
    ) as {
        [K in keyof TPlayer]: (prefix?: string) => string;
    };

    return {
        var: {
            global: mirroredGlobalVars,
            player: mirroredPlayerVars,
        },
        new: {
            GlobalRule() {
                const r = GlobalRule();
                mod.ruleInterops.push(r._interop);
                return r;
            },
            Subroutine(ref: SubroutineReference) {
                const r = Subroutine(ref);
                mod.ruleInterops.push(r._interop);
                return r;
            },
            PlayerRule(options?: PlayerEventOptions) {
                const r = PlayerRule(options);
                mod.ruleInterops.push(r._interop);
                return r;
            },
        },

        //TODO add/attacH/reset ... naming and fields
        // attachRules(...rules: RuleInterop[]) {
        //     mod.ruleInterops.push(...rules);
        // },
        // detachRules(...rules: RuleInterop[]) {
        //     mod.ruleInterops.push(...rules);
        // },
        ["_interop"]: {
            _content: mod,

            compile(options?: CompileModuleOptions) {
                if (options?.lint && this.lint()) {
                    throw new Error(
                        "Rule failed on linting, aborting compile function.",
                    );
                }
                return ((options?.includeVariablesAs)
                    ? compileVariableSets(
                        [this.signature()],
                        options.includeVariablesAs,
                    )
                    : "") +
                    mod.ruleInterops.reduce((acc, curr) => {
                        return acc += "\n" + curr.compile();
                    }, "");
            },
            signature() {
                return {
                    tag: context.name,
                    global: Boolean(Object.keys(context.global).length),
                    player: Boolean(Object.keys(context.player).length),
                };
            },
            lint() {
                return lintReport<typeof this>(
                    this,
                    LINTER_SETS.module.basic,
                );
            },
        } as ModuleInterop,
        priority(number: number) {
            mod.priority = number;
            return this;
        },
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////

// { hello: 12 }
// { hello: () => Global.hello }
const bakeVariables = (map: VariableMap, tag: string, defaul: string) => {
    return Object.keys(map).reduce((acc, key) => {
        acc[key as keyof typeof map] = (prefix?: string) =>
            `${prefix ?? defaul}.${tag}[${map[key]}]`;
        return acc;
    }, {} as { [K in keyof typeof map]: (prefix?: string) => string });
};

////////////////////////////////////////////////////////////////////////////////////////////////
