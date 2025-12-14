
import React, { useState, useEffect } from 'react';
import { jwtService } from '../services/jwtService';
import CodeBlock from './CodeBlock';
import { LockClosedIcon, RefreshIcon } from './icons';

const PkceGenerator: React.FC = () => {
  const [verifier, setVerifier] = useState('');
  const [challenge, setChallenge] = useState('');
  const [method, setMethod] = useState('S256');

  const generateVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const randomStr = jwtService.base64UrlEncode(array);
    setVerifier(randomStr);
  };

  useEffect(() => {
    generateVerifier();
  }, []);

  useEffect(() => {
    const calculateChallenge = async () => {
      if (!verifier) {
          setChallenge('');
          return;
      }
      if (method === 'plain') {
        setChallenge(verifier);
      } else {
        const hash = await jwtService.sha256(verifier);
        const b64 = jwtService.base64UrlEncode(hash);
        setChallenge(b64);
      }
    };
    calculateChallenge();
  }, [verifier, method]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">PKCE Generator</h2>
        <p className="text-slate-600 mb-6">
          Proof Key for Code Exchange (PKCE) prevents authorization code interception attacks. 
          It is required for mobile apps and Single Page Apps (SPAs).
        </p>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-700">Code Verifier</label>
                <button onClick={generateVerifier} className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1">
                    <RefreshIcon className="h-3 w-3" /> Generate New
                </button>
            </div>
            <input 
                type="text" 
                value={verifier} 
                onChange={(e) => setVerifier(e.target.value)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">
                A cryptographically random string (43-128 chars) created by the client.
            </p>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Method</label>
             <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            >
                <option value="S256">S256 (SHA-256 Hash) - Recommended</option>
                <option value="plain">plain (Not Recommended)</option>
             </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <h3 className="text-lg font-bold text-slate-900">Output</h3>
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <LockClosedIcon className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Code Challenge</h4>
                    <p className="text-xs text-slate-500">Send this in the Authorize Request</p>
                </div>
            </div>
            <CodeBlock content={challenge} />
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                <p className="font-semibold">How it works:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li><strong>Authorize Request:</strong> Client sends <code>code_challenge={method === 'S256' ? 'BASE64URL(SHA256(verifier))' : 'verifier'}</code>.</li>
                    <li><strong>Token Request:</strong> Client sends raw <code>code_verifier</code>.</li>
                    <li><strong>Validation:</strong> Server re-calculates the challenge from the verifier and ensures it matches.</li>
                </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PkceGenerator;
