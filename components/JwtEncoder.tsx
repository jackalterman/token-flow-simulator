import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';
import { jwtService } from '../services/jwtService';
import { SendIcon, KeyIcon } from './icons';
import type { DecoderData } from '../types';

interface JwtEncoderProps {
  onSendToDecoder: (data: DecoderData) => void;
}

const defaultPayload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

const JwtEncoder: React.FC<JwtEncoderProps> = ({ onSendToDecoder }) => {
  const [alg, setAlg] = useState('HS256');
  const [header, setHeader] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2));
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const headerObj = JSON.parse(header);
      headerObj.alg = alg;
      setHeader(JSON.stringify(headerObj, null, 2));
    } catch (e) {
      // Ignore parsing errors while typing
    }
  }, [alg]);

  const handleGenerateKeys = async () => {
    const keys = await jwtService.generateRsaKeyPair();
    setPrivateKey(keys.privateKey);
    setPublicKey(keys.publicKey);
  };

  const handleGenerate = async () => {
    setError('');
    setGeneratedToken('');
    try {
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);
      const key = alg === 'HS256' ? secret : privateKey;
      if (!key) {
        setError(alg === 'HS256' ? 'Secret cannot be empty.' : 'Private key cannot be empty.');
        return;
      }
      const token = await jwtService.sign(headerObj, payloadObj, key);
      setGeneratedToken(token);
    } catch (e: any) {
      setError(`Failed to generate token: ${e.message}`);
      console.error(e);
    }
  };

  const handleSend = () => {
    if (generatedToken) {
        onSendToDecoder({
            token: generatedToken,
            key: alg === 'HS256' ? secret : publicKey,
        });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">JWT Encoder</h2>
        <p className="text-slate-600 mb-6">Create a new JWT by defining its algorithm, header, payload, and the key/secret for signing.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="jwt-alg" className="block text-sm font-medium text-slate-700">Algorithm</label>
            <select
              id="jwt-alg"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              value={alg}
              onChange={(e) => setAlg(e.target.value)}
            >
              <option value="HS256">HS256 (Symmetric)</option>
              <option value="RS256">RS256 (Asymmetric)</option>
            </select>
          </div>
          <div>
            <label htmlFor="jwt-header" className="block text-sm font-medium text-slate-700">Header</label>
            <textarea
              id="jwt-header"
              rows={4}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="jwt-payload" className="block text-sm font-medium text-slate-700">Payload</label>
            <textarea
              id="jwt-payload"
              rows={8}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>

          {alg === 'HS256' ? (
            <div>
              <label htmlFor="jwt-secret" className="block text-sm font-medium text-slate-700">HMAC Secret</label>
              <input
                id="jwt-secret"
                type="text"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGenerateKeys}
                className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <KeyIcon className="h-5 w-5" /> Generate New RSA Key Pair
              </button>
              <div>
                <label htmlFor="jwt-private-key" className="block text-sm font-medium text-slate-700">Private Key</label>
                <textarea
                  id="jwt-private-key"
                  rows={6}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono"
                  value={privateKey}
                  placeholder="Paste your PEM private key here or generate one."
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="jwt-public-key" className="block text-sm font-medium text-slate-700">Public Key</label>
                <textarea
                  id="jwt-public-key"
                  rows={4}
                  readOnly
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono bg-slate-100"
                  value={publicKey}
                  placeholder="(Generated automatically)"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleGenerate}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Generate Token
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Generated Token</h3>
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2 text-sm">{error}</p>}
        {generatedToken ? (
            <>
                <CodeBlock content={generatedToken} />
                <button
                    onClick={handleSend}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    <SendIcon className="h-5 w-5" />
                    Send to Decoder
                </button>
            </>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-lg mt-2">
            <p className="text-slate-500">Your generated token will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtEncoder;
