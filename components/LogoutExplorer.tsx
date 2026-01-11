
import React, { useState } from 'react';
import { LogOutIcon, InfoIcon, ShieldIcon, ActivityIcon } from './icons';

const LogoutExplorer: React.FC = () => {
    const [protocol, setProtocol] = useState<'oidc' | 'saml'>('oidc');

    const oidcSteps = [
        { title: 'App Initiates', desc: 'App redirects user to IdP logout endpoint with id_token_hint.' },
        { title: 'IdP Session End', desc: 'IdP clears its session cookie.' },
        { title: 'Back-channel Logout', desc: 'IdP sends requests to other apps the user is logged into (optional).' },
        { title: 'Front-channel Logout', desc: 'IdP renders hidden iframes to trigger logout in other apps (optional).' },
        { title: 'Redirect Back', desc: 'IdP redirects user back to post_logout_redirect_uri.' }
    ];

    const samlSteps = [
        { title: 'SP Initiates', desc: 'SP sends &lt;LogoutRequest&gt; to IdP via Front-channel (Redirect/Post).' },
        { title: 'IdP Propagates', desc: 'IdP sends &lt;LogoutRequest&gt; to all other session participants.' },
        { title: 'Participants Respond', desc: 'Other SPs respond with &lt;LogoutResponse&gt;.' },
        { title: 'IdP Responds', desc: 'IdP sends final &lt;LogoutResponse&gt; back to the initiator.' },
        { title: 'Session Cleared', desc: 'All participants have cleared local sessions.' }
    ];

    const steps = protocol === 'oidc' ? oidcSteps : samlSteps;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Logout Flow Explorer</h2>
                <p className="text-slate-600 text-sm mb-4">Compare how OIDC and SAML handle terminating sessions across multiple applications (SLO).</p>
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                    <button 
                        onClick={() => setProtocol('oidc')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${protocol === 'oidc' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        OIDC RP-Initiated
                    </button>
                    <button 
                        onClick={() => setProtocol('saml')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${protocol === 'saml' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        SAML Single Logout (SLO)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {steps.map((step, i) => (
                    <div key={i} className="relative group">
                        <div className={`p-4 rounded-xl border-2 h-full ${protocol === 'oidc' ? 'bg-sky-50 border-sky-100' : 'bg-orange-50 border-orange-100'}`}>
                            <div className="text-[10px] font-bold text-slate-400 mb-1">STEP {i + 1}</div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                <ActivityIcon className={`h-4 w-4 ${protocol === 'oidc' ? 'text-sky-300' : 'text-orange-300'}`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                        <ShieldIcon className="h-3 w-3 mr-1 text-slate-500" /> Security Note
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                        Single Logout is notoriously difficult to implement reliably. Front-channel methods depend on browser cookies and can be blocked by modern browser privacy settings (ITP). Back-channel methods are more reliable but don't clear browser-side data.
                    </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                        <InfoIcon className="h-3 w-3 mr-1 text-slate-500" /> Terminology
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                        {protocol === 'oidc' 
                            ? 'RP (Relying Party) = The App. OP (OpenID Provider) = The IdP.' 
                            : 'SP (Service Provider) = The App. IdP (Identity Provider) = The Auth Server.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogoutExplorer;
