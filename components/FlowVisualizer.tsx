
import React, { useState, useEffect } from 'react';
import { jwtService } from '../services/jwtService';
import { xmlService } from '../services/xmlService';
import { DecoderData } from '../types';
import { UsersIcon, ServerIcon, SendIcon, SettingsIcon, FileCodeIcon, KeyIcon } from './icons';

interface FlowVisualizerProps {
  onSendToDecoder: (data: DecoderData) => void;
}

// SVG Components
const Node: React.FC<{ x: number; y: number; title: string; icon: React.ReactNode; active: boolean }> = ({ x, y, title, icon, active }) => (
    <g transform={`translate(${x}, ${y})`} className="transition-all duration-500">
        <circle cx="0" cy="0" r="35" className={`${active ? 'fill-sky-100 stroke-sky-500' : 'fill-white stroke-slate-300'} stroke-2 transition-colors duration-500`} />
        <foreignObject x="-20" y="-20" width="40" height="40">
            <div className={`flex items-center justify-center h-full w-full ${active ? 'text-sky-600' : 'text-slate-400'}`}>
                {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
            </div>
        </foreignObject>
        <text x="0" y="55" textAnchor="middle" className={`text-sm font-semibold ${active ? 'fill-sky-700' : 'fill-slate-500'}`}>{title}</text>
    </g>
);

const Connection: React.FC<{ from: {x: number, y: number}, to: {x: number, y: number}, active: boolean }> = ({ from, to, active }) => {
     const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
     const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
     const drawLength = length - 70; 

     return (
        <g transform={`translate(${from.x}, ${from.y}) rotate(${angle})`}>
            <line x1="35" y1="0" x2={length - 35} y2="0" className={`${active ? 'stroke-sky-400' : 'stroke-slate-200'} stroke-2`} strokeDasharray="4 4" />
             {active && (
                 <path d={`M ${length - 40} -5 L ${length - 35} 0 L ${length - 40} 5`} className="fill-none stroke-sky-500 stroke-2" />
             )}
        </g>
     );
}

const Packet: React.FC<{ from: {x: number, y: number}, to: {x: number, y: number}, label: string }> = ({ from, to, label }) => {
    return (
        <g>
            <circle r="6" className="fill-sky-500">
                <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                    keyPoints="0.1;0.9"
                    keyTimes="0;1"
                />
            </circle>
             <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10} textAnchor="middle" className="text-xs fill-sky-600 font-mono bg-white">{label}</text>
        </g>
    )
}

const oauthSteps = [
  { 
    title: "1. User Initiates Login",
    description: "The user clicks 'Login' in the app. The browser is redirected to the Auth Server.",
    from: 'user', to: 'client',
    nodes: { active: ['user', 'client'], packet: { from: 'user', to: 'client', label: 'Click' } },
    details: {
        type: 'Browser Redirect',
        content: `GET https://auth-server.com/authorize?
  response_type=code
  &client_id=CLIENT_123
  &redirect_uri=https://app.com/cb
  &scope=openid profile`
    }
  },
  {
    title: "2. Redirect to Auth Server",
    description: "The Client App redirects the User Agent (Browser) to the Authorization Server's login page.",
    from: 'client', to: 'auth',
    nodes: { active: ['client', 'auth'], packet: { from: 'client', to: 'auth', label: 'Redirect' } },
    details: null
  },
  {
    title: "3. Authentication & Consent",
    description: "The user enters credentials at the Auth Server and grants permission.",
    from: 'user', to: 'auth',
    nodes: { active: ['user', 'auth'], packet: { from: 'user', to: 'auth', label: 'Creds' } },
    details: null
  },
  {
    title: "4. Authorization Code Issue",
    description: "Auth Server redirects browser back to Client with a short-lived 'Authorization Code'.",
    from: 'auth', to: 'client',
    nodes: { active: ['auth', 'client'], packet: { from: 'auth', to: 'client', label: 'code=xyz' } },
    details: {
        type: 'Callback URL',
        content: `GET https://app.com/cb?code=AUTH_CODE_XYZ`
    }
  },
  {
    title: "5. Token Exchange (Backchannel)",
    description: "Client exchanges the code + client_secret for tokens directly with Auth Server. User never sees this.",
    from: 'client', to: 'auth',
    nodes: { active: ['client', 'auth'], packet: { from: 'client', to: 'auth', label: 'POST /token' } },
    details: {
        type: 'POST Request',
        content: `POST /token
grant_type=authorization_code
&code=AUTH_CODE_XYZ
&client_secret=SECRET_KEY`
    }
  },
  {
    title: "6. Tokens Returned",
    description: "Auth Server validates code and secret, then returns Access Token (and ID/Refresh tokens).",
    from: 'auth', to: 'client',
    nodes: { active: ['auth', 'client'], packet: { from: 'auth', to: 'client', label: '{ tokens }' } },
    details: {
        type: 'JSON Response',
        content: `{
  "access_token": "eyJhbG...",
  "id_token": "eyJraWQ...",
  "expires_in": 3600
}`
    }
  },
  {
    title: "7. Access Resource",
    description: "Client uses Access Token to fetch data from the Resource Server (API).",
    from: 'client', to: 'api',
    nodes: { active: ['client', 'api'], packet: { from: 'client', to: 'api', label: 'Bearer Token' } },
    details: {
        type: 'API Request',
        content: `GET /api/user
Authorization: Bearer eyJhbG...`
    }
  },
];

