////////////////////////////////////////////////////////////////////////////////////////

export type ActionLike = string; // no trailing coma at the end!

export type ActionsComponent = ActionLike[];

////////////////////////////////////////////////////////////////////////////////////////

export function compileActions(aArr: ActionsComponent) {
    return `\
    actions
    {
	${aArr.join(";\n\t")}${aArr.length ? ";" : ""}
    }`;
}

export function normalizeActions(
    aArr: ActionsComponent,
): ActionLike[] {
    return aArr.map((item) => {
        //  remove the trailing semicolon if present
        const cleanedString = item.endsWith(";") ? item.slice(0, -1) : item;
        return cleanedString.toLocaleLowerCase();
    });
}

////////////////////////////////////////////////////////////////////////////////////////
