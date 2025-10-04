import React from 'react';

function InfoButton(props: { text: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    fontSize: 11,
    borderRadius: '50%',
    border: '1px solid #5b9bd5',
    color: '#1f77b4',
    background: '#eef5ff',
    cursor: 'pointer',
    userSelect: 'none',
    padding: 0,
    lineHeight: '14px'
  };

  const tipStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: 0,
    maxWidth: 280,
    background: '#fff',
    color: '#222',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    padding: '8px 10px',
    zIndex: 1000,
    fontSize: 12
  };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" aria-label="info" style={btnStyle} onClick={() => setOpen(o => !o)} title={props.text}>i</button>
      {open && (
        <div role="tooltip" style={tipStyle}>
          {props.text}
        </div>
      )}
    </span>
  );
}
import { ABParams, defaultAB } from '../models/common';

function NumberInput(props: { label: React.ReactNode; title?: string; info?: string; value: number; step?: number; onChange: (v:number)=>void; min?: number; max?: number; width?: number }) {
  const { label, title, info, value, step=1, onChange, min, max, width=100 } = props;
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:6, marginRight:12}} title={title}>
      <span style={{minWidth:120, display:'inline-flex', alignItems:'center', gap:4}}>
        {label}
        {info ? <InfoButton text={info}/> : null}
      </span>
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
        <NumberInput label={<span>T</span>} title="Current temperature (K)." info="Sets both plots at this temperature and the tie‑line(s)." value={T} step={1} onChange={onT} min={300} max={2000} width={90}/>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>AB Parameters (J/mol, K)</strong>
        <div>
          <NumberInput
            label={<span>Ω<sup>sol</sup></span>}
            title="Regular‑solution interaction parameter in the solid (J/mol)."
            info="Positive → solid unmixing tendency (wider two‑phase region). Negative → favors mixing (narrower gap)."
            value={params.OmegaSol}
            step={100}
            onChange={v=>onParams({...params, OmegaSol:v})}
          />
          <NumberInput
            label={<span>Ω<sup>liq</sup></span>}
            title="Regular‑solution interaction parameter in the liquid (J/mol)."
            info="Positive → liquid unmixing tendency (dome rises). Negative → smoother liquid curve, smaller gap."
            value={params.OmegaLiq}
            step={100}
            onChange={v=>onParams({...params, OmegaLiq:v})}
          />
          <NumberInput
            label={<span>T<sub>m</sub>(A)</span>}
            title="Melting temperature of pure A (K)."
            info="With ΔS_f(A), sets H_f(A)=T_m(A)·ΔS_f(A) for the liquid reference; raises or lowers the A‑side liquidus."
            value={params.TmA}
            step={1}
            onChange={v=>onParams({...params, TmA:v})}
          />
          <NumberInput
            label={<span>T<sub>m</sub>(B)</span>}
            title="Melting temperature of pure B (K)."
            info="With ΔS_f(B), sets H_f(B)=T_m(B)·ΔS_f(B) for the liquid reference; raises or lowers the B‑side liquidus."
            value={params.TmB}
            step={1}
            onChange={v=>onParams({...params, TmB:v})}
          />
          <NumberInput
            label={<span>ΔS<sub>f</sub>(A)</span>}
            title="Entropy of fusion of pure A (J/mol/K)."
            info="Higher → liquid free energy sits higher below T_m(A); increases A‑side asymmetry and raises liquidus near A."
            value={params.SfA}
            step={0.1}
            onChange={v=>onParams({...params, SfA:v})}
          />
          <NumberInput
            label={<span>ΔS<sub>f</sub>(B)</span>}
            title="Entropy of fusion of pure B (J/mol/K)."
            info="Higher → liquid free energy sits higher below T_m(B); increases B‑side asymmetry and raises liquidus near B."
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
          <NumberInput label={<span>T<sub>min</sub></span>} title="Lowest temperature used when tracing the phase boundaries (K)." info="Lower this to reveal more of the two‑phase region on both ends." value={sweep.Tmin} step={1} onChange={v=>onSweep({...sweep, Tmin:v})} />
          <NumberInput label={<span>T<sub>max</sub></span>} title="Highest temperature used when tracing the phase boundaries (K)." info="Raise this to see the full crest of the coexistence dome." value={sweep.Tmax} step={1} onChange={v=>onSweep({...sweep, Tmax:v})} />
          <NumberInput label={<span>ΔT</span>} title="Temperature increment used during the sweep (K)." info="Smaller steps → smoother curves; larger steps → faster preview." value={sweep.dT} step={1} onChange={v=>onSweep({...sweep, dT:v})} />
        </div>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Pedagogy</strong>
        <label style={{marginLeft:8, display:'inline-flex', alignItems:'center', gap:6}}>
          <input type="checkbox" checked={showDerivs.g1} onChange={e=>onShowDerivs({...showDerivs, g1:e.target.checked})}/> show g′
          <InfoButton text="Show g′(x,T). Equality of slopes at the tie‑line endpoints ↔ equal chemical potentials."/>
        </label>
        <label style={{marginLeft:8, display:'inline-flex', alignItems:'center', gap:6}}>
          <input type="checkbox" checked={showDerivs.g2} onChange={e=>onShowDerivs({...showDerivs, g2:e.target.checked})}/> show g″
          <InfoButton text="Show g″(x,T). Spinodal condition g″=0; we require g″≥0 at endpoints (local stability)."/>
        </label>
      </div>

      <div style={{borderLeft:'1px solid #ddd', paddingLeft:12}}>
        <strong>Debug</strong>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showMarkers} onChange={e=>onDebug && onDebug({showMarkers:e.target.checked, showTieLines: debug?.showTieLines ?? true})}/> markers</label>
        <label style={{marginLeft:8}}><input type="checkbox" checked={!!debug?.showTieLines} onChange={e=>onDebug && onDebug({showMarkers: debug?.showMarkers ?? false, showTieLines:e.target.checked})}/> tie‑line(s) at T</label>
      </div>
    </div>
  );
}
