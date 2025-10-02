import React from 'react';
import { ABParams, defaultAB } from '../models/common';

function NumberInput(props: { label: string; value: number; step?: number; onChange: (v:number)=>void; min?: number; max?: number; width?: number }) {
  const { label, value, step=1, onChange, min, max, width=100 } = props;
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:6, marginRight:12}}>
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
        <strong>Temperature (K)</strong>
        <input type="range" min={300} max={2000} step={1} value={T} onChange={e=>onT(parseFloat(e.target.value))} style={{width:240}}/>
        <NumberInput label="T" value={T} step={1} onChange={onT} min={300} max={2000} width={90}/>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>AB Parameters (J/mol, K)</strong>
        <div>
          <NumberInput label="Ω_sol" value={params.OmegaSol} step={100} onChange={v=>onParams({...params, OmegaSol:v})} />
          <NumberInput label="Ω_liq" value={params.OmegaLiq} step={100} onChange={v=>onParams({...params, OmegaLiq:v})} />
          <NumberInput label="T_m^A" value={params.TmA} step={1} onChange={v=>onParams({...params, TmA:v})} />
          <NumberInput label="T_m^B" value={params.TmB} step={1} onChange={v=>onParams({...params, TmB:v})} />
          <NumberInput label="S_f^A" value={params.SfA} step={0.1} onChange={v=>onParams({...params, SfA:v})} />
          <NumberInput label="S_f^B" value={params.SfB} step={0.1} onChange={v=>onParams({...params, SfB:v})} />
          <button onClick={()=>onParams(defaultAB)} style={{marginLeft:8}}>Reset</button>
        </div>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Sweep</strong>
        <div>
          <NumberInput label="Tmin" value={sweep.Tmin} step={1} onChange={v=>onSweep({...sweep, Tmin:v})} />
          <NumberInput label="Tmax" value={sweep.Tmax} step={1} onChange={v=>onSweep({...sweep, Tmax:v})} />
          <NumberInput label="ΔT" value={sweep.dT} step={1} onChange={v=>onSweep({...sweep, dT:v})} />
        </div>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Pedagogy</strong>
        <label style={{marginLeft:8}}><input type="checkbox" checked={showDerivs.g1} onChange={e=>onShowDerivs({...showDerivs, g1:e.target.checked})}/> show g'</label>
        <label style={{marginLeft:8}}><input type="checkbox" checked={showDerivs.g2} onChange={e=>onShowDerivs({...showDerivs, g2:e.target.checked})}/> show g''</label>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Debug</strong>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showMarkers} onChange={e=>onDebug && onDebug({showMarkers:e.target.checked, showTieLines: debug?.showTieLines ?? true})}/> markers</label>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showTieLines} onChange={e=>onDebug && onDebug({showMarkers: debug?.showMarkers ?? false, showTieLines:e.target.checked})}/> tie‑line(s) at T</label>
      </div>
    </div>
  );
}
