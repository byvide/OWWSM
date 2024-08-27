export function compileVariableSets(contexts: {
    tag: string;
    global: boolean;
    player: boolean;
}[], start: number = 26) {
    if (start + contexts.length > 127) {
        throw Error(
            `Variable slots are available between 0 and 127, the compiler received [${contexts.length}] contexts starting from [${start}] which would exceed 127`,
        );
    }
    if (start < 0 || start > 127) {
        throw Error(
            `Variable slots are available between 0 and 127, the compiler received [${start}] as the starting slot`,
        );
    }

    const globals = [] as string[];
    const players = [] as string[];
    contexts.forEach((item) => {
        if (item.global) {
            globals.push(item.tag);
        }
        if (item.player) {
            players.push(item.tag);
        }
    });

    if ((!globals.length) && (!players.length)) {
        return "";
    }

    return `\
variables
{
${
        globals.length
            ? `\
    global:
        ${
                globals.reduce((acc, item, index) => {
                    return acc + `${start + index}: ${item}\n\t`;
                }, "")
            } 
    `
            : ""
    }
${
        players.length
            ? `\
    player:
        ${
                players.reduce((acc, item, index) => {
                    return acc + `${start + index}: ${item}\n\t\t`;
                }, "")
            } 
    `
            : ""
    }
}
`;
}
////////////////////////////////////////////////////////////////////////////////////////////////
// type slotNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// type slotFormat<N extends number> = `Slot ${N}`; //TODO note Template Literal Types
// type PlayerSlot = slotFormat<slotNumbers[number]>;
////////////////////////////////////////////////////////////////////////////////////////////////
