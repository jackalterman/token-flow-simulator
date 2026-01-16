
import React, { useState } from 'react';
import { ShieldCheckIcon, AlertTriangleIcon, SearchIcon, FileCodeIcon } from './icons';
import { xmlService } from '../services/xmlService';

const XswSimulator: React.FC = () => {
    const [originalXml, setOriginalXml] = useState('');
    const [attackedXml, setAttackedXml] = useState('');
    
    const generateSafe = () => {
        const xml = xmlService.generateMockSamlResponse({
            issuer: 'https://idp.example.com',
            subject: 'admin@example.com',
            audience: 'https://sp.example.com',
            acsUrl: 'https://sp.example.com/acs',
            attributes: { role: 'admin' }
        });
        setOriginalXml(xmlService.formatXml(xml));
        setAttackedXml('');
    };

    const runAttack = () => {
        if (!originalXml) return;
        // Simple XSW string manipulation for demo purposes
        const attacked = originalXml
            .replace('</saml:Assertion>', '</saml:Assertion>\n<saml:Assertion ID="_evil_id">...</saml:Assertion>')
            .replace('<saml:Issuer>', '<saml:Issuer>https://evil.party</saml:Issuer><!--');
        setAttackedXml(attacked);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">XSW (XML Signature Wrapping) Simulator</h2>
                <p className="text-slate-600 text-sm mb-4">Discover how moving a valid signature to a different part of the XML tree can trick some SPs into accepting malicious data.</p>
                <div className="flex space-x-2">
                    <button onClick={generateSafe} className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-sm">Generate Safe Response</button>
                    <button onClick={runAttack} disabled={!originalXml} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50">Run XSW Attack</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-500" /> Original SAML
                    </h3>
                    <div className="bg-slate-900 p-4 rounded-lg min-h-[400px] text-[10px] font-mono text-cyan-300 overflow-auto whitespace-pre">
                        {originalXml || 'Click generate...'}
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center">
                        <AlertTriangleIcon className="h-4 w-4 mr-2 text-red-500" /> Attacked SAML
                    </h3>
                    <div className="bg-slate-900 p-4 rounded-lg min-h-[400px] text-[10px] font-mono text-red-300 overflow-auto whitespace-pre">
                        {attackedXml || 'Run attack to see result...'}
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                <p className="font-bold mb-1">How it works:</p>
                <p>The attacker keeps the signature valid but "wraps" it around a new, malicious assertion. If the SP validates the signature first and then looks for the user identity elsewhere in the document, it might find the malicious one while believing it was signed.</p>
            </div>
        </div>
    );
};

export default XswSimulator;
