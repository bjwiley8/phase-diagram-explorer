import React from 'react';
import { ABParams, defaultAB } from '../models/common';

function NumberInput(props: { label: React.ReactNode; title?: string; value: number; step?: number; onChange: (v:number)=>void; min?: number; max?: number; width?: number }) {
  const { label, title, value, step=1, onChange, min, max, width=100 } = props;
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:6, marginRight:12}} title={title}>
      <span style={{minWidth:120}}>{label}</span>
      <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value))} step={step} min={min} max={max} style={{width}} />
    </label>
  );
}

export default function Controls(props: {
  T: number; onT: (T:number)=>void;
  params: ABParams; onParams: (p:ABParams)=>void;
  sweep: {Tmin:number;Tmax:number;dT:number}; onSweep: (s:{Tmin:number;Tmax:number;dT:number})=>void;
  showDerivs: { g1: boolean; g2: boolean }; onShowDerivs: (s:{g1:boolean; g2:boolean})=>void;
  debug?: { showMarkers:boolean; showTieLines:boolean }; onDebug?: (d:{showMarkers:boolean; showTieLines:boolean})=>void;
}) {
  const { T, onT, params, onParams, sweep, onSweep, showDerivs, onShowDerivs, debug, onDebug } = props;
  return (
    <div style={{padding:'8px', borderBottom:'1px solid #ddd', display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <strong title="Current temperature used for g(x,T), tie-lines, and the vertical guide on the plots.">Temperature (K)</strong>
        <input type="range" min={300} max={2000} step={1} value={T} onChange={e=>onT(parseFloat(e.target.value))} style={{width:240}}/>
        <NumberInput label={<span>T</span>} title="Current temperature (K)." value={T} step={1} onChange={onT} min={300} max={2000} width={90}/>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>AB Parameters (J/mol, K)</strong>
        <div>
          <NumberInput
            label={<span>Ω<sup>sol</sup></span>}
            title="Regular‑solution interaction parameter in the solid (J/mol). Positive widens the miscibility gap; negative narrows it."
            value={params.OmegaSol}
            step={100}
            onChange={v=>onParams({...params, OmegaSol:v})}
          />
          <NumberInput
            label={<span>Ω<sup>liq</sup></span>}
            title="Regular‑solution interaction parameter in the liquid (J/mol). Positive favors liquid unmixing; negative smooths the liquid curve."
            value={params.OmegaLiq}
            step={100}
            onChange={v=>onParams({...params, OmegaLiq:v})}
          />
          <NumberInput
            label={<span>T<sub>m</sub>(A)</span>}
            title="Melting temperature of pure A (K). With ΔS_f(A), sets H_f(A)=T_m(A)·ΔS_f(A) in the liquid reference."
            value={params.TmA}
            step={1}
            onChange={v=>onParams({...params, TmA:v})}
          />
          <NumberInput
            label={<span>T<sub>m</sub>(B)</span>}
            title="Melting temperature of pure B (K). With ΔS_f(B), sets H_f(B)=T_m(B)·ΔS_f(B) in the liquid reference."
            value={params.TmB}
            step={1}
            onChange={v=>onParams({...params, TmB:v})}
          />
          <NumberInput
            label={<span>ΔS<sub>f</sub>(A)</span>}
            title="Entropy of fusion of pure A (J/mol/K). Higher raises the liquid free energy below T_m(A) and increases asymmetry on the A side."
            value={params.SfA}
            step={0.1}
            onChange={v=>onParams({...params, SfA:v})}
          />
          <NumberInput
            label={<span>ΔS<sub>f</sub>(B)</span>}
            title="Entropy of fusion of pure B (J/mol/K). Higher raises the liquid free energy below T_m(B) and increases asymmetry on the B side."
            value={params.SfB}
            step={0.1}
            onChange={v=>onParams({...params, SfB:v})}
          />
          <button onClick={()=>onParams(defaultAB)} style={{marginLeft:8}}>Reset</button>
        </div>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Sweep</strong>
        <div>
          <NumberInput label={<span>T<sub>min</sub></span>} title="Lowest temperature used when tracing the phase boundaries (K)." value={sweep.Tmin} step={1} onChange={v=>onSweep({...sweep, Tmin:v})} />
          <NumberInput label={<span>T<sub>max</sub></span>} title="Highest temperature used when tracing the phase boundaries (K)." value={sweep.Tmax} step={1} onChange={v=>onSweep({...sweep, Tmax:v})} />
          <NumberInput label={<span>ΔT</span>} title="Temperature increment used during the sweep (K). Smaller steps give smoother lines." value={sweep.dT} step={1} onChange={v=>onSweep({...sweep, dT:v})} />
        </div>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Pedagogy</strong>
        <label style={{marginLeft:8}} title="Show g′(x,T). Equality of slopes at the tie‑line endpoints → equal chemical potentials."><input type="checkbox" checked={showDerivs.g1} onChange={e=>onShowDerivs({...showDerivs, g1:e.target.checked})}/> show g′</label>
        <label style={{marginLeft:8}} title="Show g″(x,T). Inflection g″=0 marks spinodals; we require g″≥0 at the endpoints."><input type="checkbox" checked={showDerivs.g2} onChange={e=>onShowDerivs({...showDerivs, g2:e.target.checked})}/> show g″</label>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Debug</strong>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showMarkers} onChange={e=>onDebug && onDebug({showMarkers:e.target.checked, showTieLines: debug?.showTieLines ?? true})}/> markers</label>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showTieLines} onChange={e=>onDebug && onDebug({showMarkers: debug?.showMarkers ?? false, showTieLines:e.target.checked})}/> tie‑line(s) at T</label>
      </div>
    </div>
  );
}
