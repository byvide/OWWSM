// deno-lint-ignore-file

export type VariableType =
    | string
    | WorkshopType
    | WorkshopType[];

export type VariableSet = { [name: string]: VariableType }; // variable name: default value
export type VariableMap = { [name: string]: number }; // variable name: index

////////////////////////////////////////////////////////////////////////////////////////

export const indexVariableSet = (set: VariableSet): VariableMap => {
    return Object.keys(set).reduce((acc, key, index) => {
        acc[key as keyof typeof set] = index;
        return acc;
    }, {} as { [K in keyof typeof set]: number });
};

////////////////////////////////////////////////////////////////////////////////////////

export interface CallableThing {
    (): string; // The proxy can be called as a function and returns a string
}
export interface Gömböc extends CallableThing {
    [key: string]: Gömböc;
    [index: number]: Gömböc;
}

export const buildRecursiveProxy = (
    prefix: string,
    variableMap?: VariableMap,
) => {
    return new Proxy(
        () => prefix,
        // this line makes the proxy callable as a function, returning the [prefix] when invoked
        // it allows any chain of property accesses followed by a function call to return the accumulated string ([prefix])
        // this is crucial because, without it, calling the proxy like a function after chaining properties would result in a runtime error,
        // as JavaScript would treat the proxy as an object, not a callable function,
        // by defining the proxy as a function that returns [prefix], it allows the entire chain to be resolved as a string when invoked
        {
            // deno-lint-ignore no-explicit-any
            get(target: any, property: any, receiver: any) {
                switch (typeof property) {
                    case "string":
                        if (variableMap && property in variableMap) {
                            return buildRecursiveProxy(
                                `${prefix}[${variableMap[property]}]`,
                                variableMap,
                            );
                        }
                        return buildRecursiveProxy(
                            `${prefix}[${property}]`,
                            variableMap,
                        );

                    case "number": // when accessing an index like foo[12]
                        return buildRecursiveProxy(
                            `${prefix}[${property}]`,
                            variableMap,
                        );

                    default:
                        return Reflect.get(target, property, receiver);
                        // Reflect.get(target, prop, receiver) call serves as a safety net to handle any unexpected property accesses gracefully.
                        // It allows the proxy to behave like a normal object when accessing properties that aren't explicitly handled by the current custom logic.
                }
            },
        },
    );
};

////////////////////////////////////////////////////////////////////////////////////////

export type WorkshopType = string; // extend it later

////////////////////////////////////////////////////////////////////////////////////////
