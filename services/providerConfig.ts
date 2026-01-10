
export interface ProviderConfig {
    id: string;
    name: string;
    description: string;
    color: string;
    issuer: string;
    authorizeEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint: string;
    scopes: string[];
    quirks: {
        title: string;
        description: string;
    }[];
}

export const providerConfigs: Record<string, ProviderConfig> = {
    generic: {
        id: 'generic',
        name: 'Generic OAuth',
        description: 'Standard OAuth 2.0 / OIDC implementation.',
        color: 'sky',
        issuer: 'https://auth-server.com',
        authorizeEndpoint: 'https://auth-server.com/authorize',
        tokenEndpoint: 'https://auth-server.com/token',
        userInfoEndpoint: 'https://auth-server.com/userinfo',
        scopes: ['openid', 'profile', 'email'],
        quirks: [
            { title: 'Standard Flow', description: 'Uses the basic Authorization Code Flow with optional PKCE.' }
        ]
    },
    google: {
        id: 'google',
        name: 'Google',
        description: 'Google Identity Services for Web.',
        color: 'red',
        issuer: 'https://accounts.google.com',
        authorizeEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
        scopes: ['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        quirks: [
            { title: 'Incremental Auth', description: 'Google supports requesting additional scopes over time.' },
            { title: 'Access Type', description: 'Use `access_type=offline` to receive a refresh token.' },
            { title: 'Prompt Parameter', description: '`prompt=consent` ensures the user sees the consent screen again.' }
        ]
    },
    microsoft: {
        id: 'microsoft',
        name: 'Microsoft',
        description: 'Microsoft Entra ID (formerly Azure AD).',
        color: 'blue',
        issuer: 'https://login.microsoftonline.com/{tenant}/v2.0',
        authorizeEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoEndpoint: 'https://graph.microsoft.com/oidc/userinfo',
        scopes: ['openid', 'profile', 'offline_access', 'User.Read'],
        quirks: [
            { title: 'v2.0 Endpoints', description: 'Always use v2.0 for OIDC/OAuth 2.0 convergence.' },
            { title: 'Tenant Scoping', description: 'Use `/common`, `/organizations`, `/consumers`, or a specific Tenant ID.' },
            { title: 'Static Scopes', description: 'OIDC scopes are often mapped to Graph API permissions.' }
        ]
    },
    okta: {
        id: 'okta',
        name: 'Okta',
        description: 'Okta Customer Identity Cloud.',
        color: 'indigo',
        issuer: 'https://{yourDomain}.okta.com',
        authorizeEndpoint: 'https://{yourDomain}.okta.com/oauth2/v1/authorize',
        tokenEndpoint: 'https://{yourDomain}.okta.com/oauth2/v1/token',
        userInfoEndpoint: 'https://{yourDomain}.okta.com/oauth2/v1/userinfo',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        quirks: [
            { title: 'Custom Auth Servers', description: 'Okta suggests using a "Custom Authorization Server" for more control.' },
            { title: 'Org vs Custom', description: 'The Org Authorization Server has limited scope support compared to Custom.' },
            { title: 'PKCE by Default', description: 'Okta strongly enforces PKCE for all public clients.' }
        ]
    }
};
