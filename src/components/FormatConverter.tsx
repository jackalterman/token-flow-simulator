import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';
import Tabs from './Tabs';
import yaml from 'js-yaml';
import { 
  KeyIcon, 
  CertificateIcon, 
  DatabaseIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  ClipboardIcon,
  TrashIcon,
  CheckIcon,
  RefreshIcon
} from './icons';

type ConverterTab = 'keys' | 'certs' | 'data' | 'time';

const FormatConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConverterTab>('keys');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Security Formatter</h2>
           <p className="text-slate-600">Universal toolkit for converting keys, certificates, data formats, and timestamps.</p>
        </div>
      </div>

      <Tabs 
        activeView={activeTab} 
        setActiveView={setActiveTab} 
        views={['keys', 'certs', 'data', 'time']} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-6">
        {activeTab === 'keys' && <KeysConverter />}
        {activeTab === 'certs' && <CertsConverter />}
        {activeTab === 'data' && <DataConverter />}
        {activeTab === 'time' && <TimeConverter />}
      </div>
    </div>
  );
};

// --- Sub-Components ---

// 1. Keys Converter
const KeysConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'pem-to-oneline' | 'oneline-to-pem' | 'jwk-to-pem' | 'pem-to-jwk'>('pem-to-oneline');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        convert();
    }, [input, mode]);

    const convert = async () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }
        setError(null);

        try {
            if (mode === 'pem-to-oneline') {
                setOutput(input
                    .replace(/-----BEGIN [^-]+-----/, '')
                    .replace(/-----END [^-]+-----/, '')
                    .replace(/\s/g, ''));
            } else if (mode === 'oneline-to-pem') {
                const raw = input.replace(/\s/g, '');
                const chunks = raw.match(/.{1,64}/g) || [];
                setOutput(`-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`);
            } else if (mode === 'jwk-to-pem') {
                try {
                    const jwk = JSON.parse(input);
                    const key = await crypto.subtle.importKey(
                        'jwk', 
                        jwk, 
                        { name: jwk.kty === 'EC' ? 'ECDSA' : 'RSASSA-PKCS1-v1_5', namedCurve: jwk.crv, hash: 'SHA-256' }, 
                        true, 
                        ['verify'] // 'sign' requires private key, 'verify' works for public
                    ).catch(() => crypto.subtle.importKey(
                         'jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt', 'wrapKey']
                    ));
                    
                    const spki = await crypto.subtle.exportKey('spki', key);
                    const exported = window.btoa(String.fromCharCode(...new Uint8Array(spki)));
                    const chunks = exported.match(/.{1,64}/g) || [];
                    setOutput(`-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`);
                } catch (e: any) {
                    setError('Invalid JWK or incompatible key type (WebCrypto limits). Ensure it is a valid Public Key JWK.');
                }
            } else if (mode === 'pem-to-jwk') {
                 // Requires importing PEM to WebCrypto first - complex due to parsing headers.
                 // For now, simpler heuristic or placeholder since importing PEM is hard without libs.
                 setError("PEM to JWK conversion requires full ASN.1 parsing which is limited in the browser without libraries. Try 'Keys' tab in Key Manager to generate new pairs.");
                 setOutput('');
            }
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                 <div className="flex flex-wrap gap-2">
                    <ModeButton current={mode} target="pem-to-oneline" setMode={setMode} label="PEM → One-line" />
                    <ModeButton current={mode} target="oneline-to-pem" setMode={setMode} label="One-line → PEM" />
                    <ModeButton current={mode} target="jwk-to-pem" setMode={setMode} label="JWK → PEM" />
                    {/* <ModeButton current={mode} target="pem-to-jwk" setMode={setMode} label="PEM → JWK" /> */}
                 </div>
                 <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-sky-500 focus:border-sky-500"
                    placeholder={mode.includes('jwk') ? '{"kty": "RSA", ...}' : 'Paste key content here...'}
                 />
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-slate-700">Output</h3>
                <div className="bg-slate-900 rounded-xl overflow-hidden min-h-[320px] relative group">
                    {error ? (
                        <div className="p-4 text-red-400 font-mono text-xs">{error}</div>
                    ) : (
                        <CodeBlock content={output} />
                    )}
                </div>
            </div>
        </div>
    );
}

// 2. Certs Converter
const CertsConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [derHex, setDerHex] = useState('');
    
    useEffect(() => {
        try {
            const raw = input
                .replace(/-----BEGIN [^-]+-----/, '')
                .replace(/-----END [^-]+-----/, '')
                .replace(/\s/g, '');
            if (!raw) { setDerHex(''); return; }
            
            const binary = atob(raw);
            const hex = Array.from(binary)
                .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('');
            setDerHex(hex);
        } catch (e) { setDerHex('Invalid PEM / Base64'); }
    }, [input]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-4">
                 <h3 className="font-bold text-slate-700">Pre-Encoded Certificate (PEM)</h3>
                 <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    placeholder="-----BEGIN CERTIFICATE-----..."
                 />
            </div>
            <div className="space-y-4">
                 <h3 className="font-bold text-slate-700">DER Hex Dump</h3>
                 <div className="bg-slate-900 rounded-xl p-4 h-80 overflow-y-auto font-mono text-xs text-slate-300 break-all leading-relaxed">
                     {derHex || <span className="text-slate-500 italic">Hex output will appear here...</span>}
                 </div>
            </div>
        </div>
    );
}

