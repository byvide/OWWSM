export const USE_CUSTOM_ECMASCRIPT_API_PATCH = null;
// import USE_CUSTOM_ECMASCRIPT_API_PATCH^^ to ensure that the custom ES api overrides are applied
// the void statement prevents the import from being removed by linters as unused
/*
////////////////////////////////////////////////////////////////////////////////////////////////
import { USE_CUSTOM_ECMASCRIPT_API_PATCH } from "./PATCH_ECMASCRIPT.ts";
void USE_CUSTOM_ECMASCRIPT_API_PATCH;
////////////////////////////////////////////////////////////////////////////////////////////////
*/

declare global {
    interface String {
        log(): void;
    }
    interface Array<T> {
        log(): void;
    }
}
String.prototype.log = function () {
    console.log(this.toString());
};
Array.prototype.log = function () {
    console.group("Array Elements"); //FIXME linting place like this not the ref
    this.forEach((item, index) => console.log(`[${index}]`, item));
    console.groupEnd();
};
