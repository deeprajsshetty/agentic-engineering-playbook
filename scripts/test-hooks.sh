#!/bin/sh
# Unit tests for kit/.claude/hooks. Fake secrets are assembled at runtime so this
# file never contains a string that a secret scanner (or the hook itself) would flag.
set -u

HERE=$(cd "$(dirname "$0")/.." && pwd)
GUARD="$HERE/kit/.claude/hooks/secret-guard.mjs"
pass=0
fail=0

# expect <expected-exit-code> <description> <json>
expect() {
  printf '%s' "$3" | node "$GUARD" >/dev/null 2>&1
  code=$?
  if [ "$code" -eq "$1" ]; then
    pass=$((pass + 1)); printf 'ok   %s\n' "$2"
  else
    fail=$((fail + 1)); printf 'FAIL %s (expected exit %s, got %s)\n' "$2" "$1" "$code"
  fi
}

aws="AKIA""ABCDEFGHIJKLMNOP"
ant="sk-ant-""api03-abcdefghijklmnopqrstuvwxyz0123"
gh_tok="ghp_""abcdefghijklmnopqrstuvwxyz0123456789AB"
pem="-----BEGIN ""RSA PRIVATE KEY-----"
assign="api_key = '""q8Zr3kLm9Xv2Tn7Wp4Ys'"

expect 2 "blocks AWS key in Write"         "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/src/a.ts\",\"content\":\"const k = \\\"$aws\\\"\"}}"
expect 2 "blocks Anthropic key in Edit"    "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"/r/src/a.ts\",\"old_string\":\"x\",\"new_string\":\"$ant\"}}"
expect 2 "blocks GitHub token"             "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/a.md\",\"content\":\"token $gh_tok\"}}"
expect 2 "blocks private key header"       "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/k.txt\",\"content\":\"$pem\"}}"
expect 2 "blocks credential assignment"    "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/c.py\",\"content\":\"$assign\"}}"
expect 2 "blocks writing .env"             '{"tool_name":"Write","tool_input":{"file_path":"/r/.env","content":"A=1"}}'
expect 2 "blocks writing .env.local"       '{"tool_name":"Write","tool_input":{"file_path":"/r/.env.local","content":"A=1"}}'
expect 2 "blocks Windows .env path"        '{"tool_name":"Write","tool_input":{"file_path":"C:\\r\\.env","content":"A=1"}}'
expect 0 "allows .env.example"             '{"tool_name":"Write","tool_input":{"file_path":"/r/.env.example","content":"API_KEY="}}'
expect 0 "allows env var reference"        '{"tool_name":"Write","tool_input":{"file_path":"/r/a.ts","content":"const k = process.env.API_KEY"}}'
expect 0 "allows placeholder value"        '{"tool_name":"Write","tool_input":{"file_path":"/r/a.md","content":"api_key = \"your-api-key-goes-here\""}}'
expect 0 "allows clean code"               '{"tool_name":"Edit","tool_input":{"file_path":"/r/a.ts","old_string":"a","new_string":"export const add = (a: number, b: number) => a + b;"}}'
expect 0 "honours secret-guard: allow"     "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/t.ts\",\"content\":\"const k = \\\"$aws\\\" // secret-guard: allow\"}}"

# --- Phase 8 audit regressions: suffix identifiers, unquoted values, conn strings, other tools
sec="Zk8q3""Rp7Lm2Xv9Tn4Wp6Ys"   # 20 chars, no placeholder words
fakeish="Zk8fake""q3Rp7Lm2Xv9Tn4Wp6"  # real-looking value that merely contains "fake"
expect 2 "blocks client_secret = '...'"    "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/a.py\",\"content\":\"client_secret = '$sec'\"}}"
expect 2 "blocks db_password: unquoted"    "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/c.yml\",\"content\":\"db_password: $sec\"}}"
expect 2 "blocks AWS_SECRET_ACCESS_KEY=..." "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/x.sh\",\"content\":\"AWS_SECRET_ACCESS_KEY=$sec\"}}"
expect 2 "blocks camelCase clientSecret"   "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"/r/a.ts\",\"old_string\":\"x\",\"new_string\":\"const clientSecret = \\\"$sec\\\"\"}}"
expect 2 "blocks value that contains 'fake'" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/a.py\",\"content\":\"secret = '$fakeish'\"}}"
expect 2 "blocks password in a conn string" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/r/db.ts\",\"content\":\"postgres://app:$sec@db.internal:5432/x\"}}"
expect 2 "blocks a secret in a Bash command" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"printf 'API_KEY=$sec' >> config.env\"}}"
expect 2 "blocks a secret in NotebookEdit"   "{\"tool_name\":\"NotebookEdit\",\"tool_input\":{\"notebook_path\":\"/r/n.ipynb\",\"new_source\":\"token = '$sec'\"}}"
expect 0 "allows env reference as value"   '{"tool_name":"Write","tool_input":{"file_path":"/r/a.ts","content":"const clientSecret = process.env.CLIENT_SECRET_VALUE"}}'
# shellcheck disable=SC2016  # literal ${DB_PASSWORD} is the point of this fixture
expect 0 "allows \${VAR} in conn string"   '{"tool_name":"Write","tool_input":{"file_path":"/r/a.yml","content":"url: postgres://app:${DB_PASSWORD}@db:5432/x"}}'
expect 0 "allows literal 'password' placeholder" '{"tool_name":"Write","tool_input":{"file_path":"/r/a.md","content":"postgres://user:password@localhost:5432/db"}}'
expect 0 "allows schema code (short values)" '{"tool_name":"Write","tool_input":{"file_path":"/r/a.ts","content":"password: z.string().min(12),"}}'
expect 0 "allows an ordinary Bash command"  '{"tool_name":"Bash","tool_input":{"command":"npm test -- --runInBand"}}'
expect 0 "allows AWS docs EXAMPLE key"      '{"tool_name":"Write","tool_input":{"file_path":"/r/a.md","content":"AKIAIOSFODNN7EXAMPLE"}}'
expect 1 "fails open on bad JSON"          'not json'

printf '\n%s passed, %s failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
