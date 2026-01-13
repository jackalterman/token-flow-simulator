
import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import CryptoJS from 'crypto-js';
import { ClipboardIcon, CheckIcon, RefreshIcon, ShieldCheckIcon, TrashIcon } from './icons';

type HmacAlgo = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

const HmacTool: React.FC = () => {
    const [input, setInput] = usePersistentState('hmac-input', '');
    const [secret, setSecret] = usePersistentState('hmac-secret', '');
    const [algo, setAlgo] = usePersistentState<HmacAlgo>('hmac-algo', 'SHA256');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!input || !secret) {
            setOutput('');
            return;
        }

        let hmac;
        switch (algo) {
            case 'MD5': hmac = CryptoJS.HmacMD5(input, secret); break;
            case 'SHA1': hmac = CryptoJS.HmacSHA1(input, secret); break;
            case 'SHA256': hmac = CryptoJS.HmacSHA256(input, secret); break;
            case 'SHA512': hmac = CryptoJS.HmacSHA512(input, secret); break;
            default: hmac = CryptoJS.HmacSHA256(input, secret);
        }
        setOutput(hmac.toString());
    }, [input, secret, algo]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {(['MD5', 'SHA1', 'SHA256', 'SHA512'] as HmacAlgo[]).map((a) => (
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
                        onClick={() => { setInput(''); setSecret(''); setOutput(''); }}
                        className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight"
                        title="Clear all"
                    >
                        <TrashIcon className="h-5 w-5" /> Clear
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Input Text / Message</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter message to sign..."
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Secret Key</label>
                            <textarea
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="Enter secret key..."
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-semibold text-slate-700">HMAC Output ({algo})</label>
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
                                            <span>Copy HMAC</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 break-all min-h-[5rem]">
                            {output || <span className="text-slate-400 italic">HMAC will appear here...</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                    <ShieldCheckIcon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="text-sm text-sky-800">
                    <p className="font-semibold mb-1">About HMAC</p>
                    <p className="opacity-80">
                        HMAC (Hash-based Message Authentication Code) is a specific type of message authentication code (MAC) involving a cryptographic hash function and a secret cryptographic key. It may be used to simultaneously verify both the data integrity and the authenticity of a message.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HmacTool;
