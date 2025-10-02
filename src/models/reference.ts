import { ABParams } from './common';

// Liquid reference terms: g_ref_i,liq(T) = H_f,i - T S_f,i with H_f = T_m S_f
export function gRefLiquidA(T: number, p: ABParams) {
  const Hf = p.TmA * p.SfA;
  return Hf - T * p.SfA; // J/mol
}

export function gRefLiquidB(T: number, p: ABParams) {
  const Hf = p.TmB * p.SfB;
  return Hf - T * p.SfB; // J/mol
}