const samlSteps = [
    {
        title: "1. Access Attempt",
        description: "User attempts to access a secured resource on the Service Provider (SP).",
        from: 'user', to: 'client', // Client is SP here
        nodes: { active: ['user', 'client'], packet: { from: 'user', to: 'client', label: 'Request' } },
        details: { type: 'HTTP Request', content: 'GET /secured-resource' }
    },
    {
        title: "2. Redirect to IdP",
        description: "SP detects no session, generates SAMLRequest, and redirects browser to Identity Provider (IdP).",
        from: 'client', to: 'auth', // Auth is IdP
        nodes: { active: ['client', 'auth'], packet: { from: 'client', to: 'auth', label: 'SAMLRequest' } },
        details: { type: 'HTTP 302 Redirect', content: 'Location: https://idp.com/sso?SAMLRequest=...' }
    },
    {
        title: "3. Authentication",
        description: "User authenticates with the IdP (if not already logged in).",
        from: 'user', to: 'auth',
        nodes: { active: ['user', 'auth'], packet: { from: 'user', to: 'auth', label: 'Login' } },
        details: null
    },
    {
        title: "4. SAML Response Generation",
        description: "IdP generates a SAML Response containing a signed assertion about the user.",
        from: 'auth', to: 'user', // User agent mediates the POST
        nodes: { active: ['auth', 'user'], packet: { from: 'auth', to: 'user', label: 'Form HTML' } },
        details: { type: 'HTML Form', content: '<form action="https://sp.com/acs" method="POST">...</form>' }
    },
    {
        title: "5. POST to SP (ACS)",
        description: "Browser auto-submits the form, POSTing the signed SAMLResponse to the SP's Assertion Consumer Service (ACS).",
        from: 'user', to: 'client',
        nodes: { active: ['user', 'client'], packet: { from: 'user', to: 'client', label: 'SAMLResponse' } },
        details: { type: 'HTTP POST', content: 'SAMLResponse=PHNhbWxwOlJlc3Bvbn...' }
    },
    {
        title: "6. Session Established",
        description: "SP verifies the signature and attributes, then creates a local session for the user.",
        from: 'client', to: 'client',
        nodes: { active: ['client'], packet: { from: 'client', to: 'client', label: 'Session' } },
        details: null
    }
];

const deviceSteps = [
    {
        title: "1. Device Code Request",
        description: "The input-constrained device (TV, console) calls the Auth Server to start flow.",
        from: 'client', to: 'auth',
        nodes: { active: ['client', 'auth'], packet: { from: 'client', to: 'auth', label: 'POST /device' } },
        details: { type: 'POST', content: 'client_id=123&scope=openid' }
    },
    {
        title: "2. Code Display",
        description: "Auth Server returns a `user_code` (e.g., BCD-123) and `verification_uri`. Device shows these to user.",
        from: 'auth', to: 'client',
        nodes: { active: ['auth', 'client'], packet: { from: 'auth', to: 'client', label: 'user_code' } },
        details: { type: 'JSON', content: '{"user_code": "BCD-123", "verification_uri": "app.com/activate"}' }
    },
    {
        title: "3. User Activation",
        description: "User takes out their phone/laptop, goes to the URI, and enters the code.",
        from: 'user', to: 'auth', // User uses secondary device (represented by user node here)
        nodes: { active: ['user', 'auth'], packet: { from: 'user', to: 'auth', label: 'Enter Code' } },
        details: { type: 'Browser', content: 'User enters "BCD-123"' }
    },
    {
        title: "4. Polling",
        description: "Meanwhile, the Device polls the Auth Server: 'Is the user done yet?'",
        from: 'client', to: 'auth',
        nodes: { active: ['client', 'auth'], packet: { from: 'client', to: 'auth', label: 'Poll...' } },
        details: { type: 'POST /token', content: 'grant_type=device_code&device_code=...' }
    },
    {
        title: "5. Token Issue",
        description: "Once user approves on phone, the next poll from Device receives the tokens.",
        from: 'auth', to: 'client',
        nodes: { active: ['auth', 'client'], packet: { from: 'auth', to: 'client', label: '{ tokens }' } },
        details: { type: 'JSON', content: '{"access_token": "..."}' }
    }
];

