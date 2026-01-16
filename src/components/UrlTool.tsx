
import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { ClipboardIcon, CheckIcon, RefreshIcon, ArrowRightIcon, TrashIcon } from './icons';

const UrlTool: React.FC = () => {
    const [input, setInput] = usePersistentState('url-input', '');
    const [output, setOutput] = useState('');
    const [mode, setMode] = usePersistentState<'encode' | 'decode'>('url-mode', 'encode');
    const [useComponent, setUseComponent] = usePersistentState('url-use-component', true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!input) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            setError(null);
            if (mode === 'encode') {
                setOutput(useComponent ? encodeURIComponent(input) : encodeURI(input));
            } else {
                setOutput(useComponent ? decodeURIComponent(input) : decodeURI(input));
            }
        } catch (e) {
            setError(mode === 'encode' ? 'Error encoding URL' : 'Invalid URL-encoded input');
            setOutput('');
        }
    }, [input, mode, useComponent]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setMode('encode')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    mode === 'encode'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Encode
                            </button>
                            <button
                                onClick={() => setMode('decode')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    mode === 'decode'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Decode
                            </button>
                        </div>
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setUseComponent(true)}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all uppercase tracking-tight ${
                                    useComponent
                                        ? 'bg-slate-200 text-slate-800'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Use encodeURIComponent / decodeURIComponent"
                            >
                                Component
                            </button>
                            <button
                                onClick={() => setUseComponent(false)}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all uppercase tracking-tight ${
                                    !useComponent
                                        ? 'bg-slate-200 text-slate-800'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Use encodeURI / decodeURI"
                            >
                                Full URI
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setInput(''); setOutput(''); }}
                        className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight"
                        title="Clear all"
                    >
                        <TrashIcon className="h-5 w-5" /> Clear
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Input</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL-encoded text to decode...'}
                            className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-semibold text-slate-700">Output</label>
                            {output && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider"
                                >
                                    {copied ? (
                                        <>
                                            <CheckIcon className="h-3.5 w-3.5" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardIcon className="h-3.5 w-3.5" />
                                            <span>Copy Output</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className={`w-full h-64 p-4 rounded-xl border font-mono text-sm overflow-auto break-all ${
                            error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                            {error || output || <span className="text-slate-400 italic">Result will appear here...</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                    <ArrowRightIcon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="text-sm text-sky-800">
                    <p className="font-semibold mb-1">About URL Encoding</p>
                    <p className="opacity-80">
                        {useComponent 
                            ? 'Component mode (encodeURIComponent) is used for encoding values that will be part of a query string or path segment. It encodes almost all non-alphanumeric characters.' 
                            : 'Full URI mode (encodeURI) is used for encoding a complete URL. It leaves characters that have special meaning in URLs (like :, /, ?, #) unencoded.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UrlTool;
