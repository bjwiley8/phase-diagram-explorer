import { Phase } from '../models/common';
import { Model } from './tangent';
import { solveCommonTangent, isStableContact } from './tangent';

export interface TracePoint { T: number; x: number; }
export interface Traces { liq: TracePoint[]; sol: TracePoint[]; }

export function sweepTemperature(model: Model, pairs: [Phase, Phase][], Tmin: number, Tmax: number, dT: number, seedA = 0.2, seedB = 0.8): Traces {
  const traces: Traces = { liq: [], sol: [] };
  let sA = seedA, sB = seedB;
  for (let T = Tmin; T <= Tmax + 1e-9; T += dT) {
    for (const [A, B] of pairs) {
      const r = solveCommonTangent(model, A, B, T, sA, sB);
      if (r.ok && isStableContact(model, A, B, T, r.xA, r.xB)) {
        if (A === 'liq') { traces.liq.push({ T, x: r.xA }); traces.sol.push({ T, x: r.xB }); }
        else { traces.liq.push({ T, x: r.xB }); traces.sol.push({ T, x: r.xA }); }
        sA = r.xA; sB = r.xB;
      }
    }
  }
  return traces;
}

