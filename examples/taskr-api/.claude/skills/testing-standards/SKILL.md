---
name: testing-standards
description: How to write and run tests in this project. Use when adding, changing or fixing tests, or when a task asks for test coverage.
---

# Writing tests in this project

The project-specific rules live in **`context/testing-standards.md`** — read it first. It overrides personal defaults.

## Always

- One behaviour per test; the test name says what the system does, in plain English.
- Cover the happy path **and** every error case the contract names.
- Tests are deterministic: no real network, no wall-clock dependence, no order dependence.
- Never weaken, skip or delete a failing test to get green. If a test is wrong, say why and stop.

## Run

Use the **Commands** section of `CLAUDE.md`. Run the single file while iterating, then the full suite before `/verify-unit`.
