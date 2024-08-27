import { encodeHex } from "@std/encoding/hex";
////////////////////////////////////////////////////////////////////////////////////////

export function removeCommentAnnotation(
    arr: string[],
): string[] {
    return arr.map((item) => {
        if (!item.startsWith('"')) {
            return item;
        }

        let i = 1; // start after the initial ["]
        let endQuoteIndex = -1;
        let inEscapeSequence = false;

        while (i < item.length) {
            const char = item[i];

            if (char === "\\") { // must be first, because escape character can be escaped as well, nullifying the escaping
                inEscapeSequence = !inEscapeSequence;
            } else if (inEscapeSequence) {
                inEscapeSequence = false;
            } else if (char === '"') { // with nested if-elseif-elseif, this also has the impicit [&& NOT IN ESCAPE SEQUENCE]
                endQuoteIndex = i + 1; // found closing ["]
                break;
            }

            i++;
        }

        if (endQuoteIndex === -1) {
            return item.trim();
            // if no closing quote found, then return the original,
            // it doesnt make sense but dont want to make decision here, this is a pure utility function
        }

        return item.substring(endQuoteIndex);
    });
}
////////////////////////////////////////////////////////////////////////////////////////

export async function hashString(msg: string) {
    const msgBuffer = new TextEncoder().encode(msg);
    // TextEncoder is stateless and lightweight, there's no inherent need to reuse the same instance
    // instantiating a new one every time doesn’t introduce significant performance penalties
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return encodeHex(hashBuffer);
}

////////////////////////////////////////////////////////////////////////////////////////
