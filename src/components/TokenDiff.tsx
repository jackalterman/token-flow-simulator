
import React, { useState, useEffect } from 'react';
import { jwtService } from '../services/jwtService';
import { ScaleIcon } from './icons';

const TokenDiff: React.FC = () => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [diff, setDiff] = useState<React.ReactNode>(null);

  useEffect(() => {
    compareTokens();
  }, [tokenA, tokenB]);

  const compareTokens = () => {
    if (!tokenA && !tokenB) {
        setDiff(<div className="text-slate-400 text-center py-8">Paste two tokens to see the difference.</div>);
        return;
    }

    const decodedA = jwtService.decode(tokenA);
    const decodedB = jwtService.decode(tokenB);

    const payloadA = decodedA?.payload || {};
    const payloadB = decodedB?.payload || {};

    const allKeys = Array.from(new Set([...Object.keys(payloadA), ...Object.keys(payloadB)]));

    setDiff(
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Claim</th>
                        <th className="px-4 py-3">Token A</th>
                        <th className="px-4 py-3 rounded-tr-lg">Token B</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {allKeys.map(key => {
                        const valA = JSON.stringify(payloadA[key]);
                        const valB = JSON.stringify(payloadB[key]);
                        const isDiff = valA !== valB;
                        
                        return (
                            <tr key={key} className={isDiff ? 'bg-amber-50' : 'bg-white'}>
                                <td className="px-4 py-2 font-mono font-semibold text-slate-700">{key}</td>
                                <td className={`px-4 py-2 font-mono break-all ${!valA ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                                    {valA || 'undefined'}
                                </td>
                                <td className={`px-4 py-2 font-mono break-all ${!valB ? 'text-slate-300 italic' : ''} ${isDiff ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                                    {valB || 'undefined'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Token Diff</h2>
        <p className="text-slate-600">Compare the payloads of two JWTs to identify changes in claims.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Token A (Baseline)</label>
              <textarea 
                rows={5}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs font-mono"
                placeholder="Paste first JWT..."
                value={tokenA}
                onChange={e => setTokenA(e.target.value)}
              />
          </div>
          <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Token B (Comparison)</label>
              <textarea 
                rows={5}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs font-mono"
                placeholder="Paste second JWT..."
                value={tokenB}
                onChange={e => setTokenB(e.target.value)}
              />
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-slate-600">
              <ScaleIcon className="h-5 w-5" />
              <span className="font-bold text-sm">Comparison Result</span>
          </div>
          {diff}
      </div>
    </div>
  );
};

export default TokenDiff;
