import { SubroutineReference } from "./_temp.ts";
import {
    GlobalEvent,
    PlayerEvent,
    PlayerEventOptions,
    SubroutineEvent,
} from "./event.ts";
import { createRuleAPI, LINTER_SETS } from "./rule.ts";

////////////////////////////////////////////////////////////////////////////////////////////////

type VariableSet = { [name: string]: number };

type ModuleAPIContext<
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
> = {
    global: TGlobal;
    player: TPlayer;
};

type ModuleContext<TGlobal extends VariableSet, TPlayer extends VariableSet> = {
    name: string;
} & ModuleAPIContext<TGlobal, TPlayer>;
////////////////////////////////////////////////////////////////////////////////////////////////
//FIXME refact
export function Module<
    TGlobal extends VariableSet,
    TPlayer extends VariableSet,
>(context: ModuleContext<TGlobal, TPlayer>) {
    const ruleApis = [] as ReturnType<typeof createRuleAPI>[];

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
        GlobalRule: () => {
            const r = createRuleAPI(GlobalEvent(), LINTER_SETS.global);
            ruleApis.push(r);
            return r;
        },
        Subroutine: (ref: SubroutineReference) => {
            const r = createRuleAPI(
                SubroutineEvent(ref),
                LINTER_SETS.subroutine,
            );
            ruleApis.push(r);
            return r as Omit<typeof r, "conditions">;
        },
        PlayerRule: (options?: PlayerEventOptions) => {
            const event = PlayerEvent(options);
            const r = createRuleAPI(
                event,
                (event.type === "general")
                    ? LINTER_SETS.playerGeneral
                    : LINTER_SETS.playerCombat,
            );
            ruleApis.push(r);
            return r;
        },
        _: {
            compile() {
                return ruleApis.reduce((acc, curr) => {
                    return acc += "\n" + curr._.compile();
                }, "");
            },
        },
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////

const m = Module({
    name: "ATTR",
    global: {
        "hello": 234,
    },
    player: {},
});

m.GlobalRule()
    .actions([
        `${m.global.hello} = "Hello there"`,
        "Loop",
        "Loop",
    ])
    .title("Something");

m.PlayerRule({ type: "Player Died" })
    .title("asd")
    .disable()
    .conditions([
        "Never",
    ])
    .actions([
        "Ok",
    ]);

console.log(m._.compile());
