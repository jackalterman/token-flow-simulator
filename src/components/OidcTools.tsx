
import React, { useState, useEffect } from 'react';
import { SearchIcon, UsersIcon, ShieldCheckIcon, AlertTriangleIcon, ClipboardIcon, KeyIcon, FileCodeIcon } from './icons';
import CodeBlock from './CodeBlock';
import { jwtService } from '../services/jwtService';

interface OidcToolsProps {
    activeSubView?: 'discovery' | 'userinfo' | 'validator' | 'assertion';
}

const OidcTools: React.FC<OidcToolsProps> = ({ activeSubView }) => {
    const [subView, setSubView] = useState(activeSubView || 'discovery');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeSubView) {
            setSubView(activeSubView);
        }
    }, [activeSubView]);
    const [error, setError] = useState<string | null>(null);

    // Discovery State
    const [issuer, setIssuer] = useState('');
    const [config, setConfig] = useState<any>(null);

    // UserInfo State
    const [accessToken, setAccessToken] = useState('');
    const [userInfoEndpoint, setUserInfoEndpoint] = useState('');
    const [userInfo, setUserInfo] = useState<any>(null);

    // Validator State
    const [idToken, setIdToken] = useState('');
    const [valIssuer, setValIssuer] = useState('');
    const [valAudience, setValAudience] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);

    // Assertion State
    const [assIssuer, setAssIssuer] = useState('client-id');
    const [assSubject, setAssSubject] = useState('client-id');
    const [assAudience, setAssAudience] = useState('https://idp.example.com/token');
    const [assPrivateKey, setAssPrivateKey] = useState('');
    const [generatedAssertion, setGeneratedAssertion] = useState('');

    const isValidUrl = (url: string) => {
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch {
            return false;
        }
    };

    const fetchConfig = async () => {
        if (!issuer) return;
        setLoading(true);
        setError(null);
        try {
            let url = issuer.replace(/\/$/, '');
            if (!url.includes('.well-known')) url = `${url}/.well-known/openid-configuration`;
            const response = await fetch(url);
            const data = await response.json();
            setConfig(data);
            if (data.userinfo_endpoint) setUserInfoEndpoint(data.userinfo_endpoint);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch OIDC config');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(userInfoEndpoint, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setUserInfo(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch UserInfo');
        } finally {
            setLoading(false);
        }
    };

    const validateToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await jwtService.validateIdToken(idToken, valIssuer, valAudience);
            setValidationResult(result);
        } catch (err: any) {
            setError(err.message || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const generateAssertion = async () => {
        setLoading(true);
        setError(null);
        try {
            const now = Math.floor(Date.now() / 1000);
            const payload = {
                iss: assIssuer,
                sub: assSubject,
                aud: assAudience,
                iat: now,
                exp: now + 300,
                jti: crypto.randomUUID()
            };
            const header = { alg: 'RS256', typ: 'JWT' };
            const token = await jwtService.sign(header as any, payload, assPrivateKey);
            setGeneratedAssertion(token);
        } catch (err: any) {
            setError(err.message || 'Generation failed. Ensure you have a valid private key.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl shadow-inner mb-6">
                {[
                    { id: 'discovery', label: 'Discovery', icon: SearchIcon },
                    { id: 'userinfo', label: 'UserInfo', icon: UsersIcon },
                    { id: 'validator', label: 'Validator', icon: ShieldCheckIcon },
                    { id: 'assertion', label: 'Assertion', icon: KeyIcon }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setSubView(tab.id as any)} className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${subView === tab.id ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                        <tab.icon className="h-3 w-3" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="p-6">
                    {subView === 'discovery' && (
                        <div className="space-y-4 animate-fade-in">
                            <label className="block text-sm font-bold text-slate-700">Issuer URL</label>
                            <div className="flex space-x-2">
                                <input type="text" value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. accounts.google.com" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                <button onClick={fetchConfig} disabled={loading || !issuer} className="px-6 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 disabled:opacity-50 transition-colors">Fetch</button>
                            </div>
                            {config && <CodeBlock code={JSON.stringify(config, null, 2)} language="json" />}
                        </div>
                    )}

                    {subView === 'userinfo' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UserInfo Endpoint</label>
                                    <input type="text" value={userInfoEndpoint} onChange={e => setUserInfoEndpoint(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Token</label>
                                    <input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                            <button onClick={fetchUserInfo} disabled={loading || !accessToken} className="w-full py-2 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 transition-colors">Fetch Profile</button>
                            {userInfo && <CodeBlock code={JSON.stringify(userInfo, null, 2)} language="json" />}
                        </div>
                    )}

                    {subView === 'validator' && (
                        <div className="space-y-4 animate-fade-in">
                            <label className="block text-sm font-bold text-slate-700">ID Token</label>
                            <textarea rows={4} value={idToken} onChange={e => setIdToken(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono" placeholder="Paste ID Token (JWT)..." />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Issuer</label>
                                    <input type="text" value={valIssuer} onChange={e => setValIssuer(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" placeholder="https://accounts.google.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Audience</label>
                                    <input type="text" value={valAudience} onChange={e => setValAudience(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Client ID" />
                                </div>
                            </div>
                            <button onClick={validateToken} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 transition-colors">Validate Claims & Key</button>
                            {validationResult && (
                                <div className={`p-4 rounded-lg border ${validationResult.isValid ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                    <div className="flex items-center space-x-2">
                                        {validationResult.isValid ? <ShieldCheckIcon className="h-5 w-5" /> : <AlertTriangleIcon className="h-5 w-5" />}
                                        <span className="font-bold">{validationResult.isValid ? 'Valid' : 'Invalid'}</span>
                                    </div>
                                    <p className="mt-1 text-sm">{validationResult.reason}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {subView === 'assertion' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issuer (Client ID)</label>
                                    <input type="text" value={assIssuer} onChange={e => setAssIssuer(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience (Token URL)</label>
                                    <input type="text" value={assAudience} onChange={e => setAssAudience(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Algorithm</label>
                                    <input type="text" value="RS256" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Private Key (PEM)</label>
                                <textarea rows={6} value={assPrivateKey} onChange={e => setAssPrivateKey(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-mono" placeholder="-----BEGIN PRIVATE KEY-----..." />
                                <p className="mt-1 text-[10px] text-slate-400italic">Use Key Manager to generate a pair if needed.</p>
                            </div>
                            <button onClick={generateAssertion} className="w-full py-2 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 transition-colors">Generate Assertion JWT</button>
                            {generatedAssertion && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700">Generated JWT</label>
                                        <button onClick={() => copyToClipboard(generatedAssertion)} className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center">
                                            <ClipboardIcon className="h-3 w-3 mr-1" /> Copy
                                        </button>
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-lg text-cyan-300 font-mono text-xs break-all leading-relaxed">{generatedAssertion}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center space-x-3 text-red-700">
                            <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OidcTools;
