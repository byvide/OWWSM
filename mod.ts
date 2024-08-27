import { Module } from "./api/module.ts";
import { foo } from "./api/variables.ts";
////////////////////////////////////////////////////////////////////////////////////////////////
import { USE_CUSTOM_ECMASCRIPT_API_PATCH } from "./PATCH_ECMASCRIPT.ts";
void USE_CUSTOM_ECMASCRIPT_API_PATCH;
////////////////////////////////////////////////////////////////////////////////////////////////

const m = Module({
    name: "ATTR",
    global: {
        "hello": "asd",
    },
    player: {
        "bello": "",
    },
});

m.new.GlobalRule()
    .actions([
        `${m.var.player.bello()} = "Hello there"`,
        "Loop",
        "Loop",
    ])
    .title(
        "Something123456789Something123456789Something123456789Something123456789Something123456789Something123456789Something123456789Something123456789",
    );

m.new.PlayerRule()
    .title("asd")
    .disable()
    .conditions([
        "Attacker == hello",
        "ok  > ok",
    ])
    .actions([
        "Ok",
    ]);

// m._interop.compile({ includeVariablesAs: 12 }).log();

// foo("hello").bello;
const a = foo("hello", m._interop._content.globalVariables)?.hello?.[2];
console.log(a);
