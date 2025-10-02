export const R = 8.31446261815324; // J mol^-1 K^-1

export function clamp(x: number, lo = 1e-9, hi = 1 - 1e-9) {
  return Math.min(hi, Math.max(lo, x));
}

export function linspace(n: number, lo = 0, hi = 1) {
  const arr = new Array(n);
  if (n === 1) return [lo];
  const step = (hi - lo) / (n - 1);
  for (let i = 0; i < n; i++) arr[i] = lo + step * i;
  return arr;
}

export function argMin(values: number[]): number {
  let idx = 0;
  let v = values[0];
  for (let i = 1; i < values.length; i++) if (values[i] < v) { v = values[i]; idx = i; }
  return idx;
}

export type Phase = 'liq' | 'sol';

export interface ABParams {
  TmA: number; TmB: number; // K
  SfA: number; SfB: number; // J/mol/K
  OmegaSol: number; // J/mol
  OmegaLiq: number; // J/mol
}

export const defaultAB: ABParams = {
  TmA: 800,
  TmB: 1200,
  SfA: 10,
  SfB: 10,
  OmegaSol: -15000,
  OmegaLiq: 0
};

