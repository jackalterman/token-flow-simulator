import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CollectionItem } from '../types';
import { 
  CertificateIcon, 
  FileCodeIcon, 
  KeyIcon, 
  LockClosedIcon, 
  TrashIcon, 
  DownloadIcon,
  SearchIcon,
  ClipboardIcon,
  CheckIcon
} from './icons';
import CodeBlock from './CodeBlock';

const CollectionsView: React.FC = () => {
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        setItems(storageService.getItems().sort((a, b) => b.timestamp - a.timestamp));
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            storageService.deleteItem(id);
            loadItems();
            if (selectedItem?.id === id) setSelectedItem(null);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             item.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'certificate': return <CertificateIcon className="h-5 w-5" />;
            case 'jwt': return <FileCodeIcon className="h-5 w-5" />;
            case 'key': return <KeyIcon className="h-5 w-5" />;
            case 'secret': return <LockClosedIcon className="h-5 w-5" />;
            default: return <SearchIcon className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">My Collections</h2>
                    <p className="text-slate-600">Browse and manage your saved tokens, certificates, and keys.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search saved items..." 
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="certificate">Certificates</option>
                        <option value="jwt">JWTs</option>
                        <option value="key">Keys</option>
                        <option value="secret">Secrets</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Items ({filteredItems.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <SearchIcon className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No items found</p>
                                <p className="text-xs mt-1">Try changing your search or filters</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-4 group ${
                                        selectedItem?.id === item.id 
                                            ? 'bg-sky-50 border border-sky-200 ring-1 ring-sky-100' 
                                            : 'border border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        selectedItem?.id === item.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600'
                                    }`}>
                                        {getItemIcon(item.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-bold truncate ${selectedItem?.id === item.id ? 'text-sky-700' : 'text-slate-700'}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium uppercase tracking-tight">
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 h-[600px]">
                    {selectedItem ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                                        {getItemIcon(selectedItem.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{selectedItem.title}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedItem.type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleCopy(selectedItem.content)}
                                        className={`p-2 flex items-center gap-2 rounded-lg border transition-all text-xs font-bold ${
                                            copied 
                                            ? 'bg-green-50 border-green-200 text-green-700' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700'
                                        }`}
                                    >
                                        {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedItem.id)}
                                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-lg transition-all"
                                        title="Delete Item"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                <div>
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Content</h5>
                                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                                        <CodeBlock content={selectedItem.content} />
                                    </div>
                                </div>

                                {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Metadata</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(selectedItem.metadata).map(([key, value]) => (
                                                <div key={key} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                                    <p className="text-[10px] text-slate-400 uppercase mb-1">{key}</p>
                                                    <p className="text-xs font-mono text-slate-700 truncate">{String(value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 border-dashed h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <SearchIcon className="h-12 w-12 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Item Selected</h3>
                            <p className="text-sm max-w-xs mx-auto mt-2">Select an item from the list to view its contents and metadata.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionsView;
