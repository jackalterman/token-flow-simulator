
import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon, RefreshIcon } from './icons';

const Base64Tool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isUrlSafe, setIsUrlSafe] = useState(false);
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
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
                let encoded = btoa(input);
                if (isUrlSafe) {
                    encoded = encoded
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                }
                setOutput(encoded);
            } else {
                let toDecode = input;
                if (isUrlSafe) {
                    toDecode = toDecode
                        .replace(/-/g, '+')
                        .replace(/_/g, '/');
                    while (toDecode.length % 4 !== 0) {
                        toDecode += '=';
                    }
                }
                setOutput(atob(toDecode));
            }
        } catch (e) {
            setError(mode === 'encode' ? 'Error encoding string' : 'Invalid Base64 input');
            setOutput('');
        }
    }, [input, isUrlSafe, mode]);

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
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isUrlSafe}
                                onChange={(e) => setIsUrlSafe(e.target.checked)}
                                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Url Safe</span>
                        </label>
                    </div>
                    <button 
                        onClick={() => { setInput(''); setOutput(''); }}
                        className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Clear all"
                    >
                        <RefreshIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Input</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
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
                    <RefreshIcon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="text-sm text-sky-800">
                    <p className="font-semibold mb-1">About Base64{isUrlSafe && ' URL-Safe'}</p>
                    <p className="opacity-80">
                        {mode === 'encode' 
                            ? 'Encoding binary data or text to Base64 makes it safe for transport across systems that only support text.' 
                            : 'Decoding Base64 restores the original data from its encoded textual representation.'}
                        {isUrlSafe && ' URL-safe mode uses - and _ instead of + and / to avoid issues in URL components.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Base64Tool;
