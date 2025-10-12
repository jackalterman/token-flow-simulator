
import React from 'react';

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <div className="text-slate-600 space-y-3 prose prose-sm max-w-none">
            {children}
        </div>
    </div>
);

const LearnFlows: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Learning Center</h2>
      <p className="text-slate-600 mb-6 max-w-3xl">
        A brief overview of the key concepts in modern token-based authentication. Good references include the official RFCs, "OAuth 2.0 Simplified" by Aaron Parecki, and various online guides.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="What is a JWT?">
          <p>
            A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. It consists of three parts separated by dots (`.`):
          </p>
          <ul>
            <li><strong>Header:</strong> Metadata about the token, like the signing algorithm (e.g., HS256) and token type (JWT).</li>
            <li><strong>Payload:</strong> Contains the claims, which are statements about an entity (typically, the user) and additional data. Common claims include `sub` (subject), `iss` (issuer), `exp` (expiration time), etc.</li>
            <li><strong>Signature:</strong> A cryptographic signature used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.</li>
          </ul>
          <p>JWTs are self-contained and are commonly used in stateless authentication mechanisms.</p>
        </Card>

        <Card title="Authorization Code Flow">
          <p>
            This is the most common and secure OAuth 2.0 flow, ideal for traditional web applications where logic can be handled on a server.
          </p>
          <ol>
            <li>The user is redirected from the application to the authorization server (e.g., Google, GitHub).</li>
            <li>The user logs in and grants consent.</li>
            <li>The authorization server redirects the user back to the application with a temporary <strong>authorization code</strong>.</li>
            <li>The application's backend server exchanges this code (along with a client secret) directly with the authorization server for an <strong>access token</strong> and optionally a <strong>refresh token</strong>.</li>
            <li>The application can now use the access token to call the resource server (API) on behalf of the user.</li>
          </ol>
          <p>This flow is secure because the access token is never exposed to the user's browser.</p>
        </Card>

        <Card title="Implicit Flow (Legacy)">
          <p>
            This flow was designed for Single-Page Applications (SPAs) but is now considered legacy and <strong>not recommended</strong>. It has been largely replaced by the Authorization Code Flow with PKCE.
          </p>
          <ol>
            <li>The user is redirected to the authorization server.</li>
            <li>After login and consent, the server redirects back to the application with the <strong>access token</strong> directly in the URL fragment.</li>
            <li>The SPA extracts the token from the URL and uses it to make API calls.</li>
          </ol>
          <p>
            This flow is less secure because the access token is exposed in the browser, making it more vulnerable to interception and leakage.
          </p>
        </Card>

         <Card title="Refresh Tokens">
          <p>
            Access tokens are typically short-lived for security. A <strong>refresh token</strong> is a special, long-lived credential used to obtain new access tokens without requiring the user to log in again.
          </p>
          <ul>
              <li>When the original access token expires, the application sends the refresh token to the authorization server.</li>
              <li>If the refresh token is valid, the server issues a new access token (and sometimes a new refresh token).</li>
              <li>Refresh tokens must be stored securely (e.g., in an `HttpOnly` cookie or secure storage on a server) as they provide long-term access to a user's account.</li>
          </ul>
        </Card>

        <Card title="OpenID Connect (OIDC)">
          <p>
            OIDC is a thin layer on top of OAuth 2.0. While OAuth 2.0 is about <strong>authorization</strong> (granting access to resources), OIDC is about <strong>authentication</strong> (proving a user's identity).
          </p>
          <p>
            It introduces the concept of an <strong>ID Token</strong>, which is a JWT containing claims about the authentication event, such as who the user is, when they logged in, and which client they used. This allows an application to verify the user's identity based on authentication performed by an Authorization Server.
          </p>
        </Card>

        <Card title="SAML vs. OAuth 2.0">
          <p>
            Both are standards for authentication and authorization, but they serve different primary purposes.
          </p>
          <ul>
            <li><strong>SAML (Security Assertion Markup Language)</strong> is an older, XML-based standard primarily used for enterprise single sign-on (SSO). It's focused on authenticating a user and communicating that identity to a service provider.</li>
            <li><strong>OAuth 2.0</strong> is a newer standard focused on delegated authorization. It allows an application to access resources on behalf of a user, without giving the application the user's credentials. It's the foundation for most modern "Login with..." features.</li>
          </ul>
           <p>OIDC builds on OAuth 2.0 to provide the SSO-like features that SAML is known for, but in a more modern, API-friendly way using JWTs.</p>
        </Card>
      </div>
    </div>
  );
};

export default LearnFlows;
