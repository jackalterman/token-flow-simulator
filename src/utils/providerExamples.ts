// Provider-specific OIDC examples and configurations

export interface ProviderExample {
  name: string;
  logo?: string;
  discoveryUrl: string;
  issuer: string;
  clientIdExample: string;
  audienceExample: string;
  scopes: string[];
  userInfoEndpoint: string;
  description: string;
}

export const providerExamples: Record<string, ProviderExample> = {
  google: {
    name: 'Google',
    discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
    issuer: 'https://accounts.google.com',
    clientIdExample: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
    audienceExample: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
    userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    description: 'Google Identity Platform - Get credentials from Google Cloud Console'
  },
  microsoft: {
    name: 'Microsoft',
    discoveryUrl: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    issuer: 'https://login.microsoftonline.com/{tenant}/v2.0',
    clientIdExample: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    audienceExample: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    userInfoEndpoint: 'https://graph.microsoft.com/oidc/userinfo',
    description: 'Microsoft Entra ID (Azure AD) - Get credentials from Azure Portal'
  },
  okta: {
    name: 'Okta',
    discoveryUrl: 'https://your-domain.okta.com/.well-known/openid-configuration',
    issuer: 'https://your-domain.okta.com',
    clientIdExample: '0oa1b2c3d4e5f6g7h8i9',
    audienceExample: 'api://default',
    scopes: ['openid', 'profile', 'email'],
    userInfoEndpoint: 'https://your-domain.okta.com/oauth2/v1/userinfo',
    description: 'Okta Identity Cloud - Replace "your-domain" with your Okta domain'
  },
  auth0: {
    name: 'Auth0',
    discoveryUrl: 'https://your-tenant.auth0.com/.well-known/openid-configuration',
    issuer: 'https://your-tenant.auth0.com/',
    clientIdExample: 'AbCdEfGhIjKlMnOpQrStUvWxYz123456',
    audienceExample: 'https://your-api.example.com',
    scopes: ['openid', 'profile', 'email'],
    userInfoEndpoint: 'https://your-tenant.auth0.com/userinfo',
    description: 'Auth0 - Replace "your-tenant" with your Auth0 tenant name'
  }
};

export const sampleIdTokens = {
  valid: {
    description: 'Valid ID Token (for testing structure)',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhdWQiOiIxMjM0NTY3ODkwMTItYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIyMzM0NDU1NjY3Nzg4OTkiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkpvaG4gRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcGhvdG8uanBnIiwiaWF0IjoxNzM3MTQwMDAwLCJleHAiOjE3MzcxNDM2MDB9.SIGNATURE_PLACEHOLDER',
    payload: {
      iss: 'https://accounts.google.com',
      aud: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
      sub: '112233445566778899',
      email: 'user@example.com',
      email_verified: true,
      name: 'John Doe',
      picture: 'https://example.com/photo.jpg',
      iat: 1737140000,
      exp: 1737143600
    }
  },
  expired: {
    description: 'Expired ID Token (for testing validation)',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhdWQiOiJ0ZXN0LWNsaWVudC1pZCIsInN1YiI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0.SIGNATURE_PLACEHOLDER'
  }
};

