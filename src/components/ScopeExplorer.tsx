
import React, { useState } from 'react';
import { SearchIcon, EyeIcon } from './icons';

const scopes = [
    { name: 'openid', desc: 'REQUIRED. Informs the Authorization Server that the client is making an OpenID Connect request.', claims: ['sub'] },
    { name: 'profile', desc: 'OPTIONAL. Requests access to the end-user\'s default profile claims.', claims: ['name', 'family_name', 'given_name', 'middle_name', 'nickname', 'preferred_username', 'profile', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'updated_at'] },
    { name: 'email', desc: 'OPTIONAL. Requests access to the email and email_verified claims.', claims: ['email', 'email_verified'] },
    { name: 'address', desc: 'OPTIONAL. Requests access to the address claim.', claims: ['address'] },
    { name: 'phone', desc: 'OPTIONAL. Requests access to the phone_number and phone_number_verified claims.', claims: ['phone_number', 'phone_number_verified'] },
    { name: 'offline_access', desc: 'OPTIONAL. Requests a Refresh Token to be issued.', claims: ['(Refresh Token)'] },
];

const ScopeExplorer: React.FC = () => {
  const [activeScope, setActiveScope] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Scope Explorer</h2>
            <p className="text-slate-600 mb-6">Understanding Standard OIDC Scopes and their mapping to User Claims.</p>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {scopes.map(scope => (
                    <button
                        key={scope.name}
                        onClick={() => setActiveScope(scope.name)}
                        className={`w-full text-left px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center ${activeScope === scope.name ? 'bg-sky-50 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'}`}
                    >
                        <span className="font-mono font-bold text-sky-700">{scope.name}</span>
                        <ArrowRightIcon className="h-4 w-4 text-slate-300" />
                    </button>
                ))}
            </div>
        </div>

        <div className="lg:col-span-2">
            {activeScope ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full">
                    {scopes.filter(s => s.name === activeScope).map(s => (
                        <div key={s.name} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <SearchIcon className="h-6 w-6 text-sky-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 font-mono">{s.name}</h3>
                            </div>
                            <p className="text-lg text-slate-600 mb-8 border-b border-slate-100 pb-6">{s.desc}</p>
                            
                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Associated Claims</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {s.claims.map(claim => (
                                    <div key={claim} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-mono text-sm">
                                        <EyeIcon className="h-4 w-4 text-slate-400" />
                                        {claim}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 p-12 text-center">
                    <SearchIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p>Select a scope on the left to view details.</p>
                </div>
            )}
        </div>
    </div>
  );
};

const ArrowRightIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default ScopeExplorer;