// 3. Data Converter
const DataConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json' | 'json-to-xml'>('json-to-yaml');
    
    useEffect(() => {
        if (!input.trim()) { setOutput(''); return; }
        try {
            if (mode === 'json-to-yaml') {
                const obj = JSON.parse(input);
                setOutput(yaml.dump(obj));
            } else if (mode === 'yaml-to-json') {
                const obj = yaml.load(input);
                setOutput(JSON.stringify(obj, null, 2));
            } else if (mode === 'json-to-xml') {
                // Simple logical mapping for display
                 const obj = JSON.parse(input);
                 setOutput(jsonToXml(obj));
            }
        } catch (e: any) {
            setOutput(`Error: ${e.message}`);
        }
    }, [input, mode]);

    return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                 <div className="flex flex-wrap gap-2">
                    <ModeButton current={mode} target="json-to-yaml" setMode={setMode} label="JSON → YAML" />
                    <ModeButton current={mode} target="yaml-to-json" setMode={setMode} label="YAML → JSON" />
                    <ModeButton current={mode} target="json-to-xml" setMode={setMode} label="JSON → XML" />
                 </div>
                 <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    placeholder={mode.includes('yaml') ? "key: value..." : '{"key": "value"}'}
                 />
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-slate-700">Converted Data</h3>
                <div className="bg-slate-900 rounded-xl overflow-hidden h-96">
                     <CodeBlock content={output} language={mode.includes('xml') ? 'xml' : mode.includes('json') && !mode.includes('yaml') ? 'json' : 'yaml'} />
                </div>
            </div>
        </div>
    );
}

// 4. Time Converter
const TimeConverter: React.FC = () => {
    const [epoch, setEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
    const [iso, setIso] = useState<string>(new Date().toISOString());
    
    // Updates from Epoch
    const handleEpochChange = (val: string) => {
        setEpoch(val);
        const num = Number(val);
        if (!isNaN(num)) {
            // Detect if ms or seconds (heuristic: 10 digits = seconds, 13 = ms)
            // But usually inputs are deliberate. Let's assume seconds if < 10000000000 ? No that's 2286.
            // Standard: Seconds.
            // If length > 11, assume ms?
            const date = new Date(val.length > 10 ? num : num * 1000);
            if (date.toString() !== 'Invalid Date') {
                setIso(date.toISOString());
            }
        }
    };

    // Updates from ISO
    const handleIsoChange = (val: string) => {
        setIso(val);
        const date = new Date(val);
        if (date.toString() !== 'Invalid Date') {
            setEpoch(Math.floor(date.getTime() / 1000).toString());
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center space-y-6">
                <ClockIcon className="h-12 w-12 text-sky-500 mx-auto" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold uppercase text-slate-500">Epoch (Seconds)</label>
                        <input 
                            type="text" 
                            value={epoch} 
                            onChange={e => handleEpochChange(e.target.value)}
                            className="w-full text-2xl font-mono font-bold bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-sky-500 focus:border-sky-500" 
                        />
                        <p className="text-[10px] text-slate-400">Unix Timestamp</p>
                    </div>

                    <div className="hidden md:flex justify-center">
                         <ArrowRightIcon className="h-6 w-6 text-slate-300" />
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold uppercase text-slate-500">ISO 8601 Date</label>
                        <input 
                            type="text" 
                            value={iso} 
                             onChange={e => handleIsoChange(e.target.value)}
                            className="w-full text-lg font-mono font-bold bg-white border border-slate-300 rounded-lg px-4 py-3.5 focus:ring-sky-500 focus:border-sky-500" 
                        />
                         <p className="text-[10px] text-slate-400">Human Readable (UTC)</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                     <button onClick={() => handleEpochChange(Math.floor(Date.now()/1000).toString())} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                         <RefreshIcon className="h-4 w-4" /> Now
                     </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="text-indigo-900 font-bold text-lg">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</h4>
                    <p className="text-indigo-600 text-sm">Day of Week</p>
                </div>
                 <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <h4 className="text-emerald-900 font-bold text-lg">{Intl.DateTimeFormat().resolvedOptions().timeZone}</h4>
                    <p className="text-emerald-600 text-sm">Local Timezone</p>
                </div>
            </div>
        </div>
    );
}

// --- Helpers ---
const ModeButton = ({ current, target, setMode, label }: any) => (
    <button 
        onClick={() => setMode(target)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            current === target 
            ? 'bg-sky-600 border-sky-600 text-white shadow-sm' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
        {label}
    </button>
);

const jsonToXml = (obj: any, rootName: string = 'root'): string => {
    let xml = '';
    if (typeof obj !== 'object' || obj === null) {
        return String(obj);
    }
    
    // Start root if provided (simplistic)
    // Actually simpler to just recurse keys
    
    const parse = (data: any) => {
        let str = '';
        for (const key in data) {
            const value = data[key];
            if (Array.isArray(value)) {
                 value.forEach(item => {
                     str += `<${key}>${typeof item === 'object' ? parse(item) : item}</${key}>`;
                 });
            } else if (typeof value === 'object') {
                 str += `<${key}>${parse(value)}</${key}>`;
            } else {
                 str += `<${key}>${value}</${key}>`;
            }
        }
        return str;
    }
    
    return `<${rootName}>\n${parse(obj)}\n</${rootName}>`; // Very naive but sufficient for basic visualization
};

export default FormatConverter;
