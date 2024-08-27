import { LINTER_SETS, lintReport, lintResult } from './_linters.ts';
import { SubroutineReference } from './_temp.ts';
import { PlayerEventOptions } from './event.ts';
import { ModuleComponent } from './module_base.ts';
import { GlobalRule, PlayerRule, RuleInterop, Subroutine } from './rule.ts';
import {
    buildRecursiveProxy,
    Gömböc,
    indexVariableSet,
    VariableMap,
    VariableSet,
} from './variables.ts';
import { compileVariableSets } from './workshop.ts';
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

    return {
        var: {
            Global(): {
                [K in keyof TGlobal]: Gömböc;
            } {
                return bakeVariablesIntoGömböc(
                    `Global.${mod.name}`,
                    mod.globalVariables,
                );
            },

            Player(
                player?: string,
            ): {
                [K in keyof TPlayer]: Gömböc;
            } {
                if (!player) {
                    player = 'Event Player';
                }

                return bakeVariablesIntoGömböc(
                    `${player}.${mod.name}`,
                    mod.globalVariables,
                );
            },
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

        patch: {
            attachRules(...rules: RuleInterop[]) {
                mod.ruleInterops.push(...rules);
                return this;
            },
        },

        //TODO add/attacH/reset ... naming and fields
        // attachRules(...rules: RuleInterop[]) {
        //     mod.ruleInterops.push(...rules);
        // },
        // detachRules(...rules: RuleInterop[]) {
        //     mod.ruleInterops.push(...rules);
        // },
        ['_interop']: {
            _content: mod,

            compile(options?: CompileModuleOptions) {
                if (options?.lint) {
                    console.log('---------------LINT START---------------');
                    const res = this.lint();
                    console.log('---------------LINT END---------------');
                    if (res.length) {
                        throw new Error(
                            'Rule failed on linting, aborting compile function.\n' + res.log(),
                        );
                    }
                }
                return ((options?.includeVariablesAs)
                    ? compileVariableSets(
                        [this.signature()],
                        options.includeVariablesAs,
                    )
                    : '') +
                    mod.ruleInterops.reduce((acc, curr) => {
                        return acc += '\n' + curr.compile();
                    }, '');
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
        priority(number: number) { //FIXME maybe this should be in interop so accessable from imports?
            mod.priority = number;
            return this;
        },
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////

export const bakeVariablesIntoGömböc = (
    prefix: string,
    variableMap: VariableMap,
) => {
    return buildRecursiveProxy(prefix, variableMap);
};

////////////////////////////////////////////////////////////////////////////////////////////////
