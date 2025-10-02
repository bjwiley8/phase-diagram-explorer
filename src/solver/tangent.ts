import { Phase, clamp } from '../models/common';

export interface Model {
  g: (phase: Phase, x: number, T: number) => number;
  g1: (phase: Phase, x: number, T: number) => number;
  g2: (phase: Phase, x: number, T: number) => number;
}

export interface TangentResult {
  ok: boolean;
  xA: number;
  xB: number;
  it?: number;
}

// Solve common tangent between phases A and B at temperature T
export function solveCommonTangent(model: Model, A: Phase, B: Phase, T: number, seedA: number, seedB: number): TangentResult {
  let xA = clamp(seedA);
  let xB = clamp(seedB);
  for (let it = 0; it < 50; it++) {
    const gA = model.g(A, xA, T), gB = model.g(B, xB, T);
    const gAp = model.g1(A, xA, T), gBp = model.g1(B, xB, T);
    const gApp = model.g2(A, xA, T), gBpp = model.g2(B, xB, T);
    const F1 = gAp - gBp;
    const F2 = gB - gA - gAp * (xB - xA);
    if (Math.max(Math.abs(F1), Math.abs(F2)) < 1e-9) {
      return { ok: true, xA, xB, it };
    }
    const J11 = gApp;                   // ∂F1/∂xA
    const J12 = -gBpp;                  // ∂F1/∂xB
    const J21 = -gApp * (xB - xA);      // ∂F2/∂xA
    const J22 = -F1;                    // ∂F2/∂xB (correct sign)

    const det = J11 * J22 - J12 * J21;
    if (!isFinite(det) || Math.abs(det) < 1e-18) break;

    // Solve J * dx = -F
    const dxA = (-F1 * J22 + F2 * J12) / det;
    const dxB = ( F1 * J21 - F2 * J11) / det;

    // Basic damping to stabilize near flat tangents
    let lam = 1.0;
    for (let k = 0; k < 5; k++) {
      const nxA = clamp(xA + lam * dxA);
      const nxB = clamp(xB + lam * dxB);
      const nF1 = model.g1(A, nxA, T) - model.g1(B, nxB, T);
      const nF2 = model.g(B, nxB, T) - model.g(A, nxA, T) - model.g1(A, nxA, T) * (nxB - nxA);
      if (Math.max(Math.abs(nF1), Math.abs(nF2)) < Math.max(Math.abs(F1), Math.abs(F2))) {
        xA = nxA; xB = nxB; break;
      }
      lam *= 0.5;
      if (lam < 1e-3) { xA = nxA; xB = nxB; break; }
    }
  }
  return { ok: false, xA, xB };
}

export function tangentLine(model: Model, A: Phase, xA: number, T: number) {
  const m = model.g1(A, xA, T);
  const b = model.g(A, xA, T) - m * xA;
  return { m, b };
}

export function isStableContact(model: Model, A: Phase, B: Phase, T: number, xA: number, xB: number) {
  // require convexity at contact points
  if (model.g2(A, xA, T) < 0 || model.g2(B, xB, T) < 0) return false;
  // ensure line is not above curves between points (allow tiny tolerance)
  const { m, b } = tangentLine(model, A, xA, T);
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const x = xA + (xB - xA) * (i / n);
    const line = m * x + b;
    if (model.g(A, x, T) - line < -1e-6) return false;
    if (model.g(B, x, T) - line < -1e-6) return false;
  }
  return true;
}

