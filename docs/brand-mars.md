# MARS brand system

Marching Arts Review System, visually grounded in **Mars the planet**, **Mars the Roman idea of disciplined guardianship**, and **exploration lore**—without costume or kitsch.

## Principle

Borrow structure and metaphor, not merch. Trust comes from restraint, typography, and a single oxide accent—not glow, badges, or sci-fi chrome.

If the first viewport still feels like a generic SaaS app after removing the nav, branding is too weak. If it feels like a theme park, it is too loud.

## Lore → design

### Planet

| Source | Use in product | Do not |
|--------|----------------|--------|
| Iron oxide / dust | Primary accent (CTAs, links, focus) | Rainbow accents |
| Basalt / regolith | Near-black text & dark surfaces | Pure #000 UI voids |
| Thin atmosphere / horizon | Full-bleed hero haze, wide margins | Nebula / purple gradients |
| Distance & delay | Measured copy; quiet empty states | Playful loading toys |
| Scale (canyons, Mons) | Deep section breaks for serious flows | Mountain logos |

### Mythology (Roman Mars)

Mars as **order, guardianship, cultivated strength**—closer to stewardship than spectacle. UI language may occasionally use “record,” “dispatch,” or “log,” never spears, helmets, or war iconography.

### Modern lore

Mission-ops clarity (labeled fields, hierarchical type), cartographic search (survey the field), settlement seriousness (anonymous public voice + verified accountability). Reject NASA logo pastiche, rocket stickers, and meme-red planets.

## Voice

- Clear, archival, non-theatrical
- Prefer “review,” “season,” “verified” over forced space puns
- One metaphor per surface max

## Visual tokens

Defined in `src/app/globals.css`:

- **Ground (light):** warm dust / bone with slight oxide cast  
- **Ground (dark):** basalt, follows `prefers-color-scheme`  
- **Ink:** deep basalt / soft ash  
- **Oxide:** single accent for primary actions  
- **Stroke:** thin stone/ash lines  

## Typography

- **Display:** Fraunces — hero **MARS** wordmark only  
- **UI / body:** Figtree — forms, nav, reviews  
- **Micro-labels:** wide tracking, uppercase, rare (e.g. system name line)

## Motion

Exactly three intentional motions on marketing surfaces:

1. Hero horizon fade-in  
2. Slow atmospheric haze drift  
3. Oxide focus ring on interactive controls (browser/default enhanced via tokens)

No particle fields, no parallax overload.

## Layout rules

- Brand-first hero: MARS is the dominant signal  
- One job per section  
- No cards in the hero; cards only when they wrap an interaction  
- Full-bleed atmosphere; no inset hero media collage  

## Do / don’t

**Do:** oxide sparingly; empty space; system dark mode; accessible contrast.  
**Don’t:** Inter/Roboto defaults; purple gradients; cream+terracotta cliché stacks; glow; emoji; dashboard chrome on public landing.
