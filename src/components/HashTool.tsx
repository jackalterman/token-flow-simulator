
import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import CryptoJS from 'crypto-js';
import { ClipboardIcon, CheckIcon, RefreshIcon, KeyIcon, TrashIcon } from './icons';

type HashAlgo = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

const HashTool: React.FC = () => {
    const [input, setInput] = usePersistentState('hash-input', '');
    const [algo, setAlgo] = usePersistentState<HashAlgo>('hash-algo', 'SHA256');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!input) {
            setOutput('');
            return;
        }

        let hashed;
        switch (algo) {
            case 'MD5': hashed = CryptoJS.MD5(input); break;
            case 'SHA1': hashed = CryptoJS.SHA1(input); break;
            case 'SHA256': hashed = CryptoJS.SHA256(input); break;
            case 'SHA512': hashed = CryptoJS.SHA512(input); break;
            default: hashed = CryptoJS.SHA256(input);
        }
        setOutput(hashed.toString());
    }, [input, algo]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {(['MD5', 'SHA1', 'SHA256', 'SHA512'] as HashAlgo[]).map((a) => (
                            <button
                                key={a}
                                onClick={() => setAlgo(a)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    algo === a
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => { setInput(''); setOutput(''); }}
                        className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight"
                        title="Clear all"
                    >
                        <TrashIcon className="h-5 w-5" /> Clear
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Input Text</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to hash..."
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-semibold text-slate-700">Hash Output ({algo})</label>
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
                                            <span>Copy Hash</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 break-all min-h-[5rem]">
                            {output || <span className="text-slate-400 italic">Hash will appear here...</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                    <KeyIcon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="text-sm text-sky-800">
                    <p className="font-semibold mb-1">About {algo}</p>
                    <p className="opacity-80">
                        A cryptographic hash function is a mathematical algorithm that maps data of arbitrary size to a bit string of a fixed size. It is a one-way function, meaning it is infeasible to invert.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HashTool;
