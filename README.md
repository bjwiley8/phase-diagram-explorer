## Phase Diagram Explorer (AB v1)

Interactive common‑tangent explorer linking g(x,T) to phase diagrams for a binary A–B alloy (liquid + solid, per‑mole).

- Live g(x,T) with tangent, minima, optional g' and g'' overlays
- Projection to T–x with liquidus/solidus and tie‑line at current T
- Adjustable Ω_sol, Ω_liq, TmA/TmB, SfA/SfB and temperature sweep

### Develop

```
npm install
npm run dev
```

### Build

```
npm run build && npm run preview
```

### Deploy

This repo deploys automatically to GitHub Pages on push to `main`.
The Vite `base` is set to `/phase-diagram-explorer/` for project pages.

