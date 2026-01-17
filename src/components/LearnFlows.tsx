
import React, { useState } from 'react';
import { AppView } from './Sidebar';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface ExpandableCardProps {
  title: string;
  badge?: string;
  summary: string;
  children: React.ReactNode;
  onLinkClick?: () => void;
  linkText?: string;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, badge, summary, children, onLinkClick, linkText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-700">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{summary}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-slate-700 space-y-4 prose prose-sm max-w-none animate-fade-in">
            {children}
          </div>
        )}

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4" />
                Learn More
              </>
            )}
          </button>
          {onLinkClick && (
            <button
              onClick={onLinkClick}
              className="ml-auto text-sky-600 hover:text-sky-700 text-sm font-bold flex items-center transition-colors"
            >
              {linkText || 'Try the Tool'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface LearnFlowsProps {
  setActiveView: (view: AppView) => void;
}

const LearnFlows: React.FC<LearnFlowsProps> = ({ setActiveView }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Learning Center</h2>
        <p className="text-slate-600 max-w-3xl">
          Master modern authentication protocols, security vulnerabilities, and best practices. Each topic includes detailed explanations, real-world examples, and hands-on tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpandableCard
          title="JSON Web Tokens (JWT)"
          badge="OAuth/OIDC"
          summary="Compact, URL-safe tokens for securely transmitting claims between parties. The foundation of modern authentication."
          onLinkClick={() => setActiveView(AppView.DECODE)}
          linkText="Open JWT Decoder"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Structure</h4>
            <p className="text-sm mb-3">A JWT consists of three Base64URL-encoded parts separated by dots:</p>
            <div className="bg-slate-50 p-3 rounded font-mono text-xs mb-3 overflow-x-auto">
              <span className="text-red-600">header</span>.<span className="text-purple-600">payload</span>.<span className="text-blue-600">signature</span>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong className="text-red-600">Header:</strong> Algorithm and token type (e.g., <code>{"alg: 'RS256', typ: 'JWT'"}</code>)</li>
              <li><strong className="text-purple-600">Payload:</strong> Claims about the user (e.g., <code>sub, iss, exp, email</code>)</li>
              <li><strong className="text-blue-600">Signature:</strong> Cryptographic signature to verify integrity</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Common Algorithms</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li><code>HS256</code> - HMAC with SHA-256 (symmetric, shared secret)</li>
              <li><code>RS256</code> - RSA with SHA-256 (asymmetric, public/private key)</li>
              <li><code>ES256</code> - ECDSA with SHA-256 (asymmetric, elliptic curve)</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Security Considerations</h4>
            <ul className="text-sm space-y-1">
              <li>⚠️ <strong>Algorithm Confusion:</strong> Always validate the <code>alg</code> header</li>
              <li>⚠️ <strong>Weak Secrets:</strong> Use strong, random secrets for HS256</li>
              <li>⚠️ <strong>Expiration:</strong> Always set <code>exp</code> claim and validate it</li>
              <li>⚠️ <strong>Sensitive Data:</strong> JWTs are encoded, not encrypted - don't store secrets</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Real-World Example:</strong> Google OAuth returns an ID Token (JWT) containing user info like email and name. The signature is verified using Google's public keys from their JWKS endpoint.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Authorization Code Flow"
          badge="OAuth 2.0"
          summary="The most secure OAuth flow. Exchanges an authorization code for tokens via a backend channel, keeping secrets safe."
          onLinkClick={() => setActiveView(AppView.FLOWS)}
          linkText="Visualize Flow"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">How It Works</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>User clicks "Login with Google" in your app</li>
              <li>App redirects to IdP with <code>client_id</code>, <code>redirect_uri</code>, <code>scope</code>, <code>state</code></li>
              <li>User authenticates and consents to permissions</li>
              <li>IdP redirects back with an authorization <code>code</code></li>
              <li>Your backend exchanges the code for tokens at the token endpoint</li>
              <li>Backend receives <code>access_token</code>, <code>id_token</code>, and optionally <code>refresh_token</code></li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">PKCE Extension</h4>
            <p className="text-sm mb-3">
              <strong>Proof Key for Code Exchange</strong> adds security for public clients (mobile/SPA apps) that can't securely store a client secret.
            </p>
            <ul className="text-sm space-y-1 mb-4">
              <li>App generates random <code>code_verifier</code></li>
              <li>Sends SHA256 hash as <code>code_challenge</code> in auth request</li>
              <li>Sends original <code>code_verifier</code> when exchanging code</li>
              <li>IdP verifies the hash matches, preventing code interception attacks</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Security Best Practices</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Always use <code>state</code> parameter to prevent CSRF</li>
              <li>✅ Validate <code>redirect_uri</code> matches registered URIs</li>
              <li>✅ Use PKCE even for confidential clients</li>
              <li>✅ Exchange code immediately (codes expire in ~10 minutes)</li>
              <li>✅ Store tokens securely (HttpOnly cookies or secure storage)</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Real-World:</strong> GitHub OAuth uses this flow. After you authorize an app, GitHub redirects with a code like <code>?code=abc123&state=xyz</code>. The app's backend then exchanges this code for an access token to call GitHub's API.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Client Assertions (private_key_jwt)"
          badge="Advanced"
          summary="Authenticate your application to an IdP using asymmetric cryptography instead of a shared secret. More secure and scalable."
          onLinkClick={() => setActiveView(AppView.OIDC_ASSERTION)}
          linkText="Generate Assertion"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Why Use Client Assertions?</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>No Shared Secrets:</strong> Your private key never leaves your server</li>
              <li><strong>Key Rotation:</strong> Easier to rotate keys than secrets across systems</li>
              <li><strong>Compliance:</strong> Required for some high-security environments (banking, healthcare)</li>
              <li><strong>Multi-Tenant:</strong> Each tenant can have their own key pair</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">How It Works</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>Generate an RSA or ECDSA key pair</li>
              <li>Upload the public key to your IdP (Google, Okta, etc.)</li>
              <li>Create a JWT signed with your private key containing:
                <ul className="ml-6 mt-1 space-y-1">
                  <li><code>iss</code>: Your client_id</li>
                  <li><code>sub</code>: Your client_id</li>
                  <li><code>aud</code>: IdP's token endpoint</li>
                  <li><code>exp</code>: Expiration (usually 5 minutes)</li>
                </ul>
              </li>
              <li>Send the JWT as <code>client_assertion</code> when requesting tokens</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Provider Setup</h4>
            <div className="text-sm space-y-2">
              <p><strong>Google:</strong> Upload JWK to service account in GCP Console</p>
              <p><strong>Microsoft:</strong> Add certificate to app registration in Azure AD</p>
              <p><strong>Okta:</strong> Configure public key in application settings</p>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded text-sm border border-amber-200">
              <strong>⚡ Try It:</strong> Use the <button onClick={() => setActiveView(AppView.KEYS)} className="text-sky-600 underline font-semibold">Key Manager</button> to generate a key pair, then create an assertion in this tool to test with your IdP.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Device Authorization Flow"
          badge="OAuth 2.0"
          summary="Authenticate on devices without a browser or keyboard. Perfect for Smart TVs, IoT devices, and CLI tools."
          onLinkClick={() => setActiveView(AppView.DEVICE_FLOW)}
          linkText="See Simulation"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">The User Experience</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>Device displays: "Go to <strong>google.com/device</strong> and enter code: <strong>ABCD-EFGH</strong>"</li>
              <li>User opens the URL on their phone/computer</li>
              <li>User enters the code and authenticates</li>
              <li>User grants permissions to the device</li>
              <li>Device receives tokens and logs the user in</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Technical Flow</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>Device requests <code>device_code</code> and <code>user_code</code> from IdP</li>
              <li>Device displays <code>user_code</code> and <code>verification_uri</code></li>
              <li>Device polls token endpoint every few seconds with <code>device_code</code></li>
              <li>IdP returns <code>authorization_pending</code> until user completes auth</li>
              <li>Once approved, IdP returns <code>access_token</code> and <code>refresh_token</code></li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Implementation Tips</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li>Respect <code>interval</code> parameter (usually 5 seconds) to avoid rate limiting</li>
              <li>Handle <code>slow_down</code> error by increasing poll interval</li>
              <li>Set reasonable timeout (e.g., 15 minutes) before expiring the code</li>
              <li>Show QR code for easier mobile access to verification URL</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Real-World Examples:</strong> YouTube TV, Netflix, AWS CLI, GitHub CLI all use device flow. It's the standard for any device where typing is difficult.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="XML Signature Wrapping (XSW)"
          badge="SAML Attack"
          summary="A critical SAML vulnerability where attackers manipulate XML structure to bypass signature validation and impersonate users."
          onLinkClick={() => setActiveView(AppView.XSW_SIMULATOR)}
          linkText="Try Attack Simulation"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">The Vulnerability</h4>
            <p className="text-sm mb-3">
              SAML responses contain a digital signature that validates the assertion. However, XML parsers and signature validators may process the document differently, allowing an attacker to inject malicious content that passes validation but changes the user identity.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">Attack Technique</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>Attacker intercepts a valid SAML response for <code>victim@example.com</code></li>
              <li>Attacker creates a new assertion claiming to be <code>attacker@example.com</code></li>
              <li>Attacker "wraps" the valid signature around the malicious assertion</li>
              <li>Signature validator checks the original (valid) assertion</li>
              <li>Application parser reads the malicious assertion</li>
              <li>Attacker gains access as any user</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Mitigation Strategies</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li>✅ Validate signature <strong>before</strong> parsing assertions</li>
              <li>✅ Use schema validation to reject unexpected XML structures</li>
              <li>✅ Verify the signature references the exact assertion being processed</li>
              <li>✅ Use modern SAML libraries that are XSW-resistant</li>
              <li>✅ Consider migrating to OIDC (not vulnerable to XSW)</li>
            </ul>

            <div className="mt-4 p-3 bg-red-50 rounded text-sm border border-red-200">
              <strong>⚠️ Impact:</strong> XSW has been found in major enterprise SSO systems. Successful exploitation allows complete account takeover without knowing passwords. Always test your SAML implementation!
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Single Logout (SLO)"
          badge="SAML/OIDC"
          summary="Terminate user sessions across multiple applications simultaneously. Critical for security in federated environments."
          onLinkClick={() => setActiveView(AppView.LOGOUT_EXPLORER)}
          linkText="Explore Logout Flows"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Why SLO Matters</h4>
            <p className="text-sm mb-3">
              When a user logs into multiple apps via SSO, they have sessions in each app. Logging out of one app should terminate all sessions to prevent unauthorized access.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">SAML SLO Flow</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>User clicks logout in App A (Service Provider)</li>
              <li>App A sends <code>LogoutRequest</code> to IdP</li>
              <li>IdP terminates its session and sends <code>LogoutRequest</code> to all other SPs</li>
              <li>Each SP terminates its session and responds with <code>LogoutResponse</code></li>
              <li>IdP sends final <code>LogoutResponse</code> to App A</li>
              <li>User is fully logged out everywhere</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">OIDC Logout Methods</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>RP-Initiated Logout:</strong> App redirects to IdP's <code>end_session_endpoint</code></li>
              <li><strong>Front-Channel Logout:</strong> IdP embeds iframes to notify apps via browser</li>
              <li><strong>Back-Channel Logout:</strong> IdP sends HTTP POST directly to apps (more reliable)</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Common Issues</h4>
            <ul className="text-sm space-y-1">
              <li>⚠️ Apps not registered for SLO notifications</li>
              <li>⚠️ Network timeouts causing incomplete logout</li>
              <li>⚠️ Browser blocking third-party cookies (breaks front-channel)</li>
              <li>⚠️ Apps not validating logout requests (security risk)</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Best Practice:</strong> Implement both front-channel and back-channel logout for redundancy. Always clear local sessions even if IdP notification fails.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="SAML Metadata & Trust"
          badge="SAML"
          summary="SAML relies on pre-exchanged metadata XML files containing certificates and endpoints. Understanding metadata is key to SAML integration."
          onLinkClick={() => setActiveView(AppView.SAML)}
          linkText="Open SAML Tools"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">What is Metadata?</h4>
            <p className="text-sm mb-3">
              SAML metadata is an XML document that describes a SAML entity (IdP or SP). It contains everything needed to establish trust and communicate: certificates, endpoints, supported bindings, and entity identifiers.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">Key Components</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>EntityID:</strong> Unique identifier (usually a URL)</li>
              <li><strong>X.509 Certificates:</strong> Public keys for signature validation and encryption</li>
              <li><strong>SSO Endpoints:</strong> Where to send authentication requests</li>
              <li><strong>SLO Endpoints:</strong> Where to send logout requests</li>
              <li><strong>NameID Formats:</strong> Supported user identifier formats</li>
              <li><strong>Attribute Mappings:</strong> User attributes the IdP can provide</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Setup Process</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>SP generates metadata with its certificate and ACS endpoint</li>
              <li>SP uploads metadata to IdP (or provides EntityID for dynamic fetch)</li>
              <li>IdP provides its metadata URL or file</li>
              <li>SP imports IdP metadata to configure trust</li>
              <li>Both parties validate certificates and endpoints</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Security Considerations</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Always validate metadata signatures if provided</li>
              <li>✅ Use HTTPS for metadata URLs to prevent MITM attacks</li>
              <li>✅ Regularly refresh metadata to catch certificate rotations</li>
              <li>✅ Verify EntityID matches expected value</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Pro Tip:</strong> Most IdPs provide a metadata URL that auto-updates. Use this instead of static files to automatically handle certificate rotation.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Refresh Tokens"
          badge="OAuth 2.0"
          summary="Long-lived credentials for obtaining new access tokens without re-authentication. Critical for mobile and SPA security."
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Why Refresh Tokens?</h4>
            <p className="text-sm mb-3">
              Access tokens are short-lived (15 minutes to 1 hour) for security. Refresh tokens allow apps to get new access tokens without forcing users to log in repeatedly.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">How They Work</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>User authenticates and app receives <code>access_token</code> and <code>refresh_token</code></li>
              <li>App uses <code>access_token</code> to call APIs</li>
              <li>When <code>access_token</code> expires, app sends <code>refresh_token</code> to token endpoint</li>
              <li>IdP validates <code>refresh_token</code> and issues new <code>access_token</code></li>
              <li>Optionally, IdP also issues a new <code>refresh_token</code> (rotation)</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Refresh Token Rotation</h4>
            <p className="text-sm mb-3">
              Modern best practice: issue a new refresh token with each use and invalidate the old one. This limits the damage if a token is stolen.
            </p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✅ Detects token theft (old token used after rotation)</li>
              <li>✅ Limits replay attack window</li>
              <li>✅ Allows automatic revocation of token families</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Storage Best Practices</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li><strong>Web Apps:</strong> HttpOnly, Secure, SameSite cookies</li>
              <li><strong>Mobile Apps:</strong> OS-provided secure storage (Keychain, KeyStore)</li>
              <li><strong>SPAs:</strong> In-memory only, or use BFF (Backend-for-Frontend) pattern</li>
              <li>❌ <strong>Never:</strong> localStorage, sessionStorage, or regular cookies</li>
            </ul>

            <div className="mt-4 p-3 bg-amber-50 rounded text-sm border border-amber-200">
              <strong>⚠️ Security:</strong> Refresh tokens are powerful. If stolen, an attacker has long-term access. Always use rotation, set expiration (30-90 days), and implement revocation.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="OpenID Connect (OIDC)"
          badge="Identity Layer"
          summary="An identity layer built on OAuth 2.0. Standardizes user authentication and profile data retrieval across providers."
          onLinkClick={() => setActiveView(AppView.OIDC_DISCOVERY)}
          linkText="Explore Discovery"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">OIDC vs OAuth 2.0</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>OAuth 2.0:</strong> Authorization framework (what can you access?)</li>
              <li><strong>OIDC:</strong> Authentication protocol (who are you?) built on OAuth</li>
              <li>OIDC adds <code>id_token</code> (JWT) containing user identity claims</li>
              <li>OIDC standardizes discovery, scopes, and user info endpoint</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Discovery Document</h4>
            <p className="text-sm mb-3">
              Every OIDC provider publishes a discovery document at <code>/.well-known/openid-configuration</code> containing:
            </p>
            <ul className="text-sm space-y-1 mb-4">
              <li><code>authorization_endpoint</code> - Where to send auth requests</li>
              <li><code>token_endpoint</code> - Where to exchange codes for tokens</li>
              <li><code>userinfo_endpoint</code> - Where to fetch user profile</li>
              <li><code>jwks_uri</code> - Public keys for token validation</li>
              <li><code>scopes_supported</code> - Available scopes</li>
              <li><code>response_types_supported</code> - Supported OAuth flows</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Standard Scopes</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li><code>openid</code> - Required, enables OIDC</li>
              <li><code>profile</code> - Name, picture, birthdate, etc.</li>
              <li><code>email</code> - Email address and verification status</li>
              <li><code>address</code> - Physical mailing address</li>
              <li><code>phone</code> - Phone number and verification status</li>
              <li><code>offline_access</code> - Request refresh token</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">ID Token vs Access Token</h4>
            <ul className="text-sm space-y-1">
              <li><strong>ID Token:</strong> JWT for the app, contains user identity, not for APIs</li>
              <li><strong>Access Token:</strong> For calling APIs, may be JWT or opaque</li>
              <li>Never send ID tokens to APIs - they're meant for your app only</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Try It:</strong> Visit <code>https://accounts.google.com/.well-known/openid-configuration</code> to see Google's OIDC discovery document.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="OAuth 2.0 Scopes"
          badge="Authorization"
          summary="Scopes define what permissions an access token grants. Understanding scopes is critical for implementing least-privilege access."
          onLinkClick={() => setActiveView(AppView.SCOPES)}
          linkText="Explore Scopes"
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">What Are Scopes?</h4>
            <p className="text-sm mb-3">
              Scopes are space-delimited strings that represent permissions. When requesting tokens, you specify which scopes you need. The user must consent, and the resulting token is limited to those scopes.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">Scope Syntax</h4>
            <div className="text-sm space-y-2 mb-4">
              <p><strong>OIDC Standard:</strong> <code>openid profile email</code></p>
              <p><strong>Google:</strong> <code>https://www.googleapis.com/auth/gmail.readonly</code></p>
              <p><strong>Microsoft Graph:</strong> <code>Mail.Read User.Read Files.ReadWrite</code></p>
              <p><strong>Custom API:</strong> <code>api://my-api/read api://my-api/write</code></p>
            </div>

            <h4 className="font-bold text-slate-900 mb-2">Principle of Least Privilege</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li>✅ Request only the scopes you actually need</li>
              <li>✅ Use read-only scopes when possible</li>
              <li>✅ Request additional scopes incrementally (incremental consent)</li>
              <li>❌ Don't request broad scopes "just in case"</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Security Risks</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li><strong>Scope Creep:</strong> Gradually requesting more permissions over time</li>
              <li><strong>Over-Privileged Tokens:</strong> Tokens with unnecessary scopes increase attack surface</li>
              <li><strong>Consent Fatigue:</strong> Users blindly accepting permissions</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Example:</strong> An email client should request <code>gmail.readonly</code>, not <code>gmail.modify</code>. If it only displays emails, why give it permission to delete them?
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="PKCE (Proof Key for Code Exchange)"
          badge="OAuth 2.0"
          summary="Essential security extension for mobile and single-page apps. Prevents authorization code interception attacks."
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">The Problem PKCE Solves</h4>
            <p className="text-sm mb-3">
              Public clients (mobile apps, SPAs) can't securely store a client secret. Without PKCE, an attacker who intercepts the authorization code can exchange it for tokens.
            </p>

            <h4 className="font-bold text-slate-900 mb-2">How PKCE Works</h4>
            <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
              <li>App generates random <code>code_verifier</code> (43-128 characters)</li>
              <li>App creates <code>code_challenge</code> = BASE64URL(SHA256(code_verifier))</li>
              <li>App sends <code>code_challenge</code> and <code>code_challenge_method=S256</code> in auth request</li>
              <li>IdP stores the challenge and returns authorization code</li>
              <li>App sends original <code>code_verifier</code> when exchanging code</li>
              <li>IdP hashes the verifier and compares to stored challenge</li>
              <li>If match, IdP issues tokens; otherwise, request fails</li>
            </ol>

            <h4 className="font-bold text-slate-900 mb-2">Why It's Secure</h4>
            <ul className="text-sm space-y-1 mb-4">
              <li>Attacker intercepts code but doesn't have <code>code_verifier</code></li>
              <li><code>code_verifier</code> never leaves the app (not in URL)</li>
              <li>Can't reverse SHA256 to get verifier from challenge</li>
              <li>Each auth request uses a unique verifier (no replay)</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Best Practices</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Use PKCE for ALL OAuth flows, even confidential clients</li>
              <li>✅ Use <code>S256</code> method, not <code>plain</code></li>
              <li>✅ Generate cryptographically random verifiers</li>
              <li>✅ Store verifier securely until code exchange completes</li>
            </ul>

            <div className="mt-4 p-3 bg-sky-50 rounded text-sm">
              <strong>Industry Standard:</strong> OAuth 2.1 (upcoming spec) makes PKCE mandatory for all clients. Major providers already require it for public clients.
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Multi-Factor Authentication (MFA)"
          badge="Security"
          summary="Add an extra layer of security beyond passwords. Essential for protecting sensitive accounts and meeting compliance requirements."
        >
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Authentication Factors</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>Something you know:</strong> Password, PIN, security questions</li>
              <li><strong>Something you have:</strong> Phone, hardware token, smart card</li>
              <li><strong>Something you are:</strong> Fingerprint, face, voice</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Common MFA Methods</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li><strong>TOTP (Time-based OTP):</strong> Google Authenticator, Authy - generates 6-digit codes</li>
              <li><strong>SMS/Email OTP:</strong> Code sent to phone/email (less secure, but accessible)</li>
              <li><strong>Push Notifications:</strong> Approve login on trusted device (Duo, Okta Verify)</li>
              <li><strong>WebAuthn/FIDO2:</strong> Hardware keys (YubiKey) or platform authenticators (Touch ID)</li>
              <li><strong>Backup Codes:</strong> One-time use codes for account recovery</li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-2">Security Comparison</h4>
            <div className="text-sm space-y-1 mb-4">
              <p>🔒 <strong>Most Secure:</strong> WebAuthn/FIDO2 (phishing-resistant)</p>
              <p>🔒 <strong>Very Secure:</strong> TOTP, Push notifications</p>
              <p>⚠️ <strong>Less Secure:</strong> SMS (SIM swap attacks), Email (account compromise)</p>
            </div>

            <h4 className="font-bold text-slate-900 mb-2">Implementation Considerations</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Support multiple MFA methods for accessibility</li>
              <li>✅ Provide backup codes for account recovery</li>
              <li>✅ Allow users to manage trusted devices</li>
              <li>✅ Implement step-up authentication for sensitive actions</li>
              <li>⚠️ Never make SMS the only MFA option</li>
            </ul>

            <div className="mt-4 p-3 bg-amber-50 rounded text-sm border border-amber-200">
              <strong>Compliance:</strong> Many regulations (PCI-DSS, HIPAA, SOC 2) require MFA for accessing sensitive data. Plan for this early in your architecture.
            </div>
          </div>
        </ExpandableCard>
      </div>
    </div>
  );
};

export default LearnFlows;
