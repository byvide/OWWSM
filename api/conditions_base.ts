////////////////////////////////////////////////////////////////////////////////////////

export type ConditionLike = string; // no trailing coma at the end!

export type T = ConditionLike[];

export type ConditionsLinterFunction = (r: T) => string; // return empty string if everything is fine

export const COMPARISON_OPERATORS = ["==", "!=", "<=", ">=", "<", ">"] as const;
export type ComparisonOperator = typeof COMPARISON_OPERATORS[number];
const comparisonOperatorSwapMap: {
    [key in ComparisonOperator]: ComparisonOperator;
} = {
    "==": "==",
    "!=": "!=",
    "<": ">",
    ">": "<",
    "<=": ">=",
    ">=": "<=",
};

////////////////////////////////////////////////////////////////////////////////////////

const operatorsPattern = COMPARISON_OPERATORS.map((op) => `\\${op}`).join("|");
const conditionRegex = new RegExp(`(.*)(${operatorsPattern})(.*)`);
function destructureCondition(c: ConditionLike) {
    const matches = c.match(conditionRegex);
    if (!matches) {
        throw new Error(
            `Couldnt process "${c}" as it doesnt match the pattern of a condition`,
        );
    }
    const [_, left, op, right] = matches.map((s) => s.trim());
    if (!(op in comparisonOperatorSwapMap)) {
        throw new Error(
            `Invalid operator "${op}" in condition "${c}".`,
        );
    }

    return [left, op, right];
}

////////////////////////////////////////////////////////////////////////////////////////

export function compileConditions(cArr: T) {
    if (!cArr.length) {
        return "";
    }

    return `\
    conditions
    {
        ${cArr.join(";\n\t")};
    }`;
}

// to enable comparison of condition arrays, (2) sort both the conditions themselves alphabetically
// (1) and the content within each condition alphabetically
// (0) working with lowercase
// BEFORE [ 'False == True', 'True != False', 'True > False' ]
// AFTER [ 'false == true', 'false != true', 'false < true' ]
export function normalizeConditions(
    cArr: T,
): T {
    return cArr.map((item) => {
        //  remove the trailing semicolon if present + to lower case
        const cleanedString = (item.endsWith(";") ? item.slice(0, -1) : item)
            .toLocaleLowerCase();

        let [left, op, right] = destructureCondition(cleanedString);

        if (left.localeCompare(right) > 0) {
            [left, right] = [right, left];
            op = comparisonOperatorSwapMap[op as ComparisonOperator];
        }

        return `${left} ${op} ${right}`;
    })
        .sort((a, b) => a.localeCompare(b));
}

////////////////////////////////////////////////////////////////////////////////////////
