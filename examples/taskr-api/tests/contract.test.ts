import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** Error codes listed in the CONTRACT.md §5 error catalogue table. */
function catalogueCodes(): string[] {
  const contract = read("CONTRACT.md");
  const section = contract.split("## 5. Error catalogue")[1]?.split("\n## ")[0] ?? "";
  return [...section.matchAll(/^\| `([A-Z_]+)` \|/gm)].map((m) => m[1] as string);
}

describe("contract coverage (CONTRACT AC2)", () => {
  const codes = catalogueCodes();

  it("reads a non-empty error catalogue from CONTRACT.md", () => {
    expect(codes.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps the ErrorCode type in src/errors.ts identical to the catalogue", () => {
    const declared = [...read("src/errors.ts").matchAll(/\| "([A-Z_]+)"/g)].map((m) => m[1]);
    expect(declared.sort()).toEqual([...codes].sort());
  });

  it("asserts every catalogue error code in a test assertion, not just a mention", () => {
    const testSources = readdirSync(join(root, "tests"))
      .filter((f) => f.endsWith(".test.ts") && f !== "contract.test.ts")
      .map((f) => read(join("tests", f)))
      .join("\n");
    // Counts `code: "X"` (toEqual/toMatchObject) and `.toBe("X")` — comments and test names don't count.
    const asserted = (code: string) => new RegExp(`(code:\\s*|toBe\\()"${code}"`).test(testSources);
    expect(codes.filter((code) => !asserted(code))).toEqual([]);
  });
});
