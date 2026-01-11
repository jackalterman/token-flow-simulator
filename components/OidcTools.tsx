import React, { useState } from 'react';
import { SearchIcon, UsersIcon, ShieldCheckIcon, AlertTriangleIcon, ClipboardIcon } from './icons';
import CodeBlock from './CodeBlock';

interface OidcToolsProps {
  activeSubView?: 'discovery' | 'userinfo';
}

const OidcTools: React.FC<OidcToolsProps> = ({ activeSubView = 'discovery' }) => {
  const [issuer, setIssuer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  const [accessToken, setAccessToken] = useState('');
  const [userInfoEndpoint, setUserInfoEndpoint] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const fetchWithHandling = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let details = '';
      if (contentType?.includes('application/json')) {
        const errData = await response.json();
        details = errData.error_description || errData.error || errData.message || '';
      }
      throw new Error(`Server returned ${response.status}${details ? ': ' + details : ''}`);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response but received ' + (contentType || 'unknown content type') + '. Check if the URL is a valid OIDC endpoint.');
    }

    return await response.json();
  };

  const fetchConfig = async () => {
    if (!issuer) return;
    if (!isValidUrl(issuer)) {
      setError('Please enter a valid URL or domain (e.g. accounts.google.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setConfig(null);

    let url = issuer;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    url = url.replace(/\/$/, '');
    if (!url.includes('.well-known')) {
      url = `${url}/.well-known/openid-configuration`;
    }

    try {
      const data = await fetchWithHandling(url);
      setConfig(data);
      if (data.userinfo_endpoint) {
        setUserInfoEndpoint(data.userinfo_endpoint);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    if (!userInfoEndpoint || !accessToken) return;
    if (!isValidUrl(userInfoEndpoint)) {
      setError('UserInfo Endpoint must be a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setUserInfo(null);

    try {
      const data = await fetchWithHandling(userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setUserInfo(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching user info');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-50 p-2 rounded-lg">
              {activeSubView === 'discovery' ? (
                <SearchIcon className="h-6 w-6 text-sky-600" />
              ) : (
                <UsersIcon className="h-6 w-6 text-sky-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {activeSubView === 'discovery' ? 'Discovery Explorer' : 'UserInfo Fetcher'}
              </h3>
              <p className="text-sm text-slate-500">
                {activeSubView === 'discovery' 
                  ? 'Inspect OIDC identity provider configuration' 
                  : 'Test fetching user profile data with an access token'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSubView === 'discovery' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Issuer URL or Domain
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g. accounts.google.com or https://okta.com/oauth2/default"
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                  <button
                    onClick={fetchConfig}
                    disabled={loading || !issuer}
                    className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {loading ? 'Fetching...' : 'Fetch Config'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Will attempt to fetch from <code>{issuer || 'domain'}/.well-known/openid-configuration</code>
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center space-x-3 text-red-700 animate-fade-in">
                  <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {config && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Endpoints</h4>
                      <div className="space-y-2">
                        {['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint', 'jwks_uri'].map(key => config[key] && (
                          <div key={key} className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-mono">{key}</span>
                            <div className="flex items-center group">
                                <span className="text-xs font-medium text-slate-700 truncate">{config[key]}</span>
                                <button onClick={() => copyToClipboard(config[key])} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded">
                                    <ClipboardIcon className="h-3 w-3 text-slate-500" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                          {(config.scopes_supported || []).map((scope: string) => (
                              <span key={scope} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                                  {scope}
                              </span>
                          ))}
                           {(config.response_types_supported || []).map((type: string) => (
                              <span key={type} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                                  {type}
                              </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Raw Configuration</h4>
                    <CodeBlock code={JSON.stringify(config, null, 2)} language="json" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    UserInfo Endpoint
                  </label>
                  <input
                    type="text"
                    value={userInfoEndpoint}
                    onChange={(e) => setUserInfoEndpoint(e.target.value)}
                    placeholder="https://accounts.google.com/oauth2/v3/userinfo"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ya29.a0AfH6..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={fetchUserInfo}
                disabled={loading || !userInfoEndpoint || !accessToken}
                className="w-full py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Fetching Profile...' : 'Fetch UserInfo'}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center space-x-3 text-red-700 animate-fade-in">
                  <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {userInfo && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center space-x-4">
                    {userInfo.picture && (
                        <img src={userInfo.picture} alt="Profile" className="h-12 w-12 rounded-full border border-white shadow-sm" />
                    )}
                    <div>
                        <h4 className="text-base font-bold text-slate-800">{userInfo.name || userInfo.preferred_username || 'User Profile'}</h4>
                        <p className="text-sm text-slate-500">{userInfo.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Resource Metadata</h4>
                    <CodeBlock code={JSON.stringify(userInfo, null, 2)} language="json" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start space-x-3 text-amber-800">
        <ShieldCheckIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-bold mb-1">CORS Notice</p>
          <p>Browsers enforce Cross-Origin Resource Sharing (CORS). Some identity providers may block direct browser-side requests to their configuration or UserInfo endpoints unless specifically configured or using a proxy.</p>
        </div>
      </div>
    </div>
  );
};

export default OidcTools;