const FlowVisualizer: React.FC<FlowVisualizerProps> = ({ onSendToDecoder }) => {
  const [flowType, setFlowType] = useState<'oauth' | 'saml' | 'device'>('oauth');
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedData, setGeneratedData] = useState<string>('');

  const steps = flowType === 'oauth' ? oauthSteps : (flowType === 'saml' ? samlSteps : deviceSteps);

  useEffect(() => {
      setCurrentStep(0);
      generateData();
  }, [flowType]);

  const generateData = async () => {
    if (flowType !== 'saml') {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = { 
            iss: 'https://auth-server.com',
            sub: 'user-789',
            aud: 'https://api.resource-server.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            scope: flowType === 'oauth' ? 'profile email' : 'device_sso'
        };
        const token = await jwtService.sign(header, payload, 'super-secret-key-for-resource-server');
        setGeneratedData(token);
    } else {
        const xml = xmlService.generateMockSamlResponse({
            issuer: 'https://idp.example.com',
            subject: 'user@example.com',
            audience: 'https://sp.example.com',
            acsUrl: 'https://sp.example.com/acs',
            attributes: { role: 'admin' }
        });
        setGeneratedData(xml);
    }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const handleInspect = () => {
      if (flowType !== 'saml') {
          onSendToDecoder({
            token: generatedData,
            key: 'super-secret-key-for-resource-server',
            audience: 'https://api.resource-server.com',
            issuer: 'https://auth-server.com',
        });
      } else {
          alert("SAML data generated! Go to the 'SAML' tab and paste it to inspect.");
      }
  };

  const step = steps[currentStep];
  
  const coords: Record<string, {x: number, y: number}> = {
      user: { x: 100, y: 200 },
      client: { x: 300, y: 300 },
      auth: { x: 500, y: 100 },
      api: { x: 700, y: 300 },
  };

  const isConnectionActive = (n1: string, n2: string) => {
      const a = step.nodes.active;
      return a.includes(n1) && a.includes(n2);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
             <h2 className="text-2xl font-bold text-slate-900">Flow Visualizer</h2>
             <p className="text-slate-600">Interactive walkthroughs of standard authentication protocols.</p>
         </div>
         <div className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1">
             <button 
                onClick={() => setFlowType('oauth')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-colors ${flowType === 'oauth' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                OAuth 2.0
            </button>
            <button 
                onClick={() => setFlowType('saml')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-colors ${flowType === 'saml' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                SAML 2.0
            </button>
             <button 
                onClick={() => setFlowType('device')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-colors ${flowType === 'device' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Device Flow
            </button>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 relative h-[400px]">
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <Connection from={coords.user} to={coords.client} active={isConnectionActive('user', 'client')} />
                <Connection from={coords.client} to={coords.auth} active={isConnectionActive('client', 'auth')} />
                <Connection from={coords.user} to={coords.auth} active={isConnectionActive('user', 'auth')} />
                <Connection from={coords.auth} to={coords.client} active={isConnectionActive('auth', 'client')} />
                {flowType === 'oauth' && <Connection from={coords.client} to={coords.api} active={isConnectionActive('client', 'api')} />}

                <Node x={coords.user.x} y={coords.user.y} title={flowType === 'device' ? "User (Phone)" : "User Agent"} icon={<UsersIcon />} active={step.nodes.active.includes('user')} />
                <Node x={coords.client.x} y={coords.client.y} title={flowType === 'saml' ? "Service Provider" : (flowType === 'device' ? "Device (TV)" : "Client App")} icon={<SettingsIcon />} active={step.nodes.active.includes('client')} />
                <Node x={coords.auth.x} y={coords.auth.y} title={flowType === 'saml' ? "Identity Provider" : "Auth Server"} icon={<KeyIcon />} active={step.nodes.active.includes('auth')} />
                {flowType === 'oauth' && <Node x={coords.api.x} y={coords.api.y} title="API" icon={<ServerIcon />} active={step.nodes.active.includes('api')} />}

                <Packet from={coords[step.nodes.packet.from]} to={coords[step.nodes.packet.to]} label={step.nodes.packet.label} />
            </svg>
            
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-slate-500 border border-slate-200">
                Step {currentStep + 1} of {steps.length}
            </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Previous
                        </button>
                        <button onClick={handleNext} disabled={currentStep === steps.length - 1} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Next
                        </button>
                    </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                
                {step.details && (
                    <div className="mt-4 bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-700 shadow-inner">
                        <div className="text-slate-500 mb-2 uppercase text-[10px] font-bold tracking-wider">{step.details.type}</div>
                        <pre>{step.details.content}</pre>
                    </div>
                )}
            </div>

            <div className="lg:border-l border-slate-100 lg:pl-8 flex flex-col justify-center space-y-4">
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <h4 className="text-sm font-bold text-sky-900 mb-2">What's happening?</h4>
                    <ul className="text-sm text-sky-800 space-y-2 list-disc list-inside">
                        {step.nodes.active.includes('user') && <li>User interacts manually.</li>}
                        {step.nodes.active.includes('client') && <li>Application logic runs.</li>}
                        {step.nodes.active.includes('auth') && <li>Server processes request.</li>}
                    </ul>
                </div>
                
                {((flowType === 'oauth' && currentStep >= 5) || (flowType === 'device' && currentStep === 4)) && (
                     <button onClick={handleInspect} className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                        <SendIcon className="h-4 w-4" />
                        Inspect Token
                    </button>
                )}
                 {flowType === 'saml' && currentStep >= 4 && (
                    <div className="text-xs text-center text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
                        Tip: Use the "SAML" tab to generate and inspect these XML responses yourself.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlowVisualizer;
