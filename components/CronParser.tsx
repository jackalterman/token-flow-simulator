
import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { RefreshIcon, InfoIcon, ClockIcon } from './icons';

// Using the same design pattern but we need ClockIcon. 
// I'll define a local ClockIcon if it's not in icons.tsx, 
// or I'll just use a generic one. Let's assume ClockIcon might be missing.

const ClockIconLocal: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CronParser: React.FC = () => {
    const [expression, setExpression] = useState('*/15 * * * *');
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const presets = [
        { label: 'Every Minute', value: '* * * * *' },
        { id: 2, label: 'Every 15 min', value: '*/15 * * * *' },
        { id: 3, label: 'Hourly', value: '0 * * * *' },
        { id: 4, label: 'Daily (Midnight)', value: '0 0 * * *' },
        { id: 5, label: 'Weekly (Sun)', value: '0 0 * * 0' },
        { id: 6, label: 'Monthly (1st)', value: '0 0 1 * *' },
    ];

    useEffect(() => {
        try {
            setError(null);
            if (!expression.trim()) {
                setExplanation('');
                return;
            }
            setExplanation(cronstrue.toString(expression));
        } catch (e: any) {
            setError(e.toString().replace('Error: ', ''));
            setExplanation('');
        }
    }, [expression]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-slate-800 uppercase tracking-tight ml-1">Cron Expression</label>
                            <input
                                type="text"
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-lg font-bold text-slate-800"
                                placeholder="* * * * *"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 md:w-64">
                            {presets.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setExpression(p.value)}
                                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:border-sky-200 hover:text-sky-600 hover:bg-sky-50 transition-all uppercase tracking-tight"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    {error ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center animate-fade-in">
                            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <InfoIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h4 className="text-red-800 font-bold mb-1">Invalid Expression</h4>
                            <p className="text-red-600/70 text-sm max-w-sm mx-auto">{error}</p>
                        </div>
                    ) : explanation ? (
                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-10 text-center animate-fade-in">
                            <div className="bg-sky-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ClockIconLocal className="h-8 w-8 text-sky-600" />
                            </div>
                            <h4 className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.2em] mb-3">Next Schedule</h4>
                            <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                                "{explanation}"
                            </p>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 italic">
                            Enter a cron expression above to see a human-readable explanation.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: 'Minute', range: '0-59' },
                    { label: 'Hour', range: '0-23' },
                    { label: 'Day (Month)', range: '1-31' },
                    { label: 'Month', range: '1-12' },
                    { label: 'Day (Week)', range: '0-6' },
                ].map((col, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{col.label}</div>
                        <div className="text-xs font-mono font-bold text-slate-700">{col.range}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CronParser;
