# Web Elevation Playbook

Use this guide after auditing the current website.

## Pass 1: Design Tokens

Define core tokens before redesign work:

- Color tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`
- Type scale tokens: `--step--1` to `--step-5`
- Spacing tokens: `--space-2` to `--space-24`
- Motion tokens: `--duration-fast`, `--duration-base`, `--duration-slow`, `--ease-standard`

Result: consistent visual language and easier future refactors.

## Pass 2: Layout Architecture

Upgrade structure without breaking behavior:

1. Keep semantic landmarks (`header`, `main`, `section`, `footer`).
2. Move to a clear grid/container strategy.
3. Increase whitespace hierarchy across sections.
4. Strengthen reading flow on mobile first, then desktop.

Result: cleaner information hierarchy and better responsiveness.

## Pass 3: Typography and Visual Hierarchy

Improve clarity and premium feel:

1. Use one expressive heading family and one readable body family.
2. Tune line length (`45-75ch`) for text-heavy blocks.
3. Increase heading contrast and spacing rhythm.
4. Use consistent emphasis patterns for CTAs and metadata.

Result: stronger scanability and brand character.

## Pass 4: Motion System

Add intentional motion patterns:

1. Entrance reveals: stagger by hierarchy (heading, body, CTA).
2. Scroll-linked accents: subtle progress, parallax, or depth cues.
3. Interaction states: hover/focus/press transitions for controls.
4. Ambient effects: low-intensity background motion only.

Rules:

- Animate `transform` and `opacity` whenever possible.
- Keep one dominant rhythm per page.
- Avoid more than 2-3 concurrent looping animations in view.

Result: dynamic but controlled experience.

## Pass 5: Interaction Polish

Improve perceived quality:

1. Add tactile button/link states.
2. Add card hover depth and active feedback.
3. Add scroll or section transitions that support narrative.
4. Keep response times quick and predictable.

Result: interface feels intentional and modern.

## Pass 6: Accessibility and Resilience

Required checks:

1. Add `@media (prefers-reduced-motion: reduce)` fallbacks.
2. Ensure visible focus outlines on interactive elements.
3. Preserve contrast and readable text sizing.
4. Keep interactions usable with keyboard only.

Result: advanced visuals without excluding users.

## Pass 7: Performance Hardening

Check and optimize:

1. Audit heavy assets and reduce image weight.
2. Avoid forced reflow patterns in animation loops.
3. Use lazy loading where suitable.
4. Defer non-critical effects and scripts.

Result: smooth experience on mid-tier devices.

## Quality Gates

Ship only when all are true:

1. Functional behavior unchanged (unless explicitly approved).
2. No major layout regressions at mobile/tablet/desktop breakpoints.
3. Reduced-motion mode provides a calm, fully usable alternative.
4. Visual system feels cohesive across all sections.
5. Change summary and rationale are documented.
