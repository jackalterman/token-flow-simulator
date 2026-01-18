
import React, { useState, useEffect } from 'react';
import { SearchIcon, UsersIcon, ShieldCheckIcon, AlertTriangleIcon, ClipboardIcon, KeyIcon, FileCodeIcon, InfoIcon, CheckCircleIcon, XCircleIcon } from './icons';
import CodeBlock from './CodeBlock';
import { jwtService } from '../services/jwtService';
import { providerExamples, educationalContent, sampleIdTokens, samplePrivateKey } from '../utils/providerExamples';

interface OidcToolsProps {
    activeSubView?: 'discovery' | 'userinfo' | 'validator' | 'assertion';
}

const OidcTools: React.FC<OidcToolsProps> = ({ activeSubView }) => {
    const [subView, setSubView] = useState(activeSubView || 'discovery');
    const [loading, setLoading] = useState(false);
    const [showHelp, setShowHelp] = useState<Record<string, boolean>>({
        discovery: true,
        userinfo: true,
        validator: true,
        assertion: true
    });

    useEffect(() => {
        if (activeSubView) {
            setSubView(activeSubView);
        }
    }, [activeSubView]);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [showRawJson, setShowRawJson] = useState(false);

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
            setError(err.message || 'Failed to fetch OIDC config. This might be due to CORS restrictions. Try using a CORS proxy or test with a provider that allows cross-origin requests.');
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
            setError(err.message || 'Failed to fetch UserInfo. Ensure your access token is valid and has the required scopes (openid, profile, email).');
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
            setError(err.message || 'Generation failed. Ensure you have a valid RSA private key in PEM format. Use the Key Manager tool to generate one.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => { 
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadProviderExample = (providerKey: string) => {
        const provider = providerExamples[providerKey];
        if (subView === 'discovery') {
            setIssuer(provider.discoveryUrl.replace('/.well-known/openid-configuration', ''));
            setConfig(null);
        } else if (subView === 'userinfo') {
            setUserInfoEndpoint(provider.userInfoEndpoint);
        } else if (subView === 'validator') {
            setValIssuer(provider.issuer);
            setValAudience(provider.audienceExample);
        } else if (subView === 'assertion') {
            setAssIssuer(provider.clientIdExample);
            setAssSubject(provider.clientIdExample);
            setAssAudience(provider.issuer + '/token');
        }
    };

    const loadSampleToken = () => {
        setIdToken(sampleIdTokens.valid.token);
        setValIssuer('https://accounts.google.com');
        setValAudience('123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com');
    };

    const loadSampleKey = () => {
        setAssPrivateKey(samplePrivateKey);
    };

    const toggleHelp = (view: string) => {
        setShowHelp(prev => ({ ...prev, [view]: !prev[view] }));
    };

    const EducationalSection = ({ view }: { view: 'discovery' | 'userinfo' | 'validator' | 'assertion' }) => {
        const content = educationalContent[view] as any;
        if (!showHelp[view]) return null;

        return (
            <div className="mb-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-sky-100 p-2 rounded-lg">
                            <InfoIcon className="h-5 w-5 text-sky-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{content.title}</h3>
                    </div>
                    <button 
                        onClick={() => toggleHelp(view)}
                        className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                    >
                        Hide Help
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">💡 What is this?</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{content.whatIsIt}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">🎯 When to use</h4>
                        <ul className="space-y-1">
                            {content.whenToUse.map((item, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start">
                                    <span className="text-sky-500 mr-2">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">🔑 How to get credentials</h4>
                        <ul className="space-y-1">
                            {content.howToGetCredentials.map((item, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start">
                                    <span className="text-green-500 mr-2">{typeof item === 'string' && item.match(/^\d\./) ? '' : '•'}</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {view === 'discovery' && content.importantFields && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">📋 Important fields in response</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(content.importantFields).map(([key, desc]) => (
                                    <div key={key} className="text-xs bg-white rounded-lg p-2 border border-slate-200">
                                        <code className="text-sky-600 font-bold">{key}</code>
                                        <span className="text-slate-600"> - {desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'validator' && content.validationChecks && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">✅ Validation checks performed</h4>
                            <ul className="space-y-1">
                                {content.validationChecks.map((check, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 flex items-start">
                                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{check}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {view === 'assertion' && content.flow && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">🔄 Complete flow</h4>
                            <ol className="space-y-1">
                                {content.flow.map((step, idx) => (
                                    <li key={idx} className="text-sm text-slate-600">{step}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProviderExamples = ({ view }: { view: string }) => (
        <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Try an Example</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(providerExamples).map(([key, provider]) => (
                    <button
                        key={key}
                        onClick={() => loadProviderExample(key)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-all text-xs font-semibold text-slate-700 hover:text-sky-700"
                    >
                        <span>{provider.name}</span>
                    </button>
                ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 italic">Click a provider to auto-fill with example values</p>
        </div>
    );

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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                    {!showHelp[subView] && (
                        <button
                            onClick={() => toggleHelp(subView)}
                            className="mb-4 text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1"
                        >
                            <InfoIcon className="h-4 w-4" />
                            <span>Show Help & Examples</span>
                        </button>
                    )}

                    {subView === 'discovery' && (
                        <div className="space-y-4 animate-fade-in">
                            <EducationalSection view="discovery" />
                            <ProviderExamples view="discovery" />
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Issuer URL
                                    <span className="ml-2 text-xs font-normal text-slate-500">(e.g., accounts.google.com or https://login.microsoftonline.com/common/v2.0)</span>
                                </label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        value={issuer} 
                                        onChange={e => setIssuer(e.target.value)} 
                                        placeholder="e.g. accounts.google.com" 
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                    />
                                    <button 
                                        onClick={fetchConfig} 
                                        disabled={loading || !issuer} 
                                        className="px-6 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Fetching...' : 'Fetch Config'}
                                    </button>
                                </div>
                            </div>

                        {config && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-700">Discovery Document</h4>
                                        <button 
                                            onClick={() => copyToClipboard(JSON.stringify(config, null, 2))}
                                            className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center space-x-1"
                                        >
                                            <ClipboardIcon className="h-3 w-3" />
                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { key: 'issuer', label: 'Issuer', icon: '🏢' },
                                            { key: 'authorization_endpoint', label: 'Authorization', icon: '🔐' },
                                            { key: 'token_endpoint', label: 'Token', icon: '🎫' },
                                            { key: 'userinfo_endpoint', label: 'UserInfo', icon: '👤' },
                                            { key: 'jwks_uri', label: 'JWKS', icon: '🔑' },
                                            { key: 'end_session_endpoint', label: 'Logout', icon: '🚪' }
                                        ].map(({ key, label, icon }) => config[key] && (
                                            <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-sm">
                                                <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                                                    <span>{icon}</span> {label}
                                                </div>
                                                <div className="text-xs font-mono text-slate-700 break-all bg-white p-1.5 rounded border border-slate-100 select-all">
                                                    {config[key]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Supported Features Lists */}
                                    <div className="space-y-4">
                                        {[
                                            { key: 'scopes_supported', label: 'Supported Scopes', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                            { key: 'response_types_supported', label: 'Response Types', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                                            { key: 'response_modes_supported', label: 'Response Modes', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                                            { key: 'grant_types_supported', label: 'Grant Types', color: 'bg-violet-50 text-violet-700 border-violet-100' },
                                            { key: 'token_endpoint_auth_methods_supported', label: 'Token Endpoint Auth Methods', color: 'bg-pink-50 text-pink-700 border-pink-100' },
                                            { key: 'code_challenge_methods_supported', label: 'PKCE Methods', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
                                            { key: 'claims_supported', label: 'Supported Claims', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                            { key: 'id_token_signing_alg_values_supported', label: 'ID Token Algorithms', color: 'bg-orange-50 text-orange-700 border-orange-100' }
                                        ].map(({ key, label, color }) => config[key] && Array.isArray(config[key]) && (
                                            <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-100 pb-2">{label}</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {config[key].map((item: string) => (
                                                        <span key={item} className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <button 
                                            onClick={() => setShowRawJson(!showRawJson)}
                                            className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors select-none w-full text-left"
                                        >
                                            <div className="p-1 bg-slate-100 rounded group-hover:bg-slate-200 transition-colors">
                                                <FileCodeIcon className="h-3 w-3" />
                                            </div>
                                            View Raw Discovery JSON
                                            <span className="ml-auto text-[10px] font-normal text-slate-400">
                                                {showRawJson ? 'Click to collapse' : 'Click to expand'}
                                            </span>
                                        </button>
                                        
                                        {showRawJson && (
                                            <div className="mt-3 animate-fade-in">
                                                <CodeBlock content={JSON.stringify(config, null, 2)} language="json" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {subView === 'userinfo' && (
                        <div className="space-y-4 animate-fade-in">
                            <EducationalSection view="userinfo" />
                            <ProviderExamples view="userinfo" />

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        UserInfo Endpoint
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(Found in discovery document)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={userInfoEndpoint} 
                                        onChange={e => setUserInfoEndpoint(e.target.value)} 
                                        placeholder="https://openidconnect.googleapis.com/v1/userinfo"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Access Token
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(Obtained from OAuth flow)</span>
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={accessToken} 
                                        onChange={e => setAccessToken(e.target.value)} 
                                        placeholder="Paste your access token here..."
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        ⚠️ Access tokens are sensitive! This tool runs entirely in your browser - no data is sent to any server.
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={fetchUserInfo} 
                                disabled={loading || !accessToken || !userInfoEndpoint} 
                                className="w-full py-3 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Fetching Profile...' : 'Fetch User Profile'}
                            </button>

                            {userInfo && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-700">User Information</h4>
                                        <button 
                                            onClick={() => copyToClipboard(JSON.stringify(userInfo, null, 2))}
                                            className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center space-x-1"
                                        >
                                            <ClipboardIcon className="h-3 w-3" />
                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <CodeBlock content={JSON.stringify(userInfo, null, 2)} language="json" />
                                </div>
                            )}
                        </div>
                    )}

                    {subView === 'validator' && (
                        <div className="space-y-4 animate-fade-in">
                            <EducationalSection view="validator" />
                            
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">ID Token (JWT)</label>
                                <button
                                    onClick={loadSampleToken}
                                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                                >
                                    Load Sample Token
                                </button>
                            </div>
                            <textarea 
                                rows={4} 
                                value={idToken} 
                                onChange={e => setIdToken(e.target.value)} 
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                placeholder="Paste ID Token (JWT) here..."
                            />

                            <ProviderExamples view="validator" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Expected Issuer
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(iss claim)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={valIssuer} 
                                        onChange={e => setValIssuer(e.target.value)} 
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                        placeholder="https://accounts.google.com" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Expected Audience
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(aud claim - your client ID)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={valAudience} 
                                        onChange={e => setValAudience(e.target.value)} 
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                        placeholder="your-client-id" 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={validateToken} 
                                disabled={loading || !idToken}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Validating...' : 'Validate Token'}
                            </button>

                            {validationResult && (
                                <div className={`p-4 rounded-lg border-2 ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center space-x-3 mb-2">
                                        {validationResult.isValid ? 
                                            <CheckCircleIcon className="h-6 w-6 text-green-600" /> : 
                                            <XCircleIcon className="h-6 w-6 text-red-600" />
                                        }
                                        <span className={`font-bold text-lg ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                                            {validationResult.isValid ? '✅ Token is Valid' : '❌ Token is Invalid'}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                                        {validationResult.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {subView === 'assertion' && (
                        <div className="space-y-4 animate-fade-in">
                            <EducationalSection view="assertion" />
                            <ProviderExamples view="assertion" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Issuer (Client ID)
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(iss & sub claims)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={assIssuer} 
                                        onChange={e => {
                                            setAssIssuer(e.target.value);
                                            setAssSubject(e.target.value);
                                        }} 
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                        placeholder="your-client-id"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Audience (Token URL)
                                        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">(aud claim)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={assAudience} 
                                        onChange={e => setAssAudience(e.target.value)} 
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                        placeholder="https://idp.example.com/token"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">
                                        Private Key (PEM Format)
                                    </label>
                                    <button
                                        onClick={loadSampleKey}
                                        className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                                    >
                                        Load Sample Key
                                    </button>
                                </div>
                                <textarea 
                                    rows={8} 
                                    value={assPrivateKey} 
                                    onChange={e => setAssPrivateKey(e.target.value)} 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-mono focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----" 
                                />
                                <div className="mt-2 flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <AlertTriangleIcon className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800">
                                        <p className="font-semibold mb-1">Need a key pair?</p>
                                        <p>Use the <strong>Key Manager</strong> tool (in the Infrastructure section) to generate an RSA key pair. Upload the public key to your identity provider and use the private key here.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={generateAssertion} 
                                disabled={loading || !assPrivateKey || !assIssuer || !assAudience}
                                className="w-full py-3 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Generating...' : 'Generate JWT Assertion'}
                            </button>

                            {generatedAssertion && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700">Generated JWT Assertion</label>
                                        <button 
                                            onClick={() => copyToClipboard(generatedAssertion)} 
                                            className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center space-x-1"
                                        >
                                            <ClipboardIcon className="h-3 w-3" />
                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className="p-4 bg-slate-900 rounded-lg text-cyan-300 font-mono text-xs break-all leading-relaxed">
                                        {generatedAssertion}
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h5 className="text-xs font-bold text-blue-800 mb-2">📤 Next Steps: Exchange for Access Token</h5>
                                        <p className="text-xs text-blue-700 mb-2">POST this assertion to the token endpoint:</p>
                                        <CodeBlock 
                                            content={`POST ${assAudience}\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${generatedAssertion}`}
                                            language="http"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3">
                            <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-800 mb-1">Error</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OidcTools;
