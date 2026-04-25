# Élara Home — Design System

## Overview

**Élara Home** is a premium eCommerce brand specializing in curated home décor products. The brand targets aspirational consumers who seek warmth, elegance, and sophistication in their living spaces. Every touchpoint communicates quality, refinement, and a sense of elevated everyday life.

**Category:** Home décor / lifestyle eCommerce  
**Positioning:** High-society aesthetic, artisanal warmth, modern luxury  
**Language:** Spanish (primary), English (secondary)  
**Sources:** Brand created from scratch (no external codebase or Figma provided)

---

## Brand Name & Tagline

**Élara Home**  
*Tagline:* "Tu hogar, tu mejor obra de arte." *(Your home, your greatest work of art.)*

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Warm and personal:** Always "tú" (informal you), never "usted." The brand feels like a trusted friend with exquisite taste.
- **Aspirational but accessible:** Copy elevates the reader; it never makes them feel excluded. "Merecés lo mejor" (You deserve the best) not "Solo para unos pocos."
- **Persuasive and sensory:** Describe textures, light, scent, atmosphere. Sell the feeling, not just the product.
- **Friendly elegance:** Not stiff or corporate. Sentences can end with a smile — never with exclamation abuse. One `!` per message, maximum.

### Casing
- Headlines: **Title Case** in Spanish (primera letra capital por palabra clave)
- Body: Sentence case
- CTAs: Short, imperative, warm. "Explorá la colección" not "SHOP NOW"
- No ALL CAPS for decorative text; use letter-spacing instead

### Emoji Policy
- **Rarely used.** When used: 🌿 🕯️ ✨ — only in social media or email subject lines, never in product copy or UI
- No emoji in navigation, buttons, or headings

### Copy Examples
- Product: "Una pieza que transforma cualquier rincón en un refugio de calma."
- CTA: "Descubrí tu estilo" / "Agregá a tu hogar" / "Explorá la colección"
- Confirmation: "¡Tu pedido está en camino! Gracias por confiar en Élara."
- Empty state: "Tu wishlist espera por esas piezas que te enamoraron."
- Error: "Algo salió mal. Intentá de nuevo — tu hogar te espera."

### Punctuation (Spanish)
- Use inverted punctuation: ¿Necesitás ayuda? / ¡Gracias!
- Em-dash (—) for elegant parenthetical breaks
- Ellipsis (…) sparingly for evocative pause

---

## VISUAL FOUNDATIONS

### Colors
See `colors_and_type.css` for full token definitions.

| Token | Value | Use |
|---|---|---|
| `--cream` | `#F5EDE0` | Primary background |
| `--warm-white` | `#FAF6F1` | Cards, surfaces |
| `--sand` | `#E2C9A0` | Borders, dividers |
| `--gold` | `#B8945F` | Primary accent, CTAs |
| `--gold-light` | `#D4AF7A` | Hover states, highlights |
| `--gold-dark` | `#8A6B3D` | Active states, pressed |
| `--espresso` | `#2E1F0E` | Primary text |
| `--warm-gray` | `#7A6A58` | Secondary text |
| `--blush` | `#D9B8B0` | Soft accents, tags |
| `--sage` | `#8A9E8C` | Success, nature accents |
| `--charcoal` | `#1A1410` | Darkest text, headers |

**Color Vibe:** Warm ivory backgrounds, champagne gold accents, espresso-dark text. Never cool or blue-tinted. Imagery should be warm-toned, natural light, linen textures.

### Typography
- **Display / Headlines:** Cormorant Garamond (elegant serif; conveys heritage and refinement)
- **Body / UI:** Jost (geometric humanist; clean, modern, very legible)
- **Accent / Labels:** Jost 500 with wide letter-spacing (0.12em)
- **Min size:** 14px body; 12px micro-labels only

### Backgrounds
- Primary: `--cream` (#F5EDE0) — never pure white
- Cards: `--warm-white` (#FAF6F1) — slightly elevated
- Dark sections: `--espresso` (#2E1F0E) with gold accents
- No heavy gradients. Subtle radial warmth (cream to white) on hero sections only
- Texture: Optional linen/grain overlay at 4% opacity for depth

### Imagery
- Warm, natural light (golden hour preferred)
- Neutral-to-warm color grading; never blue/cold
- Lifestyle shots > product-on-white
- Textures: linen, marble, wood, ceramic
- Grain/film texture welcome for editorial feel

### Spacing & Layout
- Base unit: 8px grid
- Section padding: 80px–120px vertical
- Cards: 24px padding
- Corner radii: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 16px`, `--radius-pill: 100px`

### Cards
- Background: `--warm-white`
- Border: 1px solid `--sand` (rgba, 60%)
- Shadow: `0 2px 16px rgba(46,31,14,0.07)`
- Hover: shadow lifts `0 8px 32px rgba(46,31,14,0.12)`, slight translateY(-2px)
- Radius: `--radius-md` (8px)

### Hover & Press States
- Links/buttons: color shifts to `--gold-light` (hover), `--gold-dark` (press)
- Cards: translateY(-2px) + shadow lift
- No opacity flicker — always color-based transitions
- Transition: `200ms ease`

### Animation
- Subtle and purposeful. Fade-in on scroll (opacity 0→1, translateY 12px→0)
- No bounces or elastic. Ease-out preferred.
- Duration: 200ms (micro), 400ms (page transitions), 600ms (hero reveals)

### Borders & Shadows
- Dividers: 1px `--sand` at 40% opacity
- Elevation 1 (cards): `0 2px 16px rgba(46,31,14,0.07)`
- Elevation 2 (modals/dropdowns): `0 8px 40px rgba(46,31,14,0.14)`
- Elevation 3 (sticky nav): `0 2px 8px rgba(46,31,14,0.10)`
- Never dark/harsh shadows — always warm-tinted

### Corner Radii
- Buttons: `--radius-pill` (fully rounded)
- Cards: `--radius-md` (8px)
- Images: `--radius-sm` (4px) or square for editorial
- Tags/badges: `--radius-pill`

### Blur & Transparency
- Nav on scroll: `backdrop-filter: blur(12px)` with `--cream` at 85% opacity
- Modals: backdrop `rgba(46,31,14,0.4)` blur(4px)

---

## ICONOGRAPHY

No proprietary icon font provided. **Lucide Icons** (CDN) used throughout — stroke-based, 1.5px weight, rounded caps. This matches the brand's refined-but-warm personality.

Usage:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="heart"></i>
```

Common icons: `heart`, `shopping-bag`, `search`, `user`, `star`, `package`, `truck`, `arrow-right`, `x`, `check`, `home`, `leaf`

No emoji used as icons in UI. SVG illustrations created as abstract line-art in gold tones.

**Logo:** See `assets/logo.svg` — Élara wordmark in Cormorant Garamond style, with a minimal casa/arch mark.

---

## FILE INDEX

```
README.md                  ← This file
SKILL.md                   ← Agent skill definition
colors_and_type.css        ← All CSS custom properties
assets/
  logo.svg                 ← Brand wordmark
  logo-dark.svg            ← Inverse wordmark
  icon-mark.svg            ← Symbol only
preview/
  colors-primary.html
  colors-semantic.html
  type-display.html
  type-body.html
  type-scale.html
  spacing-tokens.html
  shadows-radii.html
  btn-components.html
  card-components.html
  badge-tag.html
  form-components.html
  brand-logo.html
ui_kits/
  ecommerce/
    README.md
    index.html
    Header.jsx
    ProductCard.jsx
    Hero.jsx
    Footer.jsx
    CartDrawer.jsx
    ProductDetail.jsx
```
