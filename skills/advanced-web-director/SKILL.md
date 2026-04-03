---
name: advanced-web-director
description: Upgrade existing websites into more advanced, high-impact web experiences using a strict step-by-step process. Use when requests mention “make this site more advanced,” animation upgrades, premium redesigns, interactive storytelling, modern landing-page refactors, or improving UI quality while preserving core product behavior.
---

# Advanced Web Director

Execute a deliberate transformation process. Improve sophistication without breaking core behavior.

## Invocation Pattern

Use this skill after the operator loads it with `/skills load <path-to-advanced-web-director>`.
Then accept prompts like:

- "Use $advanced-web-director to make my current landing page premium."
- "Use $advanced-web-director to upgrade this site step by step without changing core logic."
- "Use $advanced-web-director to add advanced animation and stronger visual hierarchy."

## Step-by-Step Workflow

1. Audit the current site first.
   Identify stack, layout system, major sections, animation code, performance bottlenecks, and accessibility risks.
2. Freeze functional behavior.
   Preserve routes, business logic, form behavior, and analytics hooks unless explicit permission is given to change them.
3. Define the target direction.
   Choose a style direction, typography system, color strategy, motion rhythm, and interaction tone.
4. Plan the transformation in passes.
   Apply updates in this order: design tokens, layout refinement, typography hierarchy, motion system, interaction polish, accessibility fixes, performance tuning.
5. Implement one pass at a time.
   Keep diffs scoped and test each pass before moving forward.
6. Validate continuously.
   Test desktop and mobile, keyboard navigation, reduced-motion, and section-level regressions after each pass.
7. Summarize decisions.
   Report what changed, what stayed stable, and why each visual/motion decision improves the site.

## Operating Rules

1. Prefer progressive enhancement over full rewrites.
2. Keep motion purposeful; avoid animation that does not support hierarchy or comprehension.
3. Animate mostly `transform` and `opacity`; avoid layout-thrashing properties.
4. Use tokens (`--space-*`, `--color-*`, `--radius-*`, `--duration-*`) to keep the system consistent.
5. Preserve or improve accessibility and performance in every pass.
6. Avoid introducing breaking dependencies without explicit approval.

## Reference File

Load `references/web-elevation-playbook.md` when selecting advanced patterns, quality gates, and pass-by-pass upgrade tactics.

## Output Contract

Always provide:

1. A short upgrade plan before edits.
2. File-by-file change summary after edits.
3. Validation notes (responsive, accessibility, performance).
4. Clear next-step options for further refinement.
