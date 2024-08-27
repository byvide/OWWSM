import { assertEquals } from "@std/assert";
import { removeCommentAnnotation } from "./_utilities.ts";

Deno.test("comment removal: do nothing", () => {
    const result = removeCommentAnnotation(["a\\bc"]); // a\bc
    assertEquals(result, ["a\\bc"]);
});

Deno.test('comment removal: escaped ["] inside', () => {
    const result = removeCommentAnnotation(['"a\\"b"c']); // "a\"b"c
    assertEquals(result, ["c"]);
});

Deno.test('comment removal: escape character is escaping another escape character, then following ["] is not escaped', () => {
    const result = removeCommentAnnotation(['"a\\\\"b"c']); // "a\\"b"c
    assertEquals(result, ['b"c']);
});
