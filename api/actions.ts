import { removeCommentAnnotation } from "./_utilities.ts";
import {
    ActionLike,
    ActionsComponent,
    compileActions,
    normalizeActions,
} from "./actions_base.ts";
////////////////////////////////////////////////////////////////////////////////////////

export type ActionsInterop = {
    _content: ActionsComponent;

    compile(): string;

    normalized(): ActionLike[];
    purified(): ActionLike[];
};

////////////////////////////////////////////////////////////////////////////////////////

export const Actions = () => {
    const actions: ActionsComponent = [];

    let normalized: ActionLike[] = [];
    let purified: ActionLike[] = [];

    const todo = {
        normalized: false,
        purified: false,
        all() {
            this.normalized = true;
            this.purified = true;
        },
    };

    return {
        append(a: ActionLike[]) {
            actions.push(...a);
            todo.all();

            return this;
        },
        prepend(a: ActionLike[]) {
            actions.unshift(...a);
            todo.all();

            return this;
        },
        reset() {
            actions.splice(0);
            todo.all();

            return this;
        },

        _interop: {
            _content: actions,

            compile() {
                return compileActions(actions);
            },

            normalized() {
                if (todo.normalized) {
                    normalized = normalizeActions(this.purified());
                    todo.normalized = false;
                }
                return normalized;
            },
            purified() {
                if (todo.purified) {
                    purified = removeCommentAnnotation(actions);
                    todo.purified = false;
                }
                return purified;
            },
        } as ActionsInterop,
    };
};

////////////////////////////////////////////////////////////////////////////////////////

export function subsetActions(a: ActionsInterop, b: ActionsInterop) {
    if (b._content.length > a._content.length) {
        const temp = a;
        a = b;
        b = temp;
    } // ensuring that "a" is always the larger

    const aNorm = a.normalized();
    const bNorm = b.normalized();

    let i = 0;
    while (i < aNorm.length && i < bNorm.length) {
        if (aNorm[i] !== bNorm[i]) {
            return null;
        }
        i++;
    }

    return a;
}

////////////////////////////////////////////////////////////////////////////////////////
