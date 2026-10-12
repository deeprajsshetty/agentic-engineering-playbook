<!-- GENERATION-PROMPT:START
Use when: a decision is expensive to reverse (data store, auth model, framework, sync vs push, monorepo layout). Save as docs/adr/NNNN-short-title.md.

```text
We need to decide [question]. Context: [constraints, scale, team, deadlines].
Options I'm considering: [A], [B], [C?]. Write an ADR using the playbook's templates/ADR.md. For each
option give honest pros, cons and the cost of reversing it later. Recommend one and say
what would make us revisit. Evaluate each option against the Three Standards: does it
scale, is it secure, will we understand why it works. Ask me questions if the context
is insufficient to recommend.
```

Good output: the rejected options are argued fairly; consequences include the negative ones; "revisit when" is a concrete trigger.
GENERATION-PROMPT:END -->
# ADR [NNNN]: [Decision title]

- **Status:** Proposed | Accepted | Superseded by ADR [NNNN]
- **Date:** [YYYY-MM-DD] · **Deciders:** [names]

## Context
[The forces at play: requirements, constraints, scale, deadlines. Facts, not opinions.]

## Options
| Option | Pros | Cons | Cost to reverse |
|---|---|---|---|
| A — [name] | | | |
| B — [name] | | | |

## Decision
We will [decision], because [the deciding reasons].

## Three Standards
- **Scale:** [how it holds at 10× load / team / features]
- **Secure:** [new attack surface, data handling, secrets]
- **Understood:** [what the team must learn; where it could surprise us]

## Consequences
- Positive: [ … ]
- Negative / accepted trade-offs: [ … ]

## Revisit when
[A concrete trigger — e.g. "> 1M rows in messages" or "a second provider is added".]
