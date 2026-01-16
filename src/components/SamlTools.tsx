
import React, { useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import CodeBlock from './CodeBlock';
import { xmlService } from '../services/xmlService';
import { FileCodeIcon, SendIcon, ShieldCheckIcon, SearchIcon, ClipboardIcon, TrashIcon, RefreshIcon } from './icons';

type SamlMode = 'inspect' | 'generate-response' | 'generate-request' | 'analyze-signature' | 'generate-metadata';

const SamlTools: React.FC = () => {
    const [mode, setMode] = usePersistentState<SamlMode>('saml-mode', 'inspect');
    const [rawXml, setRawXml] = usePersistentState('saml-raw-xml', '');
    const [prettyXml, setPrettyXml] = usePersistentState('saml-pretty-xml', '');
    const [sigAnalysis, setSigAnalysis] = useState<any>(null);

    // Response State
    const [issuer, setIssuer] = usePersistentState('saml-resp-issuer', 'https://idp.example.com');
    const [subject, setSubject] = usePersistentState('saml-resp-subject', 'user@example.com');
    const [audience, setAudience] = usePersistentState('saml-resp-audience', 'https://sp.example.com');
    const [acsUrl, setAcsUrl] = usePersistentState('saml-resp-acs', 'https://sp.example.com/acs');
    const [attrName, setAttrName] = usePersistentState('saml-resp-attr-name', 'role');
    const [attrVal, setAttrVal] = usePersistentState('saml-resp-attr-val', 'admin');

    // Request State
    const [reqIssuer, setReqIssuer] = usePersistentState('saml-req-issuer', 'https://sp.example.com');
    const [reqAcsUrl, setReqAcsUrl] = usePersistentState('saml-req-acs', 'https://sp.example.com/acs');
    const [reqDestination, setReqDestination] = usePersistentState('saml-req-dest', 'https://idp.example.com/sso');

    // Metadata State
    const [metaEntityId, setMetaEntityId] = usePersistentState('saml-meta-entity', 'https://sp.example.com');
    const [metaType, setMetaType] = usePersistentState<'sp' | 'idp'>('saml-meta-type', 'sp');

    const handleInspect = () => {
        try {
            let xml = rawXml.trim();
            if (!xml.startsWith('<') && xml.length > 20) {
                try { xml = atob(xml); } catch (e) { }
            }
            setPrettyXml(xmlService.formatXml(xml));
        } catch (e) {
            setPrettyXml('Invalid XML or Base64 Input');
        }
    };

    const handleAnalyzeSignature = () => {
        try {
            let xml = rawXml.trim();
            if (!xml.startsWith('<') && xml.length > 20) {
                try { xml = atob(xml); } catch (e) { }
            }
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, "text/xml");
            const signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0];
            
            if (!signature) {
                setSigAnalysis({ error: "No <ds:Signature> found in document." });
                return;
            }

            const getVal = (tag: string) => signature.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", tag)[0]?.getAttribute("Algorithm") || "Not specified";
            
            setSigAnalysis({
                canonicalization: getVal("CanonicalizationMethod"),
                signatureMethod: getVal("SignatureMethod"),
                digestMethod: getVal("DigestMethod"),
                keyInfo: !!signature.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "KeyInfo")[0],
                found: true
            });
        } catch (e) {
            setSigAnalysis({ error: "Failed to parse XML for signature analysis." });
        }
    };

    const handleGenerateResponse = () => {
        const xml = xmlService.generateMockSamlResponse({
            issuer, subject, audience, acsUrl,
            attributes: { [attrName]: attrVal }
        });
        setRawXml(xml);
        setPrettyXml(xmlService.formatXml(xml));
        setMode('inspect');
    };

    const handleGenerateRequest = () => {
        const xml = xmlService.generateMockSamlRequest({
            issuer: reqIssuer, acsUrl: reqAcsUrl, destination: reqDestination
        });
        setRawXml(xml);
        setPrettyXml(xmlService.formatXml(xml));
        setMode('inspect');
    };

    const handleGenerateMetadata = () => {
        const xml = xmlService.generateMockSamlMetadata({
            entityId: metaEntityId, type: metaType,
            acsUrl: metaType === 'sp' ? reqAcsUrl : undefined,
            ssoUrl: metaType === 'idp' ? reqDestination : undefined
        });
        setRawXml(xml);
        setPrettyXml(xmlService.formatXml(xml));
        setMode('inspect');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(prettyXml);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">SAML Tools</h2>
                    <p className="text-slate-600 italic text-sm">"The protocol that never dies." Decode assertions or generate mock requests and responses.</p>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => setMode('inspect')} className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${mode === 'inspect' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Inspector</button>
                    <button onClick={() => setMode('analyze-signature')} className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${mode === 'analyze-signature' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Sig Analyzer</button>
                    <button onClick={() => setMode('generate-response')} className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${mode === 'generate-response' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Response</button>
                    <button onClick={() => setMode('generate-request')} className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${mode === 'generate-request' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Request</button>
                    <button onClick={() => setMode('generate-metadata')} className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${mode === 'generate-metadata' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Metadata</button>
                </div>

                {(mode === 'inspect' || mode === 'analyze-signature') && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Raw XML or Base64</label>
                                <button 
                                    onClick={() => { setRawXml(''); setPrettyXml(''); setSigAnalysis(null); }}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-tight flex items-center gap-1"
                                >
                                    <TrashIcon className="h-3.5 w-3.5" /> Clear
                                </button>
                            </div>
                            <textarea rows={6} className="block w-full rounded-lg border-slate-200 shadow-sm focus:ring-sky-500 text-xs font-mono" placeholder="Paste SAMLResponse or AuthnRequest..." value={rawXml} onChange={(e) => setRawXml(e.target.value)} />
                        </div>
                        {mode === 'inspect' ? (
                            <button onClick={handleInspect} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white bg-slate-800 hover:bg-slate-900 font-bold text-sm transition-colors">
                                <SendIcon className="h-4 w-4" /> Decode & Format
                            </button>
                        ) : (
                            <button onClick={handleAnalyzeSignature} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white bg-slate-800 hover:bg-slate-900 font-bold text-sm transition-colors">
                                <SearchIcon className="h-4 w-4" /> Analyze Signature
                            </button>
                        )}
                    </div>
                )}

                {mode === 'generate-response' && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issuer (IdP)</label>
                            <input type="text" value={issuer} onChange={e => setIssuer(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject (User)</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience (SP)</label>
                             <input type="text" value={audience} onChange={e => setAudience(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <button onClick={handleGenerateResponse} className="w-full py-2.5 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-bold text-sm transition-colors">Generate Response</button>
                    </div>
                )}

                {mode === 'generate-request' && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issuer (SP)</label>
                            <input type="text" value={reqIssuer} onChange={e => setReqIssuer(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destination (IdP)</label>
                            <input type="text" value={reqDestination} onChange={e => setReqDestination(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <button onClick={handleGenerateRequest} className="w-full py-2.5 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-bold text-sm transition-colors">Generate Request</button>
                    </div>
                )}

                {mode === 'generate-metadata' && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                         <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={() => setMetaType('sp')} className={`flex-1 py-1 px-2 rounded text-xs font-bold ${metaType === 'sp' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}>SP Metadata</button>
                            <button onClick={() => setMetaType('idp')} className={`flex-1 py-1 px-2 rounded text-xs font-bold ${metaType === 'idp' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}>IdP Metadata</button>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entity ID</label>
                            <input type="text" value={metaEntityId} onChange={e => setMetaEntityId(e.target.value)} className="block w-full rounded-md border-slate-200 text-sm" />
                        </div>
                        <button onClick={handleGenerateMetadata} className="w-full py-2.5 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-bold text-sm transition-colors">Generate Metadata</button>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden min-h-[600px] flex flex-col relative group">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-[10px] font-mono font-black text-slate-500 tracking-tighter uppercase">XML Serialization</span>
                        <div className="flex items-center space-x-2">
                            <button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white" title="Copy to clipboard">
                                <ClipboardIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 flex-1 overflow-auto bg-[rgba(15,23,42,0.5)]">
                        {mode === 'analyze-signature' && sigAnalysis ? (
                            <div className="space-y-4 animate-fade-in">
                                {sigAnalysis.error ? (
                                    <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs font-mono">
                                        {sigAnalysis.error}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Canonicalization Method</h4>
                                            <p className="text-cyan-300 font-mono text-xs">{sigAnalysis.canonicalization}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Signature Method</h4>
                                            <p className="text-cyan-300 font-mono text-xs">{sigAnalysis.signatureMethod}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Digest Method</h4>
                                            <p className="text-cyan-300 font-mono text-xs">{sigAnalysis.digestMethod}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">KeyInfo Present</h4>
                                            <p className={`font-mono text-xs ${sigAnalysis.keyInfo ? 'text-green-400' : 'text-red-400'}`}>{sigAnalysis.keyInfo ? 'YES' : 'NO'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : prettyXml ? (
                            <pre className="text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed whitespace-pre-wrap break-all selection:bg-sky-500/30">
                                {prettyXml}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700">
                                <FileCodeIcon className="h-16 w-16 mb-4 opacity-10" />
                                <p className="text-sm font-medium">Wait for output...</p>
                            </div>
                        )}
                    </div>
                    {prettyXml && <div className="absolute top-12 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-3 py-1 bg-sky-500 text-white text-[10px] font-bold rounded-full shadow-lg">READ ONLY</div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default SamlTools;
