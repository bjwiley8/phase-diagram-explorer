import { ABParams, R, Phase, clamp } from '../common';
import { gRefLiquidA, gRefLiquidB } from '../reference';

export interface ModelAPI {
  g:  (phase: Phase, x: number, T: number) => number;
  g1: (phase: Phase, x: number, T: number) => number;
  g2: (phase: Phase, x: number, T: number) => number;
  phasesAt: (T: number) => Phase[];
  params: ABParams;
}

export function makePeltonAB(params: ABParams): ModelAPI {
  const p = params;

  function gIdeal(x: number, T: number) {
    const xc = clamp(x);
    return R * T * (xc * Math.log(xc) + (1 - xc) * Math.log(1 - xc));
  }

  function gIdeal1(x: number, T: number) {
    const xc = clamp(x);
    return R * T * Math.log(xc / (1 - xc));
  }

  function gIdeal2(x: number, T: number) {
    const xc = clamp(x);
    return R * T * (1 / xc + 1 / (1 - xc));
  }

  function gXS(phase: Phase, x: number) {
    const Omega = phase === 'sol' ? p.OmegaSol : p.OmegaLiq;
    const xc = clamp(x);
    return xc * (1 - xc) * Omega;
  }

  function gXS1(phase: Phase, x: number) {
    const Omega = phase === 'sol' ? p.OmegaSol : p.OmegaLiq;
    const xc = clamp(x);
    return (1 - 2 * xc) * Omega;
  }

  function gXS2(phase: Phase, _x: number) {
    const Omega = phase === 'sol' ? p.OmegaSol : p.OmegaLiq;
    return -2 * Omega;
  }

  function gRef(phase: Phase, x: number, T: number) {
    if (phase === 'sol') return 0; // pedagogical choice: solid reference baseline 0
    // liquid: linear reference term x*gA + (1-x)*gB
    return x * gRefLiquidA(T, p) + (1 - x) * gRefLiquidB(T, p);
  }

  function g(phase: Phase, x: number, T: number) {
    return gRef(phase, x, T) + gIdeal(x, T) + gXS(phase, x);
  }

  function g1(phase: Phase, x: number, T: number) {
    const dRef = phase === 'liq' ? (gRefLiquidA(T, p) - gRefLiquidB(T, p)) : 0;
    return dRef + gIdeal1(x, T) + gXS1(phase, x);
  }

  function g2(phase: Phase, x: number, T: number) {
    return gIdeal2(x, T) + gXS2(phase, x);
  }

  function phasesAt(_T: number): Phase[] {
    return ['liq', 'sol'];
  }

  return { g, g1, g2, phasesAt, params: p };
}

