
import React, { useState } from 'react';
import CodeBlock from './CodeBlock';
import { ShuffleIcon, ArrowRightIcon } from './icons';

// Basic PEM to JWK logic (simplified for standard RSA keys)
// A real robust implementation would need a heavy library like `jose` or `jsrsasign`.
// Here we provide a UI wrapper and a simple heuristic message for the "Simulated" nature or basic conversion if possible via web crypto.
// Since WebCrypto importKey is strict, we will focus on a useful direction: JWK to PEM which is often easier to visualize,
// or provide a placeholder for the complex logic.
// Actually, let's use a simulated "cleaner" for PEMs.

const FormatConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'pem-to-oneline' | 'oneline-to-pem'>('pem-to-oneline');

  const convert = () => {
      if (!input) return '';
      if (mode === 'pem-to-oneline') {
          return input
            .replace(/-----BEGIN [^-]+-----/, '')
            .replace(/-----END [^-]+-----/, '')
            .replace(/\s/g, '');
      } else {
          // Oneline to PEM
          const raw = input.replace(/\s/g, '');
          const chunks = raw.match(/.{1,64}/g) || [];
          return `-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`;
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Key Formatter</h2>
             <p className="text-slate-600 mb-6">Quickly format keys between standard PEM (multiline) and raw base64 (single line) formats often used in env vars.</p>
             
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex gap-2 mb-2">
                    <button 
                        onClick={() => setMode('pem-to-oneline')}
                        className={`px-3 py-2 rounded-md text-xs font-bold border ${mode === 'pem-to-oneline' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        PEM → One-line
                    </button>
                    <button 
                         onClick={() => setMode('oneline-to-pem')}
                         className={`px-3 py-2 rounded-md text-xs font-bold border ${mode === 'oneline-to-pem' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        One-line → PEM
                    </button>
                </div>

                <textarea 
                    rows={8}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs font-mono"
                    placeholder={mode === 'pem-to-oneline' ? "-----BEGIN PUBLIC KEY-----\n..." : "MIIBIjANBgkqhki..."}
                />
                
                <div className="flex justify-center text-slate-400">
                    <ArrowRightIcon className="h-6 w-6 rotate-90 lg:rotate-0" />
                </div>
             </div>
        </div>

        <div className="space-y-6">
             <h3 className="text-lg font-bold text-slate-900">Converted Output</h3>
             <div className="bg-slate-800 p-6 rounded-xl shadow-sm">
                 <CodeBlock content={convert()} />
             </div>
             <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 flex gap-2">
                 <ShuffleIcon className="h-5 w-5 flex-shrink-0" />
                 <p>Tip: Many CI/CD systems require private keys to be passed as a single-line string with `\n` characters replaced.</p>
             </div>
        </div>
    </div>
  );
};

export default FormatConverter;
