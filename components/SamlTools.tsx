
import React, { useState } from 'react';
import CodeBlock from './CodeBlock';
import { xmlService } from '../services/xmlService';
import { FileCodeIcon, SendIcon } from './icons';

const SamlTools: React.FC = () => {
  const [mode, setMode] = useState<'inspect' | 'generate'>('inspect');
  const [rawXml, setRawXml] = useState('');
  const [prettyXml, setPrettyXml] = useState('');
  
  // Generation State
  const [issuer, setIssuer] = useState('https://idp.example.com');
  const [subject, setSubject] = useState('user@example.com');
  const [audience, setAudience] = useState('https://sp.example.com');
  const [acsUrl, setAcsUrl] = useState('https://sp.example.com/acs');
  const [attrName, setAttrName] = useState('role');
  const [attrVal, setAttrVal] = useState('admin');

  const handleInspect = () => {
      try {
          let xml = rawXml.trim();
          // Simple heuristic to check if base64 encoded
          if (!xml.startsWith('<') && xml.length > 20) {
             try {
                 xml = atob(xml);
             } catch (e) {
                 // Not base64, assume raw
             }
          }
          setPrettyXml(xmlService.formatXml(xml));
      } catch (e) {
          setPrettyXml('Invalid XML or Base64 Input');
      }
  };

  const handleGenerate = () => {
      const xml = xmlService.generateMockSamlResponse({
          issuer,
          subject,
          audience,
          acsUrl,
          attributes: { [attrName]: attrVal }
      });
      setRawXml(xml);
      setPrettyXml(xmlService.formatXml(xml));
      setMode('inspect');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">SAML Tools</h2>
            <p className="text-slate-600">Analyze SAML Responses or generate mock assertions for testing.</p>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
             <button 
                onClick={() => setMode('inspect')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mode === 'inspect' ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                 Inspector
             </button>
             <button 
                onClick={() => setMode('generate')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mode === 'generate' ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                 Generator
             </button>
        </div>

        {mode === 'generate' && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issuer (IdP Entity ID)</label>
                    <input type="text" value={issuer} onChange={e => setIssuer(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject (NameID)</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience (SP Entity ID)</label>
                    <input type="text" value={audience} onChange={e => setAudience(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ACS URL (Destination)</label>
                    <input type="text" value={acsUrl} onChange={e => setAcsUrl(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attr Name</label>
                        <input type="text" value={attrName} onChange={e => setAttrName(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attr Value</label>
                        <input type="text" value={attrVal} onChange={e => setAttrVal(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" />
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                    <FileCodeIcon className="h-5 w-5" />
                    Generate SAML XML
                </button>
            </div>
        )}

        {mode === 'inspect' && (
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fade-in">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Input</label>
                    <textarea
                        rows={6}
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs font-mono"
                        placeholder="Paste Raw XML or Base64 encoded SAMLResponse..."
                        value={rawXml}
                        onChange={(e) => setRawXml(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleInspect}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    <SendIcon className="h-5 w-5" />
                    Decode & Format
                </button>
             </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                 <span className="text-sm font-mono font-bold text-slate-300">OUTPUT</span>
                 <span className="text-xs text-slate-500 uppercase">Read-Only</span>
            </div>
            <div className="p-4 flex-1 overflow-auto">
                {prettyXml ? (
                    <pre className="text-xs sm:text-sm font-mono text-blue-200 whitespace-pre-wrap break-all">
                        {prettyXml}
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <FileCodeIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p>Generated or formatted XML will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SamlTools;
