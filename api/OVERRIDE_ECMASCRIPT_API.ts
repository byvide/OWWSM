export const USE_CUSTOM_ECMASCRIPT_API_OVERRIDES = null;
/*
USAGE


import { USE_CUSTOM_ECMASCRIPT_API_OVERRIDES } from "./OVERRIDE_ECMASCRIPT_API.ts";
void USE_CUSTOM_ECMASCRIPT_API_OVERRIDES; // i need this so the import wont be deleted by linters, and these global overrides only work in a file if i import something where they were defined
*/

declare global {
    interface String {
        log(): void;
    }
}
String.prototype.log = function () {
    console.log(this.toString());
};
