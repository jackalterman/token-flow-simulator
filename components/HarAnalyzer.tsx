import React, { useState, useMemo } from 'react';
import { 
  SearchIcon, 
  RefreshIcon, 
  ArrowRightIcon, 
  ClipboardIcon, 
  CheckIcon,
  InfoIcon,
  SearchIcon as DetailIcon
} from './icons';
import { HarRoot, HarEntry, filterEntries } from '../services/har';

interface HarAnalyzerProps {
  onSendToDecoder?: (data: any) => void;
}

const HarAnalyzer: React.FC<HarAnalyzerProps> = ({ onSendToDecoder }) => {
  const [harData, setHarData] = useState<HarRoot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<HarEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  const resourceTypes = ['xhr', 'document', 'script', 'stylesheet', 'image', 'font'];
  const statusRanges = ['2xx', '3xx', '4xx', '5xx'];

  const toggleType = (type: string) => {
    setActiveTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleStatus = (status: string) => {
    setActiveStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.log || !parsed.log.entries) {
          throw new Error('Invalid HAR file format');
        }
        setHarData(parsed);
        setError(null);
        setSelectedEntry(null);
      } catch (err) {
        setError('Failed to parse HAR file. Please ensure it is a valid JSON-formatted HAR.');
        setHarData(null);
      }
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const filteredEntries = useMemo(() => {
    if (!harData) return [];
    return filterEntries(harData.log.entries, searchQuery, activeTypes, activeStatuses);
  }, [harData, searchQuery, activeTypes, activeStatuses]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50';
    if (status >= 300 && status < 400) return 'text-amber-600 bg-amber-50';
    if (status >= 400) return 'text-rose-600 bg-rose-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="space-y-6">
      {!harData ? (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-sky-100 shadow-sm">
              <RefreshIcon className="h-8 w-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Upload HAR File</h3>
            <p className="text-slate-500 mb-8">
              Select or drag and drop a .har file exported from your browser's DevTools to analyze its contents locally.
            </p>
            <label className="inline-flex items-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer">
              <span>Choose File</span>
              <input type="file" accept=".har,.json" className="hidden" onChange={handleFileUpload} />
            </label>
            {error && <p className="mt-4 text-rose-500 text-sm font-medium">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Sidebar: Entry List */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-4 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search URLs, Headers..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => {
                    setHarData(null);
                    setActiveTypes([]);
                    setActiveStatuses([]);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Clear HAR"
                >
                  <RefreshIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-1">
                  {resourceTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        activeTypes.includes(type)
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type === 'xhr' ? 'XHR/Fetch' : type}
                    </button>
                  ))}
                </div>
                <div className="w-px h-4 bg-slate-200 self-center" />
                <div className="flex flex-wrap gap-1">
                  {statusRanges.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        activeStatuses.includes(status)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 italic">No entries match your search</p>
                </div>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEntry(entry)}
                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group ${
                      selectedEntry === entry ? 'bg-sky-50/50 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(entry.response.status)}`}>
                        {entry.response.status} {entry.request.method}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(entry.time / 1000).toFixed(2)}s
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate font-mono" title={entry.request.url}>
                      {entry.request.url}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {selectedEntry ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800 mb-1 break-all font-mono">
                    {selectedEntry.request.url}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-500">Method: <span className="font-bold text-slate-700">{selectedEntry.request.method}</span></span>
                    <span className="text-xs text-slate-500">Status: <span className="font-bold text-slate-700">{selectedEntry.response.status} {selectedEntry.response.statusText}</span></span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {/* Request Headers */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Headers</h4>
                      <button 
                        onClick={() => handleCopy(JSON.stringify(selectedEntry.request.headers, null, 2), 'req-h')}
                        className="text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        {copied === 'req-h' ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden text-xs font-mono">
                      {selectedEntry.request.headers.map((h, i) => (
                        <div key={i} className="p-2 border-b border-slate-100 last:border-0 hover:bg-slate-100/50 group flex flex-wrap gap-2">
                          <span className="text-sky-700 font-bold min-w-[120px]">{h.name}:</span>
                          <span className="text-slate-600 break-all flex-1">{h.value}</span>
                          {(h.value.startsWith('Bearer ') || h.name.toLowerCase().includes('token')) && onSendToDecoder && (
                             <button 
                                onClick={() => {
                                    const val = h.value.startsWith('Bearer ') ? h.value.split(' ')[1] : h.value;
                                    onSendToDecoder({ token: val, key: '' });
                                }}
                                className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] font-bold hover:bg-sky-200 transition-all"
                             >
                               Decode JWT
                             </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Cookie Info if present */}
                  {selectedEntry.request.cookies.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cookies</h4>
                      <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden text-xs font-mono">
                        {selectedEntry.request.cookies.map((c, i) => (
                          <div key={i} className="p-2 border-b border-slate-100 last:border-0 flex gap-2">
                            <span className="text-indigo-700 font-bold min-w-[80px]">{c.name}:</span>
                            <span className="text-slate-600 break-all flex-1">{c.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Request Body if present */}
                  {selectedEntry.request.postData && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Request Body</h4>
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs font-mono text-slate-600 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                        {selectedEntry.request.postData.text || 'No data'}
                      </div>
                    </section>
                  )}

                  {/* Response Body if present */}
                  {selectedEntry.response.content.text && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Response Body</h4>
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs font-mono text-slate-600 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                        {selectedEntry.response.content.text}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <ArrowRightIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-bold mb-1">Select an entry</h4>
                <p className="text-slate-500 text-sm">Click on a request in the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start space-x-3">
        <div className="bg-sky-100 p-2 rounded-lg">
          <InfoIcon className="h-5 w-5 text-sky-600" />
        </div>
        <div className="text-sm text-sky-800">
          <p className="font-semibold mb-1">Secure & Local</p>
          <p className="opacity-80">
            All HAR parsing and analysis happens entirely within your browser. Your sensitive data (cookies, tokens, URLs) never leaves your computer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HarAnalyzer;
