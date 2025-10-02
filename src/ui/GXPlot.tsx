import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { linspace } from '../models/common';
import { ModelAPI } from '../models/systems/peltonAB';
import { tangentLine } from '../solver/tangent';

function usePlotly(id: string, data: any[], layout: any) {
  React.useEffect(() => { Plotly.newPlot(id, data as any, layout as any, {displayModeBar: false}); return () => { Plotly.purge(id); }; }, [id, JSON.stringify(data), JSON.stringify(layout)]);
}

export default function GXPlot(props: { model: ModelAPI; T: number; eqs: {xA:number;xB:number}[]; showDerivs:{g1:boolean;g2:boolean} }) {
  const { model, T, eqs, showDerivs } = props;
  const xs = useMemo(()=>linspace(601, 1e-6, 1-1e-6),[]);
  const gliq = xs.map(x => model.g('liq', x, T));
  const gsol = xs.map(x => model.g('sol', x, T));
  const g1liq = showDerivs.g1 ? xs.map(x => model.g1('liq', x, T)) : [];
  const g1sol = showDerivs.g1 ? xs.map(x => model.g1('sol', x, T)) : [];
  const g2liq = showDerivs.g2 ? xs.map(x => model.g2('liq', x, T)) : [];
  const g2sol = showDerivs.g2 ? xs.map(x => model.g2('sol', x, T)) : [];

  const tangents = useMemo(() => {
    return eqs.map(eq => ({...tangentLine(model,'liq', eq.xA, T)}));
  }, [eqs, model, T]);

  const data: any[] = [
    { x: xs, y: gliq, name: 'g_liq', type: 'scatter', mode: 'lines', line: { color: '#1f77b4' } },
    { x: xs, y: gsol, name: 'g_sol', type: 'scatter', mode: 'lines', line: { color: '#d62728' } },
  ];

  if (showDerivs.g1) {
    data.push({ x: xs, y: g1liq, name: "g'_liq", yaxis: 'y2', type:'scatter', mode:'lines', line:{ color:'#1f77b4', dash:'dash'} });
    data.push({ x: xs, y: g1sol, name: "g'_sol", yaxis: 'y2', type:'scatter', mode:'lines', line:{ color:'#d62728', dash:'dash'} });
  }
  if (showDerivs.g2) {
    data.push({ x: xs, y: g2liq, name: "g''_liq", yaxis: 'y3', type:'scatter', mode:'lines', line:{ color:'#1f77b4', dash:'dot'} });
    data.push({ x: xs, y: g2sol, name: "g''_sol", yaxis: 'y3', type:'scatter', mode:'lines', line:{ color:'#d62728', dash:'dot'} });
  }
  if (eqs.length) {
    tangents.forEach((tan, i) => {
      const ty = xs.map(x => tan.m * x + tan.b);
      data.push({ x: xs, y: ty, name: `tangent ${i+1}`,'type':'scatter', mode:'lines', line:{ color:'#444', width:1, dash: i? 'dot':'solid' } });
      const eq = eqs[i];
      data.push({ x: [eq.xA, eq.xB], y: [model.g('liq', eq.xA, T), model.g('sol', eq.xB, T)], name: `tie-line ${i+1}`, type:'scatter', mode:'lines', line:{ color:'#777', dash: i? 'dot':'dash' }, showlegend:false });
      data.push({ x: [eq.xA], y: [model.g('liq', eq.xA, T)], name: `x_liq ${i+1}`, type:'scatter', mode:'markers', marker:{ color:'#1f77b4', size:8 } });
      data.push({ x: [eq.xB], y: [model.g('sol', eq.xB, T)], name: `x_sol ${i+1}`, type:'scatter', mode:'markers', marker:{ color:'#d62728', size:8 } });
    });
  }

  const layout: any = {
    title: `g(x,T) at T=${T.toFixed(1)} K`,
    margin: { l:60, r:20, t:40, b:45 },
    xaxis: { title: 'x_B' },
    yaxis: { title: 'Free energy (J/mol)' },
    yaxis2: { title: "g' (J/mol)", overlaying:'y', side:'right', showgrid:false, visible: showDerivs.g1 },
    yaxis3: { title: "g'' (J/mol)", overlaying:'y', side:'right', position: 1.0, showgrid:false, visible: showDerivs.g2 },
    legend: { orientation: 'h' },
    height: 420
  };

  usePlotly('gxplot', data, layout);
  return <div id='gxplot' />;
}
