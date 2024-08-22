////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////
type defaultSubroutineNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
type defaultSubroutineNumbersfull = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    111,
    112,
    113,
    114,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    123,
    124,
    125,
    126,
    127,
];
export type DefaultSubroutineReferenceFormat<N extends number> = `Sub${N}`;
export type SubroutineReference = DefaultSubroutineReferenceFormat<
    defaultSubroutineNumbersfull[number]
>;

////////////////////////////////////////////////////////////////////////////////////////////////
export const INTEROP_SYMBOL = "_interop";
export type INTEROP = typeof INTEROP_SYMBOL;
////////////////////////////////////////////////////////////////////////////////////////////////
import { encodeHex } from "jsr:@std/encoding/hex";

// export const ENCODER = new TextEncoder(); //FIXME
export async function hashString(msg: string) {
    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return encodeHex(hashBuffer);
}
////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////
export type ActionLike = string;

export class ActionCollection {
    private actions: ActionLike[] = [];

    append(a: ActionLike[]) {
        this.actions.push(...a);
    }
    prepend(a: ActionLike[]) {
        this.actions.unshift(...a);
    }

    expose() {
        return this.actions;
    }

    compile() { //FIXME ";" when 0
        return `\
    actions
    {
	${this.actions.join(";\n\t")};
    }`;
    }
}
////////////////////////////////////////////////////////////////////////////////////////
export type ConditionLike = string;

export class ConditionCollection {
    private conditions: ActionLike[] = [];

    append(a: ActionLike[]) {
        this.conditions.push(...a);
    }
    prepend(a: ActionLike[]) {
        this.conditions.unshift(...a);
    }

    expose() {
        return this.conditions;
    }

    compile() {
        if (!this.conditions.length) {
            return "";
        }

        return `\
    conditions
    {
	${this.conditions.join(";\n\t")};
    }`;
    }
    hash() {
        return hashString(JSON.stringify(this.conditions)); //FIXME order of conditions !!!
    }
}

////////////////////////////////////////////////////////////////////////////////////////
