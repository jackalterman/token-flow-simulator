
import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import zxcvbn from 'zxcvbn';
import { ShieldCheckIcon, AlertTriangleIcon, KeyIcon, TrashIcon } from './icons';

const PasswordAnalyzer: React.FC = () => {
    const [password, setPassword] = usePersistentState('password-analyzer-input', '');
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        if (!password) {
            setAnalysis(null);
            return;
        }
        setAnalysis(zxcvbn(password));
    }, [password]);

    const getStrengthColor = (score: number) => {
        switch (score) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-orange-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-slate-200';
        }
    };

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Moderate';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return 'Enter Password';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-baseline mb-3">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Analyze Password</h3>
                        <button 
                            onClick={() => setPassword('')}
                            className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-tight flex items-center gap-1"
                        >
                            <TrashIcon className="h-3 w-3" /> Clear
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm pr-12"
                            placeholder="Enter a password to test..."
                            autoComplete="off"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <KeyIcon className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {analysis ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-sm font-bold text-slate-600">{getStrengthLabel(analysis.score)}</span>
                                    <span className="text-xs font-medium text-slate-400">Score: {analysis.score}/4</span>
                                </div>
                                <div className="flex h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <div 
                                            key={i}
                                            className={`flex-1 transition-all duration-500 border-r border-white last:border-0 ${
                                                i <= analysis.score ? getStrengthColor(analysis.score) : 'bg-transparent'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entropy & Brute Force</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Guesses needed:</span>
                                            <span className="font-mono font-bold text-slate-700">10<sup>{Math.round(analysis.guesses_log10)}</sup></span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Crack time (Online):</span>
                                            <span className="font-bold text-slate-700">{analysis.crack_times_display.online_no_throttling_10_per_second}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Crack time (Offline):</span>
                                            <span className="font-bold text-slate-700">{analysis.crack_times_display.offline_fast_hashing_1e10_per_second}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Security Feedback</h4>
                                    {analysis.feedback.warning || analysis.feedback.suggestions.length > 0 ? (
                                        <div className="space-y-3">
                                            {analysis.feedback.warning && (
                                                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                    <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs font-medium">{analysis.feedback.warning}</span>
                                                </div>
                                            )}
                                            {analysis.feedback.suggestions.map((s: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-sky-700 bg-sky-50 p-3 rounded-lg border border-sky-100">
                                                    <ShieldCheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs font-medium">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100">
                                            <ShieldCheckIcon className="h-5 w-5" />
                                            <span className="text-sm font-bold">This is a very strong password!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 italic">
                            Enter a password above to see strength analysis and crack time estimates.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordAnalyzer;
