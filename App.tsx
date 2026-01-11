
import React, { useState } from 'react';
import Sidebar, { AppView } from './components/Sidebar';
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
import Base64Tool from './components/Base64Tool';
import UrlTool from './components/UrlTool';
import HashTool from './components/HashTool';
import HmacTool from './components/HmacTool';
import SubnetCalculator from './components/SubnetCalculator';
import PasswordAnalyzer from './components/PasswordAnalyzer';
import UuidGenerator from './components/UuidGenerator';
import CronParser from './components/CronParser';
import HarAnalyzer from './components/HarAnalyzer';
import CollectionsView from './components/CollectionsView';
import type { DecoderData } from './types';

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
        return <KeyManager onSendToDecoder={handleSendToDecoder} />;
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
      case AppView.BASE64:
        return <Base64Tool />;
      case AppView.URL:
        return <UrlTool />;
      case AppView.HASH:
        return <HashTool />;
      case AppView.HMAC:
        return <HmacTool />;
      case AppView.SUBNET:
        return <SubnetCalculator />;
      case AppView.PASSWORD:
        return <PasswordAnalyzer />;
      case AppView.UUID:
        return <UuidGenerator />;
      case AppView.CRON:
        return <CronParser />;
      case AppView.HAR_ANALYZER:
        return <HarAnalyzer onSendToDecoder={handleSendToDecoder} />;
      case AppView.COLLECTIONS:
        return <CollectionsView />;
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
            <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              Browser-only session
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
          {renderView()}
          
          <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm pb-12">
            <p>Built for educational purposes to understand token-based authentication mechanics.</p>
            <p className="mt-1">All operations are performed locally in your browser.</p>
          </footer>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default App;
