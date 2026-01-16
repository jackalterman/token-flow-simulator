
import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { ServerIcon, InfoIcon, TrashIcon, RefreshIcon } from './icons';

interface SubnetResult {
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
    mask: string;
    hosts: number;
}

const SubnetCalculator: React.FC = () => {
    const [cidr, setCidr] = usePersistentState('subnet-cidr', '192.168.1.0/24');
    const [result, setResult] = useState<SubnetResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const ipToLong = (ip: string) => {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    };

    const longToIp = (long: number) => {
        return [
            (long >>> 24) & 0xFF,
            (long >>> 16) & 0xFF,
            (long >>> 8) & 0xFF,
            long & 0xFF
        ].join('.');
    };

    useEffect(() => {
        try {
            setError(null);
            const parts = cidr.split('/');
            if (parts.length !== 2) throw new Error('Invalid format. Use IP/Prefix (e.g., 10.0.0.0/24)');
            
            const ipStr = parts[0];
            const prefix = parseInt(parts[1], 10);
            
            if (prefix < 0 || prefix > 32) throw new Error('Prefix must be between 0 and 32');
            if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ipStr)) throw new Error('Invalid IP address');

            const ip = ipToLong(ipStr);
            const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
            const network = (ip & mask) >>> 0;
            const broadcast = (network | (~mask)) >>> 0;
            
            let hosts = 0;
            let firstHost = '';
            let lastHost = '';

            if (prefix <= 30) {
                hosts = (broadcast - network) - 1;
                firstHost = longToIp(network + 1);
                lastHost = longToIp(broadcast - 1);
            } else if (prefix === 31) {
                hosts = 2;
                firstHost = longToIp(network);
                lastHost = longToIp(broadcast);
            } else {
                hosts = 1;
                firstHost = longToIp(network);
                lastHost = longToIp(network);
            }

            setResult({
                network: longToIp(network),
                broadcast: longToIp(broadcast),
                firstHost,
                lastHost,
                mask: longToIp(mask),
                hosts
            });
        } catch (e: any) {
            setError(e.message);
            setResult(null);
        }
    }, [cidr]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">CIDR Notation</h3>
                                <button 
                                    onClick={() => setCidr('192.168.1.0/24')}
                                    className="text-[10px] text-slate-500 hover:text-sky-600 font-bold uppercase tracking-tight flex items-center gap-1"
                                >
                                    <RefreshIcon className="h-3 w-3" /> Reset
                                </button>
                            </div>
                            <input
                                type="text"
                                value={cidr}
                                onChange={(e) => setCidr(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono text-sm"
                                placeholder="192.168.1.0/24"
                            />
                        </div>
                        {result && (
                            <div className="flex items-center space-x-2 text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                                <ServerIcon className="h-4 w-4" />
                                <span className="text-xs font-bold">{result.hosts.toLocaleString()} Usable Hosts</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {error ? (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
                            {error}
                        </div>
                    ) : result ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: 'Network Address', value: result.network },
                                { label: 'Subnet Mask', value: result.mask },
                                { label: 'Broadcast Address', value: result.broadcast },
                                { label: 'First Host', value: result.firstHost },
                                { label: 'Last Host', value: result.lastHost },
                                { label: 'Host Range', value: `${result.firstHost} — ${result.lastHost}` },
                            ].map((item, id) => (
                                <div key={id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                                    <div className="text-sm font-mono font-bold text-slate-700">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                    <InfoIcon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="text-sm text-sky-800">
                    <p className="font-semibold mb-1">About IPv4 Subnetting</p>
                    <p className="opacity-80">
                        Subnetting allows network administrators to divide a large network into smaller, manageable subnets. The CIDR (Classless Inter-Domain Routing) notation consists of an IP address followed by a prefix length (e.g., /24).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubnetCalculator;
