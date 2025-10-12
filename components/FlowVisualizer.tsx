import React, { useState, useEffect } from 'react';
import { UsersIcon, ServerIcon, ArrowRightIcon, SendIcon } from './icons';
import CodeBlock from './CodeBlock';
import { jwtService } from '../services/jwtService';
import { DecoderData } from '../types';

interface FlowVisualizerProps {
  onSendToDecoder: (data: DecoderData) => void;
}

const Actor: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex flex-col items-center text-center p-4 bg-slate-100 rounded-lg border border-slate-200 w-32 h-32 justify-center">
        {icon}
        <p className="mt-2 font-semibold text-sm">{title}</p>
    </div>
);

const steps = [
  { 
    title: "1. User Initiates Login",
    description: "The user clicks a 'Login with...' button in the Client Application. The application constructs a URL and redirects the user's browser to the Authorization Server.",
    from: 'User', to: 'Client App',
    details: {
        type: 'Redirect URL',
        content: `https://auth-server.com/auth?
  response_type=code
  &client_id=CLIENT_ID
  &scope=openid profile email
  &redirect_uri=https://client-app.com/callback`
    }
  },
  {
    title: "2. User Authenticates & Consents",
    description: "The Authorization Server presents a login and consent screen. The user enters their credentials and approves the application's request to access their data.",
    from: 'User', to: 'Auth Server',
    details: null
  },
  {
    title: "3. Authorization Code Grant",
    description: "After consent, the Authorization Server redirects the browser back to the Client Application's specified `redirect_uri`, including a temporary, one-time-use Authorization Code in the URL.",
    from: 'Auth Server', to: 'Client App',
    details: {
        type: 'Redirect back to Client',
        content: `https://client-app.com/callback?code=AUTH_CODE_12345`
    }
  },
  {
    title: "4. Exchange Code for Tokens",
    description: "The Client Application's backend server sends the Authorization Code, along with its own Client ID and Client Secret, directly to the Authorization Server's token endpoint. This is a secure, back-channel request.",
    from: 'Client App', to: 'Auth Server',
    details: {
        type: 'POST /token Request (Backend)',
        content: `{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE_12345",
  "redirect_uri": "https://client-app.com/callback",
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET"
}`
    }
  },
  {
    title: "5. Tokens Issued",
    description: "The Authorization Server validates the code and client credentials. If valid, it returns an Access Token and an ID Token (for OIDC). A Refresh Token may also be returned.",
    from: 'Auth Server', to: 'Client App',
    details: {
        type: 'Token Response (JSON)',
        content: `{
  "access_token": "ACCESS_TOKEN_JWT",
  "token_type": "Bearer",
  "expires_in": 3600,
  "id_token": "ID_TOKEN_JWT"
}`
    }
  },
  {
    title: "6. Access Protected Resources",
    description: "The Client Application can now use the Access Token to make requests to the Resource Server (API) to fetch the user's data. The Resource Server validates the token before returning a response.",
    from: 'Client App', to: 'Resource Server',
    details: {
        type: 'API Request with Bearer Token',
        content: `GET /api/user/profile
Authorization: Bearer ACCESS_TOKEN_JWT`
    }
  },
];

const FlowVisualizer: React.FC<FlowVisualizerProps> = ({ onSendToDecoder }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const generateToken = async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { 
          iss: 'https://auth-server.com',
          sub: 'user-789',
          aud: 'https://api.resource-server.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          scope: 'profile email'
      };
      const token = await jwtService.sign(header, payload, 'super-secret-key-for-resource-server');
      setAccessToken(token);
    };
    generateToken();
  }, []);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const handleSendToken = () => {
      if (accessToken) {
        onSendToDecoder({
            token: accessToken,
            key: 'super-secret-key-for-resource-server',
            audience: 'https://api.resource-server.com',
            issuer: 'https://auth-server.com',
        });
      }
  };

  const step = steps[currentStep];
  
  const getArrowPosition = (from: string, to: string) => {
    const positions: Record<string, string> = {
        'User-Client App': 'top-1/2 left-32 w-48',
        'Client App-User': 'top-1/2 left-32 w-48 -scale-x-100',
        'User-Auth Server': 'top-16 left-1/2 -translate-x-1/2 w-48 rotate-90',
        'Auth Server-User': 'top-16 left-1/2 -translate-x-1/2 w-48 -rotate-90',
        'Auth Server-Client App': 'bottom-16 left-1/2 -translate-x-1/2 w-48 -rotate-90',
        'Client App-Auth Server': 'bottom-16 left-1/2 -translate-x-1/2 w-48 rotate-90',
        'Client App-Resource Server': 'top-1/2 right-32 w-48',
    };
    return positions[`${from}-${to}`] || positions[`${to}-${from}`] || 'hidden';
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">OAuth 2.0 Authorization Code Flow</h2>
      <p className="text-slate-600 mb-6">An interactive visualizer for the most common and secure OAuth 2.0 flow.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-slate-200 relative">
          <div className="flex justify-between items-center">
            <Actor title="User" icon={<UsersIcon className="w-10 h-10 text-slate-500" />} />
            <Actor title="Client App" icon={<ServerIcon className="w-10 h-10 text-sky-500" />} />
            <Actor title="Auth Server" icon={<ServerIcon className="w-10 h-10 text-teal-500" />} />
            <Actor title="Resource Server" icon={<ServerIcon className="w-10 h-10 text-indigo-500" />} />
          </div>
           <div className="absolute inset-0 flex items-center justify-center p-4 z-0">
                <div className="w-full h-full grid grid-cols-3">
                    <div className="relative border-r-2 border-dashed border-slate-300">
                        <ArrowRightIcon className={`absolute text-sky-500 h-8 w-8 transition-opacity duration-500 ${getArrowPosition(step.from, step.to).includes('left-32') ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                     <div className="relative border-r-2 border-dashed border-slate-300">
                         <ArrowRightIcon className={`absolute text-sky-500 h-8 w-8 transition-opacity duration-500 ${getArrowPosition(step.from, step.to).includes('left-1/2') ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                     <div className="relative">
                         <ArrowRightIcon className={`absolute text-sky-500 h-8 w-8 transition-opacity duration-500 ${getArrowPosition(step.from, step.to).includes('right-32') ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-slate-600 mt-2 text-sm">{step.description}</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <button onClick={handlePrev} disabled={currentStep === 0} className="w-full py-2 px-4 rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentStep === steps.length - 1} className="w-full py-2 px-4 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>
        </div>
      </div>
       {step.details && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold">{step.details.type}</h3>
                <CodeBlock content={step.details.content.replace('ACCESS_TOKEN_JWT', 'eyJhbGciOiJI...').replace('ID_TOKEN_JWT', 'eyJhbGciOiJI...')} language="text" />
            </div>
        )}
        {currentStep >= 4 && (
             <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-800">Sample Access Token Generated</h3>
                <p className="text-sm text-teal-700 mb-2">This is an example of the Access Token the Resource Server would receive. You can inspect it in the decoder.</p>
                <CodeBlock content={accessToken || 'Generating token...'} language="text" />
                <button onClick={handleSendToken} disabled={!accessToken} className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    <SendIcon className="h-5 w-5" />
                    Inspect this Token in the Decoder
                </button>
            </div>
        )}
    </div>
  );
};

export default FlowVisualizer;