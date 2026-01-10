
import React, { useState, useEffect } from 'react';
import { ulid } from 'ulid';
import { ClipboardIcon, CheckIcon, RefreshIcon } from './icons';

const UuidGenerator: React.FC = () => {
    const [count, setCount] = useState(5);
    const [type, setType] = useState<'uuid' | 'ulid'>('uuid');
    const [results, setResults] = useState<string[]>([]);
    const [copiedAll, setCopiedAll] = useState(false);

    const generate = () => {
        const newResults = Array.from({ length: Math.min(count, 50) }, () => 
            type === 'uuid' ? crypto.randomUUID() : ulid()
        );
        setResults(newResults);
    };

    useEffect(() => {
        generate();
    }, [type]);

    const copyAll = () => {
        navigator.clipboard.writeText(results.join('\n'));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setType('uuid')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    type === 'uuid'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                UUID v4
                            </button>
                            <button
                                onClick={() => setType('ulid')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    type === 'ulid'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                ULID
                            </button>
                        </div>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                            className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={copyAll}
                            className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-wider"
                        >
                            {copiedAll ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                            <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
                        </button>
                        <button
                            onClick={generate}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-sky-600 hover:border-sky-100 hover:bg-sky-50 transition-all shadow-sm"
                            title="Regenerate"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-slate-900 rounded-xl overflow-hidden">
                        <div className="p-6 space-y-2 font-mono text-sm text-sky-300 overflow-x-auto">
                            {results.map((r, i) => (
                                <div key={i} className="flex items-center group">
                                    <span className="w-8 text-slate-600 text-xs select-none">{i + 1}</span>
                                    <span className="flex-1">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight mb-2">About UUID v4</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Universally Unique Identifier version 4. Randomly generated using cryptographically strong random numbers. Probability of collision is virtually zero.
                    </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight mb-2">About ULID</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Universally Unique Lexicographically Sortable Identifier. Combining timestamps (48-bit) and randomness (80-bit), making them sortable while retaining high entropy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UuidGenerator;
