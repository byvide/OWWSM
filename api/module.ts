import { INTEROP_SYMBOL, SubroutineReference } from "./_temp.ts";
import { PlayerEventOptions } from "./event.ts";
import { ModuleBlock } from "./module_lib.ts";
import { GlobalRule, PlayerRule, RuleInterop, Subroutine } from "./rule_api.ts";
import { compileVariableSets } from "./workshop.ts";
////////////////////////////////////////////////////////////////////////////////////////////////
type VariableSet = { [name: string]: number };

type ModuleContext<
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
> = {
    name: string;
    global: TGlobal;
    player: TPlayer;
};
////////////////////////////////////////////////////////////////////////////////////////////////
export interface ModuleCompileOptions {
    includeVariablesAs: number;
}

//FIXME refact
export function Module<
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
>(context: ModuleContext<TGlobal, TPlayer>) {
    const mod = new ModuleBlock(context.name);

    const transformVariableSet = (set: TGlobal | TPlayer, prefix: string) => {
        return Object.keys(set).reduce((acc, key, index) => {
            acc[key as keyof typeof set] =
                `${prefix}.${context.name}[${index}]`;
            return acc;
        }, {} as { [K in keyof typeof set]: string });
    };

    return {
        global: transformVariableSet(context.global, "Global") as {
            [K in keyof TGlobal]: string;
        },
        player: transformVariableSet(context.player, "Player") as {
            [K in keyof TPlayer]: string;
        },
        GlobalRule() {
            const r = GlobalRule();
            mod.interopRules.push(r);
            return r;
        },
        Subroutine(ref: SubroutineReference) {
            const r = Subroutine(ref);
            mod.interopRules.push(r);
            return r;
        },
        PlayerRule(options?: PlayerEventOptions) {
            const r = PlayerRule(options);
            mod.interopRules.push(r);
            return r;
        },
        attachRules(...rules: RuleInterop[]) {
            mod.interopRules.push(...rules);
        },
        [INTEROP_SYMBOL]: {
            signature() {
                return {
                    tag: context.name,
                    global: Boolean(Object.keys(context.global).length),
                    player: Boolean(Object.keys(context.player).length),
                };
            },
            compile(options?: ModuleCompileOptions) {
                return (options?.includeVariablesAs)
                    ? compileVariableSets(
                        [this.signature()],
                        options.includeVariablesAs,
                    )
                    : "" +
                        mod.interopRules.reduce((acc, curr) => {
                            return acc += "\n" + curr[INTEROP_SYMBOL].compile();
                        }, "");
            },
            lint() {
            },
            expose() {
                return mod;
            },
        },
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////
