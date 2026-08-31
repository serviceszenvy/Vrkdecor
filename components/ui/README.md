# components/ui

Design-system primitives from the AI-derived proposed design system
(P2). See [`docs/DESIGN-SYSTEM.md`](../../docs/DESIGN-SYSTEM.md) for the
rationale and usage rules, and `/design-system` in a running app for a live
reference of every primitive.

| Primitive                                   | Purpose                                           |
| ------------------------------------------- | ------------------------------------------------- |
| `Container`                                 | Horizontal gutters and max width                  |
| `Section`, `SectionHeading`                 | Vertical rhythm, section tone, heading hierarchy  |
| `Button`, `ButtonLink`                      | Actions and calls to action; 6 variants, 3 sizes  |
| `Card`, `CardBody`, `CardTitle`, `CardMeta` | Surface container for designs, services, packages |
| `Badge`                                     | Occasion, style and service tags                  |
| `ImageFrame`, `ImageScrim`                  | Photography treatment and overlay legibility      |
| `SkipLink`                                  | Keyboard shortcut past the navigation             |

Rules:

- Components reference **semantic** colour roles, never raw palette steps that
  have not been contrast-checked.
- Every interactive control is at least 44x44 CSS pixels.
- Motion is wrapped in `motion-safe:` so it is disabled under
  `prefers-reduced-motion`.
- Feature-specific components live under `features/`, not here.
