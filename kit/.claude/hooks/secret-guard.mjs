#!/usr/bin/env node
// PreToolUse hook (matcher: Write|Edit|MultiEdit|NotebookEdit|Bash) — block tool calls that
// would put an obvious secret into the repository or a command, or write a real .env file.
//
// Contract (https://code.claude.com/docs/en/hooks):
//   stdin  : JSON with tool_name and tool_input
//            (file_path + content | new_string | edits[].new_string | new_source; or Bash `command`)
//   exit 2 : block the tool call; stderr is shown to Claude as the reason
//   exit 0 : no opinion — normal permission flow applies
//   exit 1 : non-blocking error (used if this hook itself breaks — fail open, loudly)
//
// Escape hatch for intentional fixtures: put `secret-guard: allow` on the same line.
// Limits (by design): this is a guard against ACCIDENTS, not an adversarial agent — Claude can
// read this file and could append the escape hatch; regexes miss novel formats. Pair it with
// permission deny rules, code review, and a server-side scanner (e.g. GitHub push protection).
// Keep it fast: pure regex, no network, no subprocesses.

const PATTERNS = [
  ["AWS access key id", /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["Private key block", /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/],
  ["Anthropic API key", /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ["OpenAI-style API key", /\bsk-(?:proj-)?[A-Za-z0-9]{32,}\b/],
  ["Stripe live key", /\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["JWT (e.g. Supabase service-role key)", /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}/],
];

// Assignments whose identifier ENDS in a credential word (client_secret, db_password,
// AWS_SECRET_ACCESS_KEY, clientSecret …), quoted or not. Group 1 = the value.
const ASSIGNMENT =
  /(?:^|[^A-Za-z0-9_])[A-Za-z0-9_]*(?:api[_-]?key|secret|passw(?:or)?d|pwd|token|private[_-]?key|access[_-]?key)[A-Za-z0-9_]*["']?\s*[:=]\s*["']?([^"'\s,;)]{16,})/i;

// scheme://user:password@host — group 1 = the password.
const CONNECTION_STRING = /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@\/]+:([^\s@\/]{3,})@/i;

// A captured VALUE that is clearly a placeholder or a reference, not a secret. Anchored:
// a real key that merely contains "fake" or "example" somewhere is still blocked.
const PLACEHOLDER_VALUE =
  /^(?:<[^>]+>|\$\{[^}]*\}|\$\([^)]*\)|\$[A-Z_][A-Z0-9_]*|(?:process\.env|import\.meta\.env|os\.environ|env)\b.*|your[-_].*|x{4,}.*|\*{3,}.*|changeme|password|secret|example.*|placeholder.*|dummy.*|fake.*|test[-_]?(?:key|secret|token|password).*)$/i;

// file_path is absolute; on Windows it uses backslashes, so accept both separators.
const ENV_FILE = /(^|[\\/])\.env(\.[^\\/]*)?$/;
const ENV_ALLOWED = /(^|[\\/])\.env\.(example|sample|template)$/;

function block(reason) {
  process.stderr.write(`secret-guard: ${reason}\nMove the value to an ignored .env file and reference it via an environment variable.\n`);
  process.exit(2);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.stderr.write("secret-guard: could not parse hook input; allowing (fail open)\n");
    process.exit(1);
  }

  const ti = input.tool_input ?? {};
  const filePath = String(ti.file_path ?? "");

  if (ENV_FILE.test(filePath) && !ENV_ALLOWED.test(filePath)) {
    block(`refusing to write ${filePath} — .env files hold real secrets and must be edited by a human.`);
  }

  const texts = [
    ti.content,
    ti.new_string,
    ti.new_source,
    ti.command,
    ...(Array.isArray(ti.edits) ? ti.edits.map((e) => e?.new_string) : []),
  ].filter((t) => typeof t === "string");
  const where = filePath || (typeof ti.command === "string" ? "Bash command" : "edit");

  for (const text of texts) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("secret-guard: allow")) continue;
      for (const [label, re] of PATTERNS) {
        const m = line.match(re);
        // Vendor docs use values ending in EXAMPLE (e.g. AWS's AKIA…EXAMPLE); allow only those.
        if (m && !/EXAMPLE$/.test(m[0])) block(`${label} detected in ${where} (line ${i + 1}).`);
      }
      for (const [label, re] of [["Hard-coded credential assignment", ASSIGNMENT], ["Password in a connection string", CONNECTION_STRING]]) {
        const m = line.match(re);
        if (m && m[1] !== undefined && !PLACEHOLDER_VALUE.test(m[1])) block(`${label} detected in ${where} (line ${i + 1}).`);
      }
    }
  }

  process.exit(0);
});
