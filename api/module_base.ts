import { RuleInterop } from "./rule.ts";
import { VariableMap } from "./variables.ts";

export class ModuleComponent {
    ruleInterops = [] as RuleInterop[];
    priority: number = 0;
    constructor(
        public name: string,
        public globalVariables: VariableMap,
        public playerVariables: VariableMap,
    ) {}
}
