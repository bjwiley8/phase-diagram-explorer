import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Traces } from '../solver/sweep';

type TP = { T:number; x:number };

function splitBranches(points: TP[]) {
  // Bucket by T (string key with small rounding to avoid FP drift)
  const buckets = new Map<string, {T:number; xs:number[]}>();
  for (const p of points) {
    const key = p.T.toFixed(6);
    const b = buckets.get(key) ?? { T: p.T, xs: [] };
    b.xs.push(p.x);
    buckets.set(key, b);
  }
  const rows = Array.from(buckets.values()).sort((a,b)=>a.T-b.T);
  const left: TP[] = []; const right: TP[] = [];
  for (const r of rows) {
    r.xs.sort((a,b)=>a-b);
    if (r.xs.length === 1) {
      left.push({ T:r.T, x:r.xs[0] });
      right.push({ T:r.T, x: Number.NaN });
    } else {
      left.push({ T:r.T, x:r.xs[0] });
      right.push({ T:r.T, x:r.xs[r.xs.length-1] });
    }
  }
  return { left, right };
}

function toSegments(arr: TP[]): { x:number[]; y:number[] }[] {
  const segs: { x:number[]; y:number[] }[] = [];
  let curX: number[] = [];
  let curY: number[] = [];
  for (const p of arr) {
    if (!isFinite(p.x)) {
      if (curX.length > 0) { segs.push({ x: curX, y: curY }); curX = []; curY = []; }
      continue;
    }
    curX.push(p.x); curY.push(p.T);
  }
  if (curX.length > 0) segs.push({ x: curX, y: curY });
  return segs;
}

function usePlotly(id: string, data: any[], layout: any) {
  React.useEffect(() => { Plotly.newPlot(id, data as any, layout as any, {displayModeBar: false}); return () => { Plotly.purge(id); }; }, [id, JSON.stringify(data), JSON.stringify(layout)]);
}

export default function PhasePlot(props: { T: number; eqs: {xA:number;xB:number}[]; traces: Traces; debug?: {showMarkers:boolean; showTieLines:boolean} }) {
  const { T, eqs, traces, debug } = props;
  const liq = traces.liq; const sol = traces.sol;
  const L = splitBranches(liq);
  const S = splitBranches(sol);
  // Prepare arrays with nulls where a branch is absent, to avoid horizontal stitches
  const data: any[] = [];
  // Build segment traces to prevent unintended horizontal connections
  toSegments(S.left).forEach((seg, i)=> data.push({ x: seg.x, y: seg.y, name: i===0? 'solidus (left)' : undefined, type:'scatter', mode:'lines', line:{ color:'#d62728' }, connectgaps:false }));
  toSegments(S.right).forEach((seg, i)=> data.push({ x: seg.x, y: seg.y, name: i===0? 'solidus (right)' : undefined, type:'scatter', mode:'lines', line:{ color:'#d62728', dash:'dot' }, connectgaps:false }));
  toSegments(L.left).forEach((seg, i)=> data.push({ x: seg.x, y: seg.y, name: i===0? 'liquidus (left)' : undefined, type:'scatter', mode:'lines', line:{ color:'#1f77b4' }, connectgaps:false }));
  toSegments(L.right).forEach((seg, i)=> data.push({ x: seg.x, y: seg.y, name: i===0? 'liquidus (right)' : undefined, type:'scatter', mode:'lines', line:{ color:'#1f77b4', dash:'dot' }, connectgaps:false }));

  if (debug?.showTieLines && eqs.length) {
    eqs.forEach((eq,i)=>{
      data.push({ x:[eq.xA, eq.xB], y:[T, T], name:`tie-line ${i+1} at T`, type:'scatter', mode:'lines', line:{ color:'#777', dash: i? 'dot':'dash'}, showlegend:false });
    });
  }
  if (debug?.showMarkers && eqs.length) {
    eqs.forEach((eq,i)=>{
      data.push({ x:[eq.xA], y:[T], name:`x_liq ${i+1}`, type:'scatter', mode:'markers', marker:{ color:'#1f77b4', size:8 } });
      data.push({ x:[eq.xB], y:[T], name:`x_sol ${i+1}`, type:'scatter', mode:'markers', marker:{ color:'#d62728', size:8 } });
    });
  }

  const layout: any = {
    title: 'Phase diagram (T vs x_B)',
    margin: { l:60, r:20, t:40, b:45 },
    xaxis: { title: 'x_B', range:[0,1] },
    yaxis: { title: 'T (K)' },
    height: 420,
    legend: { orientation: 'v', x: 1.02, y: 1 }
  };

  usePlotly('phaseplot', data, layout);
  return <div id='phaseplot' />;
}
