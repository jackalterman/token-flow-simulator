
import React from 'react';
import { AppView } from './Sidebar';

const Card: React.FC<{ title: string; children: React.ReactNode; onLinkClick?: () => void; linkText?: string }> = ({ title, children, onLinkClick, linkText }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col h-full">
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <div className="text-slate-600 space-y-3 prose prose-sm max-w-none flex-1">
            {children}
        </div>
        {onLinkClick && (
            <button 
                onClick={onLinkClick} 
                className="mt-4 text-sky-600 hover:text-sky-700 text-sm font-bold flex items-center transition-colors border-t border-slate-100 pt-3"
            >
                {linkText || 'Try the Tool'} →
            </button>
        )}
    </div>
);

interface LearnFlowsProps {
    setActiveView: (view: AppView) => void;
}

const LearnFlows: React.FC<LearnFlowsProps> = ({ setActiveView }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Learning Center</h2>
        <p className="text-slate-600 max-w-3xl text-sm">
            Deep dive into the protocols and attacks supported by Security Tribe Toolkit. Click on any card to jump to the corresponding tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="What is a JWT?" onLinkClick={() => setActiveView(AppView.DECODE)} linkText="Go to JWT Decoder">
          <p>
            A JSON Web Token (JWT) is a compact, URL-safe means of representing claims...
          </p>
          <ul className="text-xs">
            <li><strong>Header:</strong> Metadata (alg, typ).</li>
            <li><strong>Payload:</strong> The claims (sub, iss, exp).</li>
            <li><strong>Signature:</strong> Cryptographic integrity check.</li>
          </ul>
        </Card>

        <Card title="Authorization Code Flow" onLinkClick={() => setActiveView(AppView.FLOWS)} linkText="Visualize the Flow">
          <p>The gold standard for secure OAuth 2.0. Exchanges an <strong>Auth Code</strong> for a <strong>Token</strong> via a secure backend channel.</p>
        </Card>

        <Card title="Client Assertions (private_key_jwt)" onLinkClick={() => setActiveView(AppView.OIDC_ASSERTION)} linkText="Generate Assertion">
          <p>Used to authenticate a client to an IdP without sharing a persistent Client Secret.</p>
          <p className="text-[10px] bg-slate-50 p-2 rounded">
            <strong>Real-world test:</strong> Create a key in <button onClick={() => setActiveView(AppView.KEYS)} className="text-sky-600 underline">Key Manager</button>, 
            upload public key to Google/Okta, then generate the assertion here to request tokens.
          </p>
        </Card>

        <Card title="Device Code Flow" onLinkClick={() => setActiveView(AppView.DEVICE_FLOW)} linkText="View TV Flow Simulation">
          <p>Designed for input-constrained devices (Smart TVs, CLIs). The device displays a code, and the user approves via a smartphone.</p>
        </Card>

        <Card title="XSW Attack (XML Signature Wrapping)" onLinkClick={() => setActiveView(AppView.XSW_SIMULATOR)} linkText="Try XSW Attack">
          <p>A classic SAML vulnerability where an attacker "wraps" a valid signature around malicious data to trick the Service Provider.</p>
        </Card>

        <Card title="SAML Single Logout (SLO)" onLinkClick={() => setActiveView(AppView.LOGOUT_EXPLORER)} linkText="Explore Logout Flows">
          <p>Terminating sessions across multiple apps at once. OIDC uses IFrames or Back-channels, while SAML uses Redirect/POST sequences.</p>
        </Card>

        <Card title="SAML Metadata & Requests" onLinkClick={() => setActiveView(AppView.SAML)} linkText="Open SAML Tools">
          <p>SAML is driven by trust metadata. SPs and IdPs exchange XML files containing certificates and endpoint URLs before they can communicate.</p>
        </Card>

        <Card title="Refresh Tokens">
          <p>Long-lived credentials used to fetch new Access Tokens. Should be stored as <code>HttpOnly</code> cookies to prevent XSS theft.</p>
        </Card>

        <Card title="OpenID Connect (OIDC)" onLinkClick={() => setActiveView(AppView.OIDC_DISCOVERY)} linkText="Explore OIDC Discovery">
          <p>An identity layer on top of OAuth 2.0. It standardizes how apps discover IdP endpoints and fetch user profile data.</p>
        </Card>
      </div>
    </div>
  );
};

export default LearnFlows;
