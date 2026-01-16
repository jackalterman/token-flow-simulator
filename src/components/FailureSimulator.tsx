import React, { useState, useCallback, useEffect } from 'react';
import { jwtService } from '../services/jwtService';
import type { VerificationResult, DecoderData } from '../types';
import CodeBlock from './CodeBlock';
import { AlertTriangleIcon, CheckIcon, InfoIcon, SendIcon } from './icons';

interface ScenarioResult {
    token: string;
    verification: VerificationResult;
    details: React.ReactNode;
    decoderData: DecoderData;
}

interface Scenario {
  title: string;
  description: string;
  run: () => Promise<ScenarioResult>;
}

interface FailureSimulatorProps {
  onSendToDecoder: (data: DecoderData) => void;
}

const FailureSimulator: React.FC<FailureSimulatorProps> = ({ onSendToDecoder }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const scenarios: Scenario[] = [
    {
      title: 'Invalid Signature',
      description: 'A token is signed with one secret but verified with another. This simulates a tampered token or a misconfigured verifier.',
      run: async () => {
        const correctSecret = 'secret-key-1';
        const wrongSecret = 'secret-key-2';
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = { sub: 'user-123', admin: false, iat: Math.floor(Date.now() / 1000) };
        const token = await jwtService.sign(header, payload, correctSecret);
        const verification = await jwtService.verify(token, wrongSecret);
        const details = (
          <>
            <p>Token was signed with secret: <code className="font-mono bg-slate-200 px-1 rounded">{correctSecret}</code></p>
            <p>Verification was attempted with secret: <code className="font-mono bg-slate-200 px-1 rounded">{wrongSecret}</code></p>
            <p className="mt-2 text-xs text-slate-500">To reproduce, use the generated token in the Decode tab with the <strong>wrong secret</strong>. Using the <strong>correct secret</strong> will result in a valid signature.</p>
          </>
        );
        return { token, verification, details, decoderData: { token, key: wrongSecret } };
      },
    },
    {
      title: 'Expired Token',
      description: 'A token with an "exp" (expiration time) claim in the past is verified. This is the most common reason for token rejection.',
      run: async () => {
        const secret = 'shared-secret';
        const header = { alg: 'HS256', typ: 'JWT' };
        const exp = Math.floor(Date.now() / 1000) - 60; // 60 seconds ago
        const payload = { sub: 'user-123', iat: exp - 3600, exp: exp };
        const token = await jwtService.sign(header, payload, secret);
        const verification = await jwtService.verify(token, secret);
        const details = (
            <>
              <p>Token was signed with secret: <code className="font-mono bg-slate-200 px-1 rounded">{secret}</code></p>
              <p>Token expired at: <code className="font-mono bg-slate-200 px-1 rounded">{new Date(exp * 1000).toLocaleString()}</code>. Current time is past this value.</p>
              <p className="mt-2 text-xs text-slate-500">To reproduce, use the generated token and secret in the Decode tab. The signature will be valid, but the expiration check will fail.</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: secret } };
      },
    },
    {
      title: 'Wrong Audience',
      description: 'A token intended for a specific "aud" (audience) is used at a different service. The service should reject it.',
      run: async () => {
        const secret = 'shared-secret';
        const header = { alg: 'HS256', typ: 'JWT' };
        const tokenAud = 'https://api.service-a.com';
        const expectedAud = 'https://api.service-b.com';
        const payload = { sub: 'user-123', aud: tokenAud, iat: Math.floor(Date.now() / 1000) };
        const token = await jwtService.sign(header, payload, secret);
        const verification = await jwtService.verify(token, secret, { audience: expectedAud });
        const details = (
            <>
                <p>Token was signed with secret: <code className="font-mono bg-slate-200 px-1 rounded">{secret}</code></p>
                <p>Token was issued for audience (aud): <code className="font-mono bg-slate-200 px-1 rounded">{tokenAud}</code></p>
                <p>Verifier expected audience: <code className="font-mono bg-slate-200 px-1 rounded">{expectedAud}</code></p>
                <p className="mt-2 text-xs text-slate-500">To reproduce, use the token and secret in the Decode tab, and enter the <strong>expected audience</strong> in its field.</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: secret, audience: expectedAud } };
      },
    },
     {
      title: 'Token Not Yet Valid',
      description: 'A token with an "nbf" (not before) claim in the future is verified. The token should be rejected until the specified time.',
      run: async () => {
        const secret = 'shared-secret';
        const header = { alg: 'HS256', typ: 'JWT' };
        const nbf = Math.floor(Date.now() / 1000) + 300; // 5 minutes in the future
        const payload = { sub: 'user-123', iat: Math.floor(Date.now() / 1000), nbf: nbf };
        const token = await jwtService.sign(header, payload, secret);
        const verification = await jwtService.verify(token, secret);
        const details = (
            <>
              <p>Token was signed with secret: <code className="font-mono bg-slate-200 px-1 rounded">{secret}</code></p>
              <p>Token is not valid before (nbf): <code className="font-mono bg-slate-200 px-1 rounded">{new Date(nbf * 1000).toLocaleString()}</code>.</p>
              <p className="mt-2 text-xs text-slate-500">To reproduce, use the generated token and secret in the Decode tab. The signature will be valid, but the 'not before' check will fail.</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: secret } };
      },
    },
    {
      title: 'Wrong Issuer',
      description: 'A token with a specific "iss" (issuer) claim is verified by a system expecting a different issuer.',
      run: async () => {
        const secret = 'shared-secret';
        const header = { alg: 'HS256', typ: 'JWT' };
        const tokenIss = 'https://auth.staging.com';
        const expectedIss = 'https://auth.production.com';
        const payload = { sub: 'user-456', iss: tokenIss, iat: Math.floor(Date.now() / 1000) };
        const token = await jwtService.sign(header, payload, secret);
        const verification = await jwtService.verify(token, secret, { issuer: expectedIss });
        const details = (
            <>
                <p>Token was issued by (iss): <code className="font-mono bg-slate-200 px-1 rounded">{tokenIss}</code></p>
                <p>Verifier expected issuer: <code className="font-mono bg-slate-200 px-1 rounded">{expectedIss}</code></p>
                <p className="mt-2 text-xs text-slate-500">To reproduce, use the token and secret in the Decode tab, and enter the <strong>expected issuer</strong> in its field.</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: secret, issuer: expectedIss } };
      },
    },
    {
      title: 'RS256 Invalid Signature',
      description: 'A token is signed with one RSA private key, but verification is attempted with a different, incorrect public key.',
      run: async () => {
        const keyPair1 = await jwtService.generateRsaKeyPair();
        const keyPair2 = await jwtService.generateRsaKeyPair();
        const header = { alg: 'RS256', typ: 'JWT' };
        const payload = { sub: 'user-789', roles: ['reader'], iat: Math.floor(Date.now() / 1000) };
        const token = await jwtService.sign(header, payload, keyPair1.privateKey);
        const verification = await jwtService.verify(token, keyPair2.publicKey);
        const details = (
            <>
                <p>Token was signed with the private key of <strong>Key Pair 1</strong>.</p>
                <p>Verification was attempted with the public key of <strong>Key Pair 2</strong>.</p>
                <p className="mt-2 text-xs text-slate-500">To reproduce, send this to the decoder. The public key field will be pre-filled with the incorrect key. To see it succeed, replace it with the correct public key (available in the encoder).</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: keyPair2.publicKey } };
      },
    },
     {
      title: 'Algorithm "None" Attack',
      description: 'A malicious token is crafted with `alg: "none"`. A secure verifier should always reject such tokens.',
      run: async () => {
        // This is a special case. We manually create the token because a secure library shouldn't sign with `alg: "none"`.
        function base64UrlEncode(data: string): string {
            return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        const header = { alg: 'none', typ: 'JWT' };
        const payload = { sub: 'user-123', admin: true, iat: Math.floor(Date.now() / 1000) }; // Attacker tries to elevate privileges
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));
        const token = `${encodedHeader}.${encodedPayload}.`; // Note the trailing dot for the empty signature part

        // Our verifier is secure and will reject this.
        const verification = await jwtService.verify(token, 'any-key-is-ignored');
        const details = (
            <>
              <p>The token's header specifies algorithm <code className="font-mono bg-slate-200 px-1 rounded">"none"</code> and has no signature.</p>
              <p>This is a classic attack. Some insecure libraries would see "none" and validate the token without checking any signature, allowing privilege escalation.</p>
              <p className="mt-2 text-xs text-slate-500">This simulator's verifier correctly identifies this as an unsupported (and insecure) algorithm and rejects the token, as it should.</p>
            </>
        );
        return { token, verification, details, decoderData: { token, key: '' } };
      },
    }
  ];

  const handleRunScenario = useCallback(async (scenario: Scenario) => {
    setIsLoading(true);
    setActiveScenario(scenario.title);
    setResult(null);
    const scenarioResult = await scenario.run();
    setResult(scenarioResult);
    setIsLoading(false);
  }, []);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleRunScenario(scenarios[0]);
  }, []);

  return (
    <div>
       <h2 className="text-2xl font-bold mb-2">Failure Scenario Simulator</h2>
       <p className="text-slate-600 mb-6">Select a scenario to generate a token and see why its verification fails. This helps in understanding common token validation checks.</p>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-3">Choose a scenario:</h3>
            <div className="space-y-2">
                {scenarios.map((s) => (
                    <button
                    key={s.title}
                    onClick={() => handleRunScenario(s)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${activeScenario === s.title ? 'bg-sky-100 border-sky-500 shadow' : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50'}`}
                    >
                    <p className="font-semibold text-slate-800">{s.title}</p>
                    <p className="text-sm text-slate-600">{s.description}</p>
                    </button>
                ))}
            </div>
        </div>

        <div className="w-full md:w-2/3">
          {isLoading && <p>Running simulation...</p>}
          {!isLoading && result && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h3 className="text-xl font-bold mb-4">{activeScenario}</h3>
                <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-slate-700">Generated Token:</h4>
                        <CodeBlock content={result.token} />
                         <button
                            onClick={() => onSendToDecoder(result.decoderData)}
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                            <SendIcon className="h-5 w-5" />
                            Send to Decoder to Reproduce
                        </button>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700">Simulation Details:</h4>
                        <div className="p-3 my-2 bg-blue-50 text-blue-800 rounded-md flex items-start space-x-2 text-sm">
                          <InfoIcon className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                          <div>{result.details}</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700">Verification Result:</h4>
                        {result.verification.isValid ? (
                             <div className="p-3 my-2 bg-green-100 text-green-800 rounded-md flex items-start space-x-2">
                                <CheckIcon className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Verification Successful</p>
                                    <p className="text-sm">{result.verification.reason}</p>
                                </div>
                            </div>
                        ) : (
                             <div className="p-3 my-2 bg-red-100 text-red-800 rounded-md flex items-start space-x-2">
                                <AlertTriangleIcon className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Verification Failed</p>
                                    <p className="text-sm">{result.verification.reason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FailureSimulator;