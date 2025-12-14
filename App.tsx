
import React, { useState } from 'react';
import Tabs from './components/Tabs';
import JwtEncoder from './components/JwtEncoder';
import JwtDecoder from './components/JwtDecoder';
import FailureSimulator from './components/FailureSimulator';
import LearnFlows from './components/LearnFlows';
import FlowVisualizer from './components/FlowVisualizer';
import SamlTools from './components/SamlTools';
import KeyManager from './components/KeyManager';
import PkceGenerator from './components/PkceGenerator';
import TokenDiff from './components/TokenDiff';
import FormatConverter from './components/FormatConverter';
import SecretGenerator from './components/SecretGenerator';
import ScopeExplorer from './components/ScopeExplorer';
import { ShieldCheckIcon } from './components/icons';
import type { DecoderData } from './types';

enum AppView {
  DECODE = 'Decode',
  ENCODE = 'Encode',
  SAML = 'SAML',
  KEYS = 'Keys',
  SIMULATE = 'Simulate',
  FLOWS = 'Flows',
  PKCE = 'PKCE',
  DIFF = 'Diff',
  CONVERT = 'Convert',
  SECRETS = 'Secrets',
  SCOPES = 'Scopes',
  LEARN = 'Learn',
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DECODE);
  const [decoderInitialData, setDecoderInitialData] = useState<DecoderData | null>(null);

  const handleSendToDecoder = (data: DecoderData) => {
    setDecoderInitialData(data);
    setActiveView(AppView.DECODE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.ENCODE:
        return <JwtEncoder onSendToDecoder={handleSendToDecoder} />;
      case AppView.DECODE:
        return (
          <JwtDecoder
            initialData={decoderInitialData}
            onDataHandled={() => setDecoderInitialData(null)}
          />
        );
      case AppView.SAML:
        return <SamlTools />;
      case AppView.KEYS:
        return <KeyManager />;
      case AppView.SIMULATE:
        return <FailureSimulator onSendToDecoder={handleSendToDecoder} />;
      case AppView.FLOWS:
        return <FlowVisualizer onSendToDecoder={handleSendToDecoder} />;
      case AppView.PKCE:
        return <PkceGenerator />;
      case AppView.DIFF:
        return <TokenDiff />;
      case AppView.CONVERT:
        return <FormatConverter />;
      case AppView.SECRETS:
        return <SecretGenerator />;
      case AppView.SCOPES:
        return <ScopeExplorer />;
      case AppView.LEARN:
        return <LearnFlows />;
      default:
        return (
          <JwtDecoder
            initialData={decoderInitialData}
            onDataHandled={() => setDecoderInitialData(null)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 bg-opacity-90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-sky-50 p-2 rounded-lg shadow-sm border border-sky-100">
                <ShieldCheckIcon className="h-8 w-8 text-sky-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Token Flow Simulator
                </h1>
                <p className="text-xs text-slate-500 font-medium">Interactive Security Playground</p>
              </div>
            </div>
            <div className="w-full md:w-auto overflow-x-auto">
              <Tabs
                views={Object.values(AppView)}
                activeView={activeView}
                setActiveView={(view) => setActiveView(view as AppView)}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>
      <footer className="text-center py-12 text-slate-400 text-sm border-t border-slate-200 mt-12 bg-slate-50">
        <p>Built for educational purposes to understand token-based authentication mechanics.</p>
        <p className="mt-2 text-xs">Simulations run entirely in your browser. No data is sent to any server.</p>
      </footer>
    </div>
  );
};

export default App;
