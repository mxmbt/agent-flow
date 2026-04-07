---
name: frontend-design
description: "Frontend design: distinctive UI, anti-AI-slop."
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Every animation must express a cause-effect relationship, not be decorative. Rules:
  - **Duration**: 150–300ms micro-interactions, ≤400ms complex transitions, NEVER >500ms
  - **Easing**: ease-out for entering elements, ease-in for exiting. Never linear for UI transitions. Prefer spring/physics-based curves for natural feel.
  - **Exit faster than enter**: Exit animations ~60-70% of enter duration for responsiveness
  - **Stagger**: List/grid item entrance stagger 30–50ms per item. Avoid all-at-once or too-slow reveals.
  - **Transform only**: Animate `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left` (causes layout thrashing).
  - **Interruptible**: User tap/gesture MUST cancel in-progress animation immediately. Never block input during animation.
  - **Spatial continuity**: Page/screen transitions maintain directional context (shared element, directional slide). Forward → left/up, backward → right/down.
  - **Reduced motion**: ALWAYS respect `prefers-reduced-motion: reduce`. Disable or simplify animations when requested.
  - **One orchestrated moment > scattered micro-interactions**: Focus on high-impact page load with staggered reveals rather than animating everything. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## ZNAI Project Context

При работе над ZNAI используй дизайн-систему проекта:
- **SSOT**: `docs/design/DESIGN-SYSTEM.md` — токены, компоненты, layout, motion, accessibility
- **UX-тексты**: `docs/design/UX-WRITING-GUIDE.md` — tone modes, terminology, CTA, errors, empty states
- **Компоненты**: Shadcn/UI + Tailwind CSS
- **AI Slop Detection**: проверяй по чеклисту из `.claude/skills/design-audit/SKILL.md`

Используй токены из дизайн-системы, не изобретай собственные значения для spacing, colors, typography.
