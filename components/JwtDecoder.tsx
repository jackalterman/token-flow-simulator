import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';
import JsonViewer from './JsonViewer';
import { jwtService } from '../services/jwtService';
import type { DecodedJwt, VerificationResult, DecoderData } from '../types';
import { CheckIcon, AlertTriangleIcon } from './icons';

interface JwtDecoderProps {
  initialData: DecoderData | null;
  onDataHandled: () => void;
}

const JwtDecoder: React.FC<JwtDecoderProps> = ({ initialData, onDataHandled }) => {
  const [token, setToken] = useState('');
  const [key, setKey] = useState('your-256-bit-secret');
  const [audience, setAudience] = useState('');
  const [issuer, setIssuer] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (initialData) {
      setToken(initialData.token || '');
      setKey(initialData.key || 'your-256-bit-secret');
      setAudience(initialData.audience || '');
      setIssuer(initialData.issuer || '');
      onDataHandled();
    }
  }, [initialData, onDataHandled]);

  useEffect(() => {
    const decodedToken = jwtService.decode(token);
    setDecoded(decodedToken);
    setVerification(null);
  }, [token]);

  const handleVerify = async () => {
    if (token) {
      const options: { audience?: string; issuer?: string } = {};
      if (audience.trim()) options.audience = audience.trim();
      if (issuer.trim()) options.issuer = issuer.trim();
      const result = await jwtService.verify(token, key, options);
      setVerification(result);
    }
  };

  const renderVerificationStatus = () => {
    if (!verification) return null;
    if (verification.isValid) {
      return (
        <div className="p-3 my-2 bg-green-100 text-green-800 rounded-md flex items-start space-x-2">
          <CheckIcon className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">Verification Successful</p>
            <p className="text-sm">{verification.reason}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-3 my-2 bg-red-100 text-red-800 rounded-md flex items-start space-x-2">
        <AlertTriangleIcon className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold">Verification Failed</p>
          <p className="text-sm">{verification.reason}</p>
        </div>
      </div>
    );
  };

  const isRsa = decoded?.header?.alg === 'RS256';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">JWT Decoder & Verifier</h2>
        <p className="text-slate-600 mb-6">Paste a JWT to see its decoded header and payload. Provide a secret or public key to verify its signature and claims.</p>

        <div>
          <label htmlFor="jwt-input" className="block text-sm font-medium text-slate-700">JWT</label>
          <textarea
            id="jwt-input"
            rows={8}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
            placeholder="Paste your JWT here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="jwt-verify-key" className="block text-sm font-medium text-slate-700">
            {isRsa ? 'RSA Public Key (PEM format)' : 'HMAC Secret'}
          </label>
          {isRsa ? (
             <textarea
              id="jwt-verify-key"
              rows={5}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          ) : (
            <input
              id="jwt-verify-key"
              type="text"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="jwt-verify-audience" className="block text-sm font-medium text-slate-700">Expected Audience <span className="text-slate-500 font-normal">(aud)</span></label>
          <input
            id="jwt-verify-audience"
            type="text"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            placeholder="(Optional) e.g. https://api.myapp.com"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="jwt-verify-issuer" className="block text-sm font-medium text-slate-700">Expected Issuer <span className="text-slate-500 font-normal">(iss)</span></label>
          <input
            id="jwt-verify-issuer"
            type="text"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            placeholder="(Optional) e.g. https://auth.myapp.com"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={!token}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          Verify Token
        </button>
        {renderVerificationStatus()}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Decoded Token</h3>
        {decoded ? (
          <div className="space-y-4 mt-2">
            <div>
              <h4 className="font-medium text-slate-600">Header</h4>
              <JsonViewer data={decoded.header} />
            </div>
            <div>
              <h4 className="font-medium text-slate-600">Payload</h4>
              <JsonViewer data={decoded.payload} />
            </div>
             <div>
              <h4 className="font-medium text-slate-600">Signature</h4>
              <CodeBlock content={decoded.signature} language="text" />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-lg mt-2">
            <p className="text-slate-500">Decoded token parts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtDecoder;
