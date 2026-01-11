import React, { useState, useMemo } from 'react';
import { 
  SearchIcon, 
  RefreshIcon, 
  ArrowRightIcon, 
  ClipboardIcon, 
  CheckIcon,
  InfoIcon,
  DownloadIcon,
  ActivityIcon,
  AlertTriangleIcon,
  SearchIcon as DetailIcon
} from './icons';
import { HarRoot, HarEntry, filterEntries, parseHarFile } from '../services/har';

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
  const [sortField, setSortField] = useState<keyof HarEntry | 'name' | 'size'>('startedDateTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
        const parsed = parseHarFile(content);
        setHarData(parsed);
        setError(null);
        setSelectedEntry(null);
      } catch (err: any) {
        setError(err.message || 'Failed to parse HAR file.');
        setHarData(null);
      }
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const filteredEntries = useMemo(() => {
    if (!harData) return [];
    let entries = filterEntries(harData.log.entries, searchQuery, activeTypes, activeStatuses);
    
    // Sorting
    return [...entries].sort((a, b) => {
      let valA: any, valB: any;
      if (sortField === 'name') {
        valA = a.request.url.split('/').pop() || a.request.url;
        valB = b.request.url.split('/').pop() || b.request.url;
      } else if (sortField === 'size') {
        valA = a.response.content.size || 0;
        valB = b.response.content.size || 0;
      } else {
        valA = a[sortField as keyof HarEntry];
        valB = b[sortField as keyof HarEntry];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [harData, searchQuery, activeTypes, activeStatuses, sortField, sortDirection]);

  const stats = useMemo(() => {
    if (!harData) return null;
    const entries = harData.log.entries;
    const totalSize = entries.reduce((acc, e) => acc + (e.response.content.size || 0), 0);
    const totalTime = entries.reduce((acc, e) => acc + e.time, 0);
    const errors = entries.filter(e => e.response.status >= 400).length;
    return {
      count: entries.length,
      size: (totalSize / 1024).toFixed(2) + ' KB',
      avgTime: (totalTime / entries.length).toFixed(0) + ' ms',
      errors
    };
  }, [harData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-600';
    if (status >= 300 && status < 400) return 'text-amber-600';
    if (status >= 400) return 'text-rose-600';
    return 'text-slate-600';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getName = (url: string) => {
    try {
      const u = new URL(url);
      const pathname = u.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || u.host;
    } catch {
      return url.split('/').pop() || url;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      {!harData ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center max-w-md w-full">
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
        <>
            {/* Stats Dashboard */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Requests', value: stats?.count, icon: SearchIcon, color: 'text-sky-600', bg: 'bg-sky-50' },
                    { label: 'Data Transferred', value: stats?.size, icon: DownloadIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Avg Latency', value: stats?.avgTime, icon: ActivityIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Errors', value: stats?.errors, icon: AlertTriangleIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
                        <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Table View */}
                <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${selectedEntry ? 'w-2/5' : 'w-full'}`}>
                    <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by URL, body, or header..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => {
                                    setHarData(null);
                                    setSelectedEntry(null);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 bg-white shadow-sm"
                                title="Clear HAR"
                            >
                                <RefreshIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Toggles:</span>
                            {resourceTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm border ${
                                        activeTypes.includes(type)
                                        ? 'bg-sky-600 text-white border-sky-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                                <tr>
                                    <th className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => setSortField('name')}>Name</th>
                                    <th className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => setSortField('response')}>Status</th>
                                    <th className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => setSortField('time')}>Time</th>
                                    <th className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => setSortField('size')}>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr 
                                        key={entry._id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className={`group cursor-pointer border-b border-slate-50 hover:bg-sky-50/30 transition-colors ${
                                            selectedEntry?._id === entry._id ? 'bg-sky-50 outline outline-1 outline-sky-200 z-[1]' : ''
                                        } ${entry.analysis?.hasErrors ? 'bg-rose-50/30' : ''}`}
                                    >
                                        <td className="px-3 py-2 max-w-[200px]">
                                            <div className="flex items-center space-x-2">
                                                {entry.analysis?.authType && (
                                                    <span className="px-1 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-bold rounded uppercase">
                                                        {entry.analysis.authType}
                                                    </span>
                                                )}
                                                <span className="font-mono truncate" title={entry.request.url}>{getName(entry.request.url)}</span>
                                            </div>
                                        </td>
                                        <td className={`px-3 py-2 font-bold ${getStatusColor(entry.response.status)}`}>
                                            {entry.response.status}
                                        </td>
                                        <td className={`px-3 py-2 font-mono ${entry.analysis?.isSlow ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                                            {entry.time.toFixed(0)}ms
                                        </td>
                                        <td className={`px-3 py-2 font-mono ${entry.analysis?.isLarge ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                                            {formatSize(entry.response.content.size || 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Panel */}
                {selectedEntry && (
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                           <div className="flex-1 min-w-0 pr-4">
                               <h3 className="text-xs font-bold text-slate-800 break-all font-mono mb-1">
                                    {selectedEntry.request.url}
                                </h3>
                                <div className="flex items-center space-x-3 text-[10px]">
                                    <span className="font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">{selectedEntry.request.method}</span>
                                    <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusColor(selectedEntry.response.status)} bg-opacity-10 bg-current`}>
                                        {selectedEntry.response.status} {selectedEntry.response.statusText}
                                    </span>
                                    <span className="text-slate-400">{selectedEntry.startedDateTime}</span>
                                </div>
                           </div>
                           <button onClick={() => setSelectedEntry(null)} className="p-1 hover:bg-slate-200 rounded">
                               <RefreshIcon className="h-4 w-4 text-slate-400 rotate-45" />
                           </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {/* Analysis/Insights Section */}
                            {(selectedEntry.analysis?.securityIssues.length || 0) > 0 && (
                                <section className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                    <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center">
                                        <AlertTriangleIcon className="h-3 w-3 mr-1" />
                                        Security Insights
                                    </h4>
                                    <ul className="text-[11px] text-amber-900 space-y-1 list-disc pl-4">
                                        {selectedEntry.analysis?.securityIssues.map((issue, i) => (
                                            <li key={i}>{issue}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Tabs Style Sections */}
                            <div className="space-y-6">
                                {/* Headers */}
                                <section>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Headers</h4>
                                        <button 
                                            onClick={() => handleCopy(JSON.stringify(selectedEntry.request.headers, null, 2), 'h')}
                                            className="text-slate-400 hover:text-sky-600"
                                        >
                                            <ClipboardIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden text-[11px]">
                                        <div className="p-2 bg-slate-100/50 font-bold text-slate-500 border-b border-slate-100">General</div>
                                        <div className="p-2 space-y-1 font-mono">
                                            <div className="flex"><span className="text-sky-700 font-bold min-w-[100px]">Request URL:</span> <span className="text-slate-600 break-all">{selectedEntry.request.url}</span></div>
                                            <div className="flex"><span className="text-sky-700 font-bold min-w-[100px]">Method:</span> <span className="text-slate-600">{selectedEntry.request.method}</span></div>
                                            <div className="flex"><span className="text-sky-700 font-bold min-w-[100px]">Status:</span> <span className={`${getStatusColor(selectedEntry.response.status)}`}>{selectedEntry.response.status}</span></div>
                                        </div>
                                        <div className="p-2 bg-slate-100/50 font-bold text-slate-500 border-y border-slate-100">Response Headers</div>
                                        <div className="p-2 space-y-1 font-mono">
                                            {selectedEntry.response.headers.map((h, i) => (
                                                <div key={i} className="flex"><span className="text-sky-700 font-bold min-w-[140px] shrink-0">{h.name}:</span> <span className="text-slate-600 break-all">{h.value}</span></div>
                                            ))}
                                        </div>
                                        <div className="p-2 bg-slate-100/50 font-bold text-slate-500 border-y border-slate-100">Request Headers</div>
                                        <div className="p-2 space-y-1 font-mono">
                                            {selectedEntry.request.headers.map((h, i) => (
                                                <div key={i} className="group flex items-start gap-2">
                                                    <span className="text-sky-700 font-bold min-w-[140px] shrink-0 border-r border-slate-200 pr-2">{h.name}:</span> 
                                                    <span className="text-slate-600 break-all flex-1">{h.value}</span>
                                                    {(h.name.toLowerCase().includes('token') || h.value.startsWith('Bearer ')) && onSendToDecoder && (
                                                        <button 
                                                            onClick={() => onSendToDecoder({ token: h.value.replace('Bearer ', ''), key: '' })}
                                                            className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-[4px] text-[8px] font-bold"
                                                        >Decode</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Request Body */}
                                {selectedEntry.request.postData && (
                                    <section>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Request Body ({selectedEntry.request.postData.mimeType})</h4>
                                        <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                                            {selectedEntry.request.postData.text}
                                        </div>
                                    </section>
                                )}

                                {/* Response Content */}
                                {selectedEntry.response.content.text && (
                                    <section>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Response Body</h4>
                                        <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-sky-400 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                                            {selectedEntry.response.content.text}
                                        </div>
                                    </section>
                                )}

                                 {/* Query Params */}
                                 {selectedEntry.request.queryString.length > 0 && (
                                    <section>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Query Parameters</h4>
                                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-2 space-y-1 font-mono text-[11px]">
                                            {selectedEntry.request.queryString.map((p, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="text-indigo-700 font-bold min-w-[100px] shrink-0">{p.name}:</span>
                                                    <span className="text-slate-600 break-all">{p.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
      )}

      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start space-x-3 shrink-0">
        <div className="bg-sky-100 p-1.5 rounded-lg">
          <InfoIcon className="h-4 w-4 text-sky-600" />
        </div>
        <div className="text-[11px] text-sky-800">
          <p className="font-bold mb-0.5 leading-none">Pro Tip - Deep Search & Diagnostics</p>
          <p className="opacity-80">
            Use the search bar to find keywords inside JSON bodies or headers. Requests marked in <span className="text-rose-600 font-bold">pink</span> failed, and <span className="text-amber-600 font-bold">bold time/size</span> indicates outliers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HarAnalyzer;
