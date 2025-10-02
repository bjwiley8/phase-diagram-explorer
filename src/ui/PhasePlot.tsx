import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Traces } from '../solver/sweep';

function usePlotly(id: string, data: any[], layout: any) {
  React.useEffect(() => { Plotly.newPlot(id, data as any, layout as any, {displayModeBar: false}); return () => { Plotly.purge(id); }; }, [id, JSON.stringify(data), JSON.stringify(layout)]);
}

export default function PhasePlot(props: { T: number; eq: {xA:number;xB:number}|null; traces: Traces }) {
  const { T, eq, traces } = props;
  const liq = traces.liq; const sol = traces.sol;
  const data: any[] = [
    { x: sol.map(p=>p.x), y: sol.map(p=>p.T), name: 'solidus', type: 'scatter', mode: 'lines', line:{ color:'#d62728' } },
    { x: liq.map(p=>p.x), y: liq.map(p=>p.T), name: 'liquidus', type: 'scatter', mode: 'lines', line:{ color:'#1f77b4' } }
  ];

  if (eq) {
    data.push({ x:[eq.xA, eq.xB], y:[T, T], name:'tie-line at T', type:'scatter', mode:'lines', line:{ color:'#777', dash:'dash'}, showlegend:false });
    data.push({ x:[eq.xA], y:[T], name:'x_liq', type:'scatter', mode:'markers', marker:{ color:'#1f77b4', size:8 } });
    data.push({ x:[eq.xB], y:[T], name:'x_sol', type:'scatter', mode:'markers', marker:{ color:'#d62728', size:8 } });
  }

  const layout: any = {
    title: 'Phase diagram (T vs x_B)',
    margin: { l:60, r:20, t:40, b:45 },
    xaxis: { title: 'x_B', range:[0,1] },
    yaxis: { title: 'T (K)' },
    height: 420
  };

  usePlotly('phaseplot', data, layout);
  return <div id='phaseplot' />;
}
