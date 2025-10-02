import React from 'react';

export default function Residuals(props: { residuals: number[] }) {
  const { residuals } = props;
  return (
    <div>
      <strong>Residuals</strong>
      {residuals.length === 0 ? <span style={{marginLeft:8, color:'#666'}}>Converged or not tracked</span> :
        <span style={{marginLeft:8}}>{residuals.map((r,i)=>`${i}:${r.toExponential(2)}`).join('  ')}</span>}
    </div>
  );
}

