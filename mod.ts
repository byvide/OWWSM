import { Module } from "./api/module.ts";
import { compileVariableSets } from "./api/workshop.ts";
////////////////////////////////////////////////////////////////////////////////////////////////
import { USE_CUSTOM_ECMASCRIPT_API_OVERRIDES } from "./api/OVERRIDE_ECMASCRIPT_API.ts";
void USE_CUSTOM_ECMASCRIPT_API_OVERRIDES; // i need this so the import wont be deleted by linters, and these global overrides only work in a file if i import something where they were defined
////////////////////////////////////////////////////////////////////////////////////////////////

const m = Module({
    name: "ATTR",
    global: {
        "hello": 234,
    },
    player: {
        "bello": 12,
    },
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

m._interop.compile({ "includeVariablesAs": 12 });

const m2 = Module({
    name: "ATTR123",
    global: {
        "hellobello": 234,
    },
    player: {
        "oksi": 12,
    },
});

compileVariableSets([m._interop.signature(), m2._interop.signature()]).log();
