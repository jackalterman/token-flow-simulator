import React, { useState } from 'react';
import Tabs from './components/Tabs';
import JwtEncoder from './components/JwtEncoder';
import JwtDecoder from './components/JwtDecoder';
import FailureSimulator from './components/FailureSimulator';
import LearnFlows from './components/LearnFlows';
import FlowVisualizer from './components/FlowVisualizer';
import { ShieldCheckIcon } from './components/icons';
import type { DecoderData } from './types';

enum AppView {
  DECODE = 'Decode',
  ENCODE = 'Encode',
  SIMULATE = 'Simulate',
  FLOWS = 'Flows',
  LEARN = 'Learn',
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DECODE);
  const [decoderInitialData, setDecoderInitialData] = useState<DecoderData | null>(null);

  const handleSendToDecoder = (data: DecoderData) => {
    setDecoderInitialData(data);
    setActiveView(AppView.DECODE);
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
      case AppView.SIMULATE:
        return <FailureSimulator onSendToDecoder={handleSendToDecoder} />;
      case AppView.FLOWS:
        return <FlowVisualizer onSendToDecoder={handleSendToDecoder} />;
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
    <div className="min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-sky-500" />
              <h1 className="text-2xl font-bold text-slate-800">
                Token Flow Simulator
              </h1>
            </div>
          </div>
          <Tabs
            views={Object.values(AppView)}
            activeView={activeView}
            setActiveView={(view) => setActiveView(view as AppView)}
          />
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Built for educational purposes to understand token-based authentication.</p>
      </footer>
    </div>
  );
};

export default App;
