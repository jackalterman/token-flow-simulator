import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import zxcvbn from 'zxcvbn';
import { ShieldCheckIcon, AlertTriangleIcon, KeyIcon, TrashIcon, RefreshIcon, CheckCircleIcon } from './icons';

const PasswordAnalyzer: React.FC = () => {
    const [password, setPassword] = usePersistentState('password-analyzer-input', '');
    const [analysis, setAnalysis] = useState<any>(null);

    // Generator State
    const [showGenerator, setShowGenerator] = useState(false);
    const [genLength, setGenLength] = useState(16);
    const [genOptions, setGenOptions] = useState({
        upper: true,
        lower: true,
        numbers: true,
        symbols: true
    });

    useEffect(() => {
        if (!password) {
            setAnalysis(null);
            return;
        }
        setAnalysis(zxcvbn(password));
    }, [password]);

    const generatePassword = () => {
        const charset = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
        };

        let chars = "";
        if (genOptions.upper) chars += charset.upper;
        if (genOptions.lower) chars += charset.lower;
        if (genOptions.numbers) chars += charset.numbers;
        if (genOptions.symbols) chars += charset.symbols;

        if (chars === "") return; // Safety check

        const array = new Uint32Array(genLength);
        crypto.getRandomValues(array);
        
        let result = "";
        for (let i = 0; i < genLength; i++) {
            result += chars[array[i] % chars.length];
        }

        setPassword(result);
        setShowGenerator(false);
    };

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
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowGenerator(!showGenerator)}
                                className={`text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 transition-colors ${showGenerator ? 'text-sky-600' : 'text-slate-500 hover:text-sky-600'}`}
                            >
                                <RefreshIcon className="h-3 w-3" /> Generator
                            </button>
                            <button 
                                onClick={() => setPassword('')}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-tight flex items-center gap-1"
                            >
                                <TrashIcon className="h-3 w-3" /> Clear
                            </button>
                        </div>
                    </div>

                    {showGenerator && (
                        <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in-down">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Length: {genLength}</label>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="8" 
                                        max="64" 
                                        value={genLength} 
                                        onChange={(e) => setGenLength(parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {(['upper', 'lower', 'numbers', 'symbols'] as const).map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${genOptions[opt] ? 'bg-sky-500 border-sky-500' : 'bg-white border-slate-300 group-hover:border-sky-400'}`}>
                                                {genOptions[opt] && <CheckCircleIcon className="h-3 w-3 text-white" />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={genOptions[opt]}
                                                onChange={() => setGenOptions(prev => ({...prev, [opt]: !prev[opt]}))}
                                            />
                                            <span className="text-xs font-medium text-slate-600 capitalize">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <button 
                                    onClick={generatePassword}
                                    disabled={!Object.values(genOptions).some(Boolean)}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generate & Use Password
                                </button>
                            </div>
                        </div>
                    )}

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
