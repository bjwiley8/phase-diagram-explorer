import { Phase } from '../models/common';
import { Model } from './tangent';
import { solveCommonTangent, isStableContact } from './tangent';

export interface TracePoint { T: number; x: number; }
export interface Traces { liq: TracePoint[]; sol: TracePoint[]; }

export function sweepTemperature(
  model: Model,
  pairs: [Phase, Phase][],
  Tmin: number,
  Tmax: number,
  dT: number,
  seedA = 0.2,
  seedB = 0.8
): Traces {
  const traces: Traces = { liq: [], sol: [] };
  // Maintain two continuation seeds so we can follow both sides if they exist
  let sA_lo = seedA, sB_hi = seedB;     // liq ~ low x, sol ~ high x
  let sA_hi = seedB, sB_lo = seedA;     // liq ~ high x, sol ~ low x (swapped)

  function addPoint(T: number, A: Phase, r: {xA:number;xB:number}) {
    const xliq = A === 'liq' ? r.xA : r.xB;
    const xsol = A === 'liq' ? r.xB : r.xA;
    traces.liq.push({ T, x: xliq });
    traces.sol.push({ T, x: xsol });
  }

  for (let T = Tmin; T <= Tmax + 1e-9; T += dT) {
    for (const [A, B] of pairs) {
      // Branch 1: low→high seeds
      const r1 = solveCommonTangent(model, A, B, T, sA_lo, sB_hi);
      if (r1.ok && isStableContact(model, A, B, T, r1.xA, r1.xB)) {
        addPoint(T, A, r1);
        sA_lo = r1.xA; sB_hi = r1.xB;
      }
      // Branch 2: high→low seeds (captures B‑rich side if present)
      const r2 = solveCommonTangent(model, A, B, T, sA_hi, sB_lo);
      if (r2.ok && isStableContact(model, A, B, T, r2.xA, r2.xB)) {
        // Avoid duplicating the same solution when both branches converge to the same root
        const last = traces.liq[traces.liq.length - 1];
        const xl = A === 'liq' ? r2.xA : r2.xB;
        if (!last || Math.abs(last.T - T) > 1e-9 || Math.abs(last.x - xl) > 1e-4) {
          addPoint(T, A, r2);
        }
        sA_hi = r2.xA; sB_lo = r2.xB;
      }
    }
  }

  // Sort traces by T so lines render cleanly
  traces.liq.sort((a,b)=>a.T-b.T);
  traces.sol.sort((a,b)=>a.T-b.T);
  return traces;
}
