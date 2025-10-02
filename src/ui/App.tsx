import React, { useMemo, useState, useEffect } from 'react';
import { ABParams, defaultAB } from '../models/common';
import { makePeltonAB } from '../models/systems/peltonAB';
import Controls from './Controls';
import GXPlot from './GXPlot';
import PhasePlot from './PhasePlot';
import Residuals from './Residuals';
import { solveCommonTangent, isStableContact } from '../solver/tangent';
import { sweepTemperature } from '../solver/sweep';

export default function App() {
  const [params, setParams] = useState<ABParams>(defaultAB);
  const [T, setT] = useState<number>(1200);
  const [showDerivs, setShowDerivs] = useState({ g1: false, g2: false });
  const [sweep, setSweep] = useState({ Tmin: 900, Tmax: 1400, dT: 10 });
  const [residuals, setResiduals] = useState<number[]>([]);

  const model = useMemo(() => makePeltonAB(params), [params]);

  const eq = useMemo(() => {
    const r = solveCommonTangent(model, 'liq', 'sol', T, 0.2, 0.8);
    if (!r.ok) return null;
    if (!isStableContact(model, 'liq', 'sol', T, r.xA, r.xB)) return null;
    return r;
  }, [model, T]);

  const traces = useMemo(() => sweepTemperature(model, [['liq','sol']], sweep.Tmin, sweep.Tmax, sweep.dT), [model, sweep]);

  // Simple residual logger over iterations (for the Residuals panel); mock values for now
  useEffect(() => { setResiduals([]); }, [T, params]);

  return (
    <div className="app" style={{height:'100%', display:'grid', gridTemplateRows:'auto 1fr'}}>
      <Controls
        T={T}
        onT={setT}
        params={params}
        onParams={setParams}
        sweep={sweep}
        onSweep={setSweep}
        showDerivs={showDerivs}
        onShowDerivs={setShowDerivs}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'8px'}}>
        <GXPlot model={model} T={T} eq={eq} showDerivs={showDerivs} />
        <PhasePlot T={T} eq={eq} traces={traces} />
      </div>
      <div style={{padding:'8px'}}>
        <Residuals residuals={residuals} />
      </div>
    </div>
  );
}

