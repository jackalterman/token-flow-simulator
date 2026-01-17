
import React, { useState } from 'react';
import { SearchIcon, EyeIcon, AlertTriangleIcon, ShieldCheckIcon } from './icons';

type Provider = 'oidc' | 'google' | 'microsoft' | 'okta' | 'auth0';

interface Scope {
  name: string;
  desc: string;
  claims?: string[];
  permissions?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  category?: string;
}

interface ProviderData {
  name: string;
  scopes: Scope[];
  examples: {
    title: string;
    description: string;
    scopes: string[];
  }[];
}

const providerData: Record<Provider, ProviderData> = {
  oidc: {
    name: 'Standard OIDC',
    scopes: [
      { 
        name: 'openid', 
        desc: 'REQUIRED. Informs the Authorization Server that the client is making an OpenID Connect request.', 
        claims: ['sub'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'profile', 
        desc: 'OPTIONAL. Requests access to the end-user\'s default profile claims.', 
        claims: ['name', 'family_name', 'given_name', 'middle_name', 'nickname', 'preferred_username', 'profile', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'updated_at'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'email', 
        desc: 'OPTIONAL. Requests access to the email and email_verified claims.', 
        claims: ['email', 'email_verified'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'address', 
        desc: 'OPTIONAL. Requests access to the address claim.', 
        claims: ['address'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'phone', 
        desc: 'OPTIONAL. Requests access to the phone_number and phone_number_verified claims.', 
        claims: ['phone_number', 'phone_number_verified'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'offline_access', 
        desc: 'OPTIONAL. Requests a Refresh Token to be issued for long-term access.', 
        claims: ['(Refresh Token)'],
        riskLevel: 'medium',
        category: 'Access'
      },
    ],
    examples: [
      {
        title: 'Social Login Only',
        description: 'Minimal permissions for basic authentication',
        scopes: ['openid', 'profile', 'email']
      },
      {
        title: 'Mobile App with Offline Access',
        description: 'Standard scopes plus refresh token for mobile apps',
        scopes: ['openid', 'profile', 'email', 'offline_access']
      }
    ]
  },
  google: {
    name: 'Google',
    scopes: [
      { 
        name: 'https://www.googleapis.com/auth/userinfo.email', 
        desc: 'View your email address',
        permissions: ['Read email address'],
        riskLevel: 'low',
        category: 'User Info'
      },
      { 
        name: 'https://www.googleapis.com/auth/userinfo.profile', 
        desc: 'See your personal info, including any personal info you\'ve made publicly available',
        permissions: ['Read name', 'Read profile picture', 'Read public profile info'],
        riskLevel: 'low',
        category: 'User Info'
      },
      { 
        name: 'https://www.googleapis.com/auth/gmail.readonly', 
        desc: 'View your email messages and settings',
        permissions: ['Read all emails', 'Read email metadata', 'Read labels'],
        riskLevel: 'medium',
        category: 'Gmail'
      },
      { 
        name: 'https://www.googleapis.com/auth/gmail.modify', 
        desc: 'Read, compose, send, and permanently delete all your email from Gmail',
        permissions: ['Read emails', 'Send emails', 'Delete emails', 'Modify labels'],
        riskLevel: 'high',
        category: 'Gmail'
      },
      { 
        name: 'https://www.googleapis.com/auth/drive.readonly', 
        desc: 'See and download all your Google Drive files',
        permissions: ['Read all files', 'Download files', 'View file metadata'],
        riskLevel: 'medium',
        category: 'Drive'
      },
      { 
        name: 'https://www.googleapis.com/auth/drive.file', 
        desc: 'See, edit, create, and delete only the specific Google Drive files you use with this app',
        permissions: ['Read app-created files', 'Write app-created files', 'Delete app-created files'],
        riskLevel: 'medium',
        category: 'Drive'
      },
      { 
        name: 'https://www.googleapis.com/auth/calendar.readonly', 
        desc: 'View your calendars',
        permissions: ['Read calendar events', 'Read calendar metadata'],
        riskLevel: 'low',
        category: 'Calendar'
      },
      { 
        name: 'https://www.googleapis.com/auth/calendar.events', 
        desc: 'View and edit events on all your calendars',
        permissions: ['Read events', 'Create events', 'Update events', 'Delete events'],
        riskLevel: 'high',
        category: 'Calendar'
      },
    ],
    examples: [
      {
        title: 'Email Client (Read-Only)',
        description: 'Safe permissions for viewing emails without modification',
        scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
      },
      {
        title: 'Productivity Suite',
        description: 'Full access to Gmail, Drive, and Calendar',
        scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/calendar.events']
      },
      {
        title: 'Calendar Widget',
        description: 'Minimal permissions for displaying calendar',
        scopes: ['openid', 'https://www.googleapis.com/auth/calendar.readonly']
      }
    ]
  },
  microsoft: {
    name: 'Microsoft Graph',
    scopes: [
      { 
        name: 'User.Read', 
        desc: 'Sign you in and read your profile',
        permissions: ['Read user profile', 'Read email', 'Read photo'],
        riskLevel: 'low',
        category: 'User'
      },
      { 
        name: 'User.ReadWrite', 
        desc: 'Read and update your profile',
        permissions: ['Read profile', 'Update profile', 'Change photo'],
        riskLevel: 'medium',
        category: 'User'
      },
      { 
        name: 'Mail.Read', 
        desc: 'Read your mail',
        permissions: ['Read emails', 'Read folders', 'Read attachments'],
        riskLevel: 'medium',
        category: 'Mail'
      },
      { 
        name: 'Mail.ReadWrite', 
        desc: 'Read and write access to your mail',
        permissions: ['Read emails', 'Send emails', 'Delete emails', 'Create folders'],
        riskLevel: 'high',
        category: 'Mail'
      },
      { 
        name: 'Mail.Send', 
        desc: 'Send mail as you',
        permissions: ['Send emails on your behalf'],
        riskLevel: 'high',
        category: 'Mail'
      },
      { 
        name: 'Files.Read', 
        desc: 'Read your files',
        permissions: ['Read OneDrive files', 'Download files'],
        riskLevel: 'medium',
        category: 'Files'
      },
      { 
        name: 'Files.ReadWrite', 
        desc: 'Have full access to your files',
        permissions: ['Read files', 'Create files', 'Update files', 'Delete files'],
        riskLevel: 'high',
        category: 'Files'
      },
      { 
        name: 'Calendars.Read', 
        desc: 'Read your calendars',
        permissions: ['Read calendar events', 'Read calendar settings'],
        riskLevel: 'low',
        category: 'Calendar'
      },
      { 
        name: 'Calendars.ReadWrite', 
        desc: 'Read and write to your calendars',
        permissions: ['Read events', 'Create events', 'Update events', 'Delete events'],
        riskLevel: 'high',
        category: 'Calendar'
      },
    ],
    examples: [
      {
        title: 'Profile Viewer',
        description: 'Basic profile information only',
        scopes: ['openid', 'profile', 'User.Read']
      },
      {
        title: 'Email Client',
        description: 'Read and send emails',
        scopes: ['User.Read', 'Mail.Read', 'Mail.Send']
      },
      {
        title: 'Full Office Suite',
        description: 'Complete access to mail, files, and calendar',
        scopes: ['User.Read', 'Mail.ReadWrite', 'Files.ReadWrite', 'Calendars.ReadWrite']
      }
    ]
  },
  okta: {
    name: 'Okta',
    scopes: [
      { 
        name: 'openid', 
        desc: 'Required for OIDC authentication',
        claims: ['sub'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'profile', 
        desc: 'Access to user profile information',
        claims: ['name', 'email', 'preferred_username'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'email', 
        desc: 'Access to user email address',
        claims: ['email', 'email_verified'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'groups', 
        desc: 'Access to user group memberships',
        claims: ['groups'],
        riskLevel: 'medium',
        category: 'Authorization'
      },
      { 
        name: 'offline_access', 
        desc: 'Request refresh token for offline access',
        claims: ['(Refresh Token)'],
        riskLevel: 'medium',
        category: 'Access'
      },
      { 
        name: 'okta.users.read', 
        desc: 'Read user information from Okta',
        permissions: ['Read user profiles', 'List users'],
        riskLevel: 'medium',
        category: 'Admin'
      },
      { 
        name: 'okta.users.manage', 
        desc: 'Manage users in Okta',
        permissions: ['Create users', 'Update users', 'Deactivate users'],
        riskLevel: 'high',
        category: 'Admin'
      },
    ],
    examples: [
      {
        title: 'Basic SSO',
        description: 'Standard single sign-on with profile',
        scopes: ['openid', 'profile', 'email']
      },
      {
        title: 'Group-Based Authorization',
        description: 'Include group memberships for RBAC',
        scopes: ['openid', 'profile', 'email', 'groups']
      },
      {
        title: 'Admin Dashboard',
        description: 'User management capabilities',
        scopes: ['openid', 'profile', 'okta.users.read', 'okta.users.manage']
      }
    ]
  },
  auth0: {
    name: 'Auth0',
    scopes: [
      { 
        name: 'openid', 
        desc: 'Required for OIDC authentication',
        claims: ['sub'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'profile', 
        desc: 'User profile information',
        claims: ['name', 'nickname', 'picture', 'updated_at'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'email', 
        desc: 'User email address',
        claims: ['email', 'email_verified'],
        riskLevel: 'low',
        category: 'Identity'
      },
      { 
        name: 'offline_access', 
        desc: 'Request refresh token',
        claims: ['(Refresh Token)'],
        riskLevel: 'medium',
        category: 'Access'
      },
      { 
        name: 'read:users', 
        desc: 'Read user information (custom API)',
        permissions: ['Read user data from your API'],
        riskLevel: 'medium',
        category: 'Custom API'
      },
      { 
        name: 'write:users', 
        desc: 'Create and update users (custom API)',
        permissions: ['Create users', 'Update user data'],
        riskLevel: 'high',
        category: 'Custom API'
      },
      { 
        name: 'delete:users', 
        desc: 'Delete users (custom API)',
        permissions: ['Delete user accounts'],
        riskLevel: 'high',
        category: 'Custom API'
      },
    ],
    examples: [
      {
        title: 'Social Login',
        description: 'Basic authentication with profile',
        scopes: ['openid', 'profile', 'email']
      },
      {
        title: 'Mobile App',
        description: 'With offline access for refresh tokens',
        scopes: ['openid', 'profile', 'email', 'offline_access']
      },
      {
        title: 'Admin API Access',
        description: 'Full user management via custom API',
        scopes: ['openid', 'profile', 'read:users', 'write:users', 'delete:users']
      }
    ]
  }
};

const getRiskColor = (level?: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getRiskIcon = (level?: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low': return <ShieldCheckIcon className="h-4 w-4" />;
    case 'medium': return <EyeIcon className="h-4 w-4" />;
    case 'high': return <AlertTriangleIcon className="h-4 w-4" />;
    default: return <SearchIcon className="h-4 w-4" />;
  }
};

const ScopeExplorer: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('oidc');
  const [activeScope, setActiveScope] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const currentProvider = providerData[selectedProvider];
  const activeScopeData = currentProvider.scopes.find(s => s.name === activeScope);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Scope Explorer</h2>
        <p className="text-slate-600 mb-4">
          Explore OAuth 2.0 and OIDC scopes across different identity providers. Understand what permissions each scope grants and see real-world usage examples.
        </p>

        {/* Provider Selector */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(providerData) as Provider[]).map(provider => (
            <button
              key={provider}
              onClick={() => {
                setSelectedProvider(provider);
                setActiveScope(null);
                setSelectedExample(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedProvider === provider
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600'
              }`}
            >
              {providerData[provider].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scope List */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Available Scopes</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-h-[600px] overflow-y-auto">
            {currentProvider.scopes.map(scope => (
              <button
                key={scope.name}
                onClick={() => setActiveScope(scope.name)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-start gap-2 ${
                  activeScope === scope.name ? 'bg-sky-50 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold text-sky-700 text-sm break-all">{scope.name}</div>
                  {scope.category && (
                    <div className="text-xs text-slate-500 mt-1">{scope.category}</div>
                  )}
                </div>
                {scope.riskLevel && (
                  <div className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold border ${getRiskColor(scope.riskLevel)}`}>
                    {scope.riskLevel}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Details */}
        <div className="lg:col-span-2">
          {activeScope && activeScopeData ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg border ${getRiskColor(activeScopeData.riskLevel)}`}>
                  {getRiskIcon(activeScopeData.riskLevel)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 font-mono break-all">{activeScopeData.name}</h3>
                    {activeScopeData.riskLevel && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRiskColor(activeScopeData.riskLevel)}`}>
                        {activeScopeData.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                  </div>
                  {activeScopeData.category && (
                    <div className="text-sm text-slate-500">{activeScopeData.category}</div>
                  )}
                </div>
              </div>

              <p className="text-slate-600 mb-6 border-b border-slate-100 pb-4">{activeScopeData.desc}</p>

              {activeScopeData.permissions && activeScopeData.permissions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Permissions Granted</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {activeScopeData.permissions.map(permission => (
                      <div key={permission} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-sm">
                        <EyeIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeScopeData.claims && activeScopeData.claims.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Associated Claims</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {activeScopeData.claims.map(claim => (
                      <div key={claim} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-mono text-sm">
                        <EyeIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeScopeData.riskLevel === 'high' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-red-900 mb-1">High-Risk Scope</h5>
                      <p className="text-sm text-red-700">
                        This scope grants significant permissions. Only request it if absolutely necessary and ensure users understand what they're granting access to.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 p-12 text-center min-h-[400px]">
              <SearchIcon className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-1">Select a scope to view details</p>
              <p className="text-sm">Choose from the list on the left to see permissions and claims</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-World Examples */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Real-World Examples for {currentProvider.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentProvider.examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedExample(selectedExample === idx ? null : idx)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedExample === idx
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-slate-200 hover:border-sky-300 bg-white'
              }`}
            >
              <h4 className="font-bold text-slate-900 mb-2">{example.title}</h4>
              <p className="text-sm text-slate-600 mb-3">{example.description}</p>
              {selectedExample === idx && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Scopes:</div>
                  <div className="space-y-1">
                    {example.scopes.map(scope => (
                      <div key={scope} className="text-xs font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                        {scope}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
        <h3 className="text-lg font-bold text-slate-900 mb-3">🔒 Scope Security Best Practices</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
            <span><strong>Principle of Least Privilege:</strong> Request only the scopes you actually need</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
            <span><strong>Incremental Consent:</strong> Request additional scopes only when needed, not upfront</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
            <span><strong>Read-Only First:</strong> Prefer read-only scopes when write access isn't required</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold flex-shrink-0">✗</span>
            <span><strong>Avoid Scope Creep:</strong> Don't request broad permissions "just in case"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold flex-shrink-0">✗</span>
            <span><strong>User Trust:</strong> Excessive scope requests lead to consent fatigue and abandoned sign-ups</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ArrowRightIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default ScopeExplorer;
