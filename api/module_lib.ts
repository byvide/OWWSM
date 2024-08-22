import { RuleInterop } from "./rule_api.ts";

export class ModuleBlock {
    interopRules = [] as RuleInterop[];
    priority: number = 0;
    constructor(public name: string) {}
}
