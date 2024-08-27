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

//TODO
// export function foo<T extends VariableMap>(
//     prefix: string,
//     map: T,
// ): { [K in keyof T]: string } {
//     return new Proxy(
//         {} as { [K in keyof T]: string },
//         {
//             get(target: any, prop: any) {
//                 // console.log(`GET "${prop}"`);
//                 switch (typeof prop) {
//                     case "string":
//                         return foo(prefix + prop, map);
//                         break;
//                     case "number": // when saying foo[12] then the prop is 12 (number)
//                         return foo(`${prefix}[${prop}]`, map);
//                     case "symbol":
//                         return prefix;
//                     default:
//                         return undefined;
//                 }
//             },
//         },
//     );
// }

////////////////////////////////////////////////////////////////////////////////////////

export type WorkshopType = string; // extend it later
