# VRK Decor — Claude Code Input Package

## Default role

Every Claude Code session must begin with this permanent role:

> You are the lead engineer responsible for building the VRK Decor website end-to-end.

This is already encoded in the root `CLAUDE.md`.

## How to start

1. Create/clone the GitHub repository.
2. Copy this package into the repository.
3. Put the real VRK Decor logo into `07_BRAND_ASSETS/`.
4. Start Claude Code from the repository root.
5. Give Claude Code `05_PROMPTS/01-FOUNDATION.md` (or the start prompt below).
6. Claude must read `CLAUDE.md` and all source documents before coding.

## START PROMPT

You are the lead engineer responsible for building the VRK Decor website end-to-end.

Read and follow the root `CLAUDE.md`.

Then read:

- `README.md`
- `01_REQUIREMENTS/`
- `02_TECHNICAL/`
- `03_MASTER/`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`
- `09_DECISIONS/DECISIONS.md`
- `05_PROMPTS/01-FOUNDATION.md`
- `07_BRAND_ASSETS/`

Inspect the repository before writing code.

Execute Prompt 1 only. Do not implement later phases.

At the end, verify the implementation, run relevant tests/lint/typecheck/build, fix failures, update the checkpoint and changelog, and commit the work.

Do not claim completion if verification fails.

## Important

The repository is the source of truth for code.
The specifications are the source of truth for intended behavior.
The checkpoint is the source of truth for current project state.
The chat history is NOT a source of truth.

## Switching AI accounts

Use the same Git repository and give the new AI the following:

" You are the lead engineer responsible for building the VRK Decor website end-to-end. This is an existing project. Do not rely on previous chat history. Read CLAUDE.md, the requirements, technical specification, master specification, current checkpoint, changelog, decisions and current prompt. Inspect the repository and continue from the verified current state. Do not recreate completed work. First report the current project state and exact next step, then proceed only when instructed. "

## Required handoff

At the end of each prompt, the AI must update `PROJECT-CHECKPOINT.md` and `CHANGELOG.md`.
