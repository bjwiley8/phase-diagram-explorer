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
  const [debug, setDebug] = useState({ showMarkers: false, showTieLines: true });

  const model = useMemo(() => makePeltonAB(params), [params]);

  const eqs = useMemo(() => {
    const sols: {xA:number;xB:number}[] = [];
    const r1 = solveCommonTangent(model, 'liq', 'sol', T, 0.2, 0.8);
    if (r1.ok && isStableContact(model, 'liq','sol', T, r1.xA, r1.xB)) sols.push({xA:r1.xA, xB:r1.xB});
    const r2 = solveCommonTangent(model, 'liq', 'sol', T, 0.8, 0.2);
    if (r2.ok && isStableContact(model, 'liq','sol', T, r2.xA, r2.xB)) {
      if (!sols.some(s=>Math.abs(s.xA-r2.xA)<1e-4 && Math.abs(s.xB-r2.xB)<1e-4)) sols.push({xA:r2.xA, xB:r2.xB});
    }
    return sols;
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
        debug={debug}
        onDebug={setDebug}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'8px'}}>
        <GXPlot model={model} T={T} eqs={eqs} showDerivs={showDerivs} />
        <PhasePlot T={T} eqs={eqs} traces={traces} debug={debug} />
      </div>
      <div style={{padding:'8px'}}>
        <Residuals residuals={residuals} />
      </div>
    </div>
  );
}