export const samplePrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1+fWIcPm15j9QIWN0dQ1xKnEplBHiXj0E9meuFMeQhRVF2
nL4jXwKRNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
EXAMPLE_PRIVATE_KEY_FOR_DEMONSTRATION_ONLY_DO_NOT_USE_IN_PRODUCTION
-----END PRIVATE KEY-----`;

export const educationalContent = {
  discovery: {
    title: 'OIDC Discovery Explorer',
    whatIsIt: 'The OIDC Discovery endpoint (/.well-known/openid-configuration) is a standardized URL that returns metadata about an OpenID Connect provider. It tells clients where to find authorization endpoints, token endpoints, supported scopes, and more.',
    whenToUse: [
      'When integrating with a new identity provider',
      'To find the correct endpoints for authentication flows',
      'To verify what features and algorithms a provider supports',
      'During troubleshooting to confirm provider configuration'
    ],
    howToGetCredentials: [
      'You don\'t need credentials to access the discovery endpoint - it\'s public',
      'Simply enter the issuer URL (e.g., accounts.google.com)',
      'The tool will automatically append /.well-known/openid-configuration'
    ],
    importantFields: {
      issuer: 'The unique identifier for this OIDC provider',
      authorization_endpoint: 'Where users are redirected to log in',
      token_endpoint: 'Where you exchange authorization codes for tokens',
      userinfo_endpoint: 'Where you fetch user profile information',
      jwks_uri: 'Public keys used to verify token signatures',
      scopes_supported: 'What user data you can request access to',
      response_types_supported: 'What OAuth flows are available'
    }
  },
  userinfo: {
    title: 'UserInfo Fetcher',
    whatIsIt: 'The UserInfo endpoint returns claims (information) about the authenticated user. It requires a valid access token obtained during the authentication flow.',
    whenToUse: [
      'After a user has successfully authenticated',
      'To get additional user profile information not in the ID token',
      'To verify the access token is still valid',
      'When you need fresh user data (not cached in tokens)'
    ],
    howToGetCredentials: [
      '1. Register your application with the identity provider',
      '2. Implement an OAuth/OIDC flow (Authorization Code, Implicit, etc.)',
      '3. After user login, you\'ll receive an access token',
      '4. Use that access token here to fetch user information',
      'Note: Access tokens are typically short-lived (1 hour) and look like JWTs or opaque strings'
    ],
    requiredScopes: 'You must request the "openid" scope at minimum. Add "profile" and "email" scopes to get more user information.',
    exampleResponse: {
      sub: '112233445566778899',
      name: 'John Doe',
      email: 'john.doe@example.com',
      email_verified: true,
      picture: 'https://example.com/photo.jpg'
    }
  },
  validator: {
    title: 'ID Token Validator',
    whatIsIt: 'An ID Token is a JWT that contains verified information about the authenticated user. This tool validates the token\'s signature, claims, and expiration.',
    whenToUse: [
      'To verify an ID token received from a client application',
      'During debugging to check why authentication is failing',
      'To inspect the claims inside an ID token',
      'To validate tokens before trusting their contents'
    ],
    howToGetCredentials: [
      '1. ID tokens are returned after successful authentication',
      '2. In Authorization Code flow, exchange the code for tokens at the token endpoint',
      '3. The response includes an id_token field',
      '4. Paste that token here to validate it'
    ],
    validationChecks: [
      'Signature: Verified using provider\'s public keys (JWKS)',
      'Issuer (iss): Must match the expected identity provider',
      'Audience (aud): Must match your application\'s client ID',
      'Expiration (exp): Token must not be expired',
      'Issued At (iat): Token must have a valid issue time',
      'Nonce: If present, must match the value sent in the auth request'
    ],
    structure: {
      header: 'Algorithm and key ID used for signing',
      payload: 'User claims and metadata (iss, aud, sub, exp, etc.)',
      signature: 'Cryptographic signature to verify authenticity'
    }
  },
  assertion: {
    title: 'JWT Bearer Assertion Generator',
    whatIsIt: 'A JWT Bearer Assertion is a signed JWT used for service-to-service authentication. It proves your application\'s identity without user interaction, commonly used in OAuth 2.0 Client Credentials flow.',
    whenToUse: [
      'Server-to-server authentication (no user involved)',
      'Service accounts and machine-to-machine communication',
      'Backend services calling APIs',
      'Automated processes that need API access'
    ],
    howToGetCredentials: [
      '1. Register a service account or application with your identity provider',
      '2. Generate an RSA key pair (use the Key Manager tool)',
      '3. Upload the public key to your identity provider',
      '4. Keep the private key secure in your application',
      '5. Use this tool to generate signed assertions',
      '6. Exchange the assertion for an access token at the token endpoint'
    ],
    requiredFields: {
      iss: 'Your client ID (identifies your application)',
      sub: 'Usually the same as iss for client credentials',
      aud: 'The token endpoint URL of the identity provider',
      privateKey: 'Your RSA private key in PEM format'
    },
    flow: [
      '1. Generate signed JWT assertion (this tool)',
      '2. POST to token endpoint with grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer',
      '3. Include assertion in the request body',
      '4. Receive access token in response',
      '5. Use access token to call APIs'
    ]
  }
};
