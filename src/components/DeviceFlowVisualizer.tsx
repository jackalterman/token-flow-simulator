
import React, { useState, useEffect } from 'react';
import { MonitorIcon, SmartphoneIcon, ServerIcon, RefreshCwIcon, CheckCircleIcon } from './icons';

const DeviceFlowVisualizer: React.FC = () => {
    const [step, setStep] = useState(0);
    const [userCode, setUserCode] = useState('');
    const [verificationUri, setVerificationUri] = useState('https://auth.example.com/activate');
    const [polling, setPolling] = useState(false);
    const [status, setStatus] = useState('Waiting for initiate...');

    const initiate = () => {
        setUserCode(Math.random().toString(36).substring(2, 10).toUpperCase());
        setStep(1);
        setStatus('User code generated. Polling for authorization...');
    };

    const startPolling = () => {
        setPolling(true);
        setStatus('Polling /token endpoint...');
        // Simulate polling delay
        setTimeout(() => {
            setPolling(false);
            setStep(3);
            setStatus('Authorized! Token received.');
        }, 5000);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Device Flow Visualizer</h2>
                <p className="text-slate-600 text-sm mb-4">See how input-constrained devices (like Smart TVs) get tokens using another device.</p>
                <button onClick={initiate} className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-sm">Start Device Flow</button>
            </div>

            <div className="grid grid-cols-3 gap-8 relative">
                {/* Visual Connector Lines */}
                <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10"></div>

                {/* Device 1: Smart TV */}
                <div className={`p-6 bg-white rounded-xl border-2 transition-all duration-500 ${step === 1 ? 'border-sky-500 shadow-lg scale-105' : 'border-slate-200 opacity-60'}`}>
                    <div className="flex flex-col items-center">
                        <MonitorIcon className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="font-bold text-slate-900">Input-Constrained Device</h3>
                        <p className="text-[10px] text-slate-500 text-center mt-2">Smart TV / CLI</p>
                        
                        {step >= 1 && (
                            <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200 w-full text-center">
                                <p className="text-xs text-slate-500 mb-1">Enter code at: <br/><strong>{verificationUri}</strong></p>
                                <p className="text-lg font-mono font-bold text-sky-600 leading-tight">{userCode}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Device 2: Smartphone */}
                <div className={`p-6 bg-white rounded-xl border-2 transition-all duration-500 ${step === 2 ? 'border-sky-500 shadow-lg scale-105' : 'border-slate-200 opacity-60'}`}>
                    <div className="flex flex-col items-center">
                        <SmartphoneIcon className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="font-bold text-slate-900">User's Device</h3>
                        <p className="text-[10px] text-slate-500 text-center mt-2">Mobile / PC</p>
                        
                        <div className="mt-4 w-full">
                           <button 
                             onClick={() => setStep(2)} 
                             disabled={step !== 1}
                             className="w-full px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300 disabled:opacity-30"
                           >
                             Simulate User Action
                           </button>
                           {step === 2 && (
                               <div className="mt-2 animate-pulse text-[10px] text-center text-green-600 font-bold">
                                   Authorizing...
                               </div>
                           )}
                        </div>
                    </div>
                </div>

                {/* Authorization Server */}
                <div className={`p-6 bg-white rounded-xl border-2 transition-all duration-500 ${step === 3 ? 'border-green-500 shadow-lg scale-105' : 'border-slate-200 opacity-60'}`}>
                    <div className="flex flex-col items-center">
                        <ServerIcon className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="font-bold text-slate-900">Auth Server</h3>
                        <p className="text-[10px] text-slate-500 text-center mt-2">Identity Provider</p>
                        
                        {step >= 1 && (
                            <div className="mt-4 w-full text-center">
                                {polling && <RefreshCwIcon className="h-4 w-4 animate-spin mx-auto text-sky-500" />}
                                <p className="text-[10px] font-mono mt-1">{status}</p>
                                {step === 3 && <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mt-2" />}
                            </div>
                        )}
                        
                        {step >= 1 && step < 3 && !polling && (
                             <button 
                             onClick={startPolling} 
                             className="mt-4 w-full px-2 py-1 bg-sky-100 text-sky-700 text-[10px] font-bold rounded border border-sky-300 hover:bg-sky-200 transition-colors"
                           >
                             {step === 2 ? 'Complete Flow' : 'Start Polling'}
                           </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-lg border border-sky-100 text-xs text-sky-800">
                <p className="font-bold mb-1">Process Flow:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Device requests access from Auth Server.</li>
                    <li>Server returns <strong>user_code</strong> and <strong>verification_uri</strong>.</li>
                    <li>Device displays info to user while <strong>polling</strong> the server.</li>
                    <li>User visits URI on another device, enters code, and logs in.</li>
                    <li>Server acknowledges user and returns token to the polling device.</li>
                </ol>
            </div>
        </div>
    );
};

export default DeviceFlowVisualizer;
