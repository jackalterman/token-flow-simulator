export interface HarAnalysis {
  isSlow: boolean;
  isLarge: boolean;
  hasErrors: boolean;
  authType?: 'OAuth2' | 'OIDC' | 'SAML' | 'Basic' | 'Bearer';
  securityIssues: string[];
}

export interface HarEntry {
  _id?: string; // Internal ID for stable keys
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    httpVersion: string;
    cookies: HarCookie[];
    headers: HarHeader[];
    queryString: any[];
    postData?: {
      mimeType: string;
      text?: string;
      params?: any[];
    };
    bodySize: number;
  };
  response: {
    status: number;
    statusText: string;
    httpVersion: string;
    cookies: HarCookie[];
    headers: HarHeader[];
    content: {
      size: number;
      mimeType: string;
      text?: string;
      encoding?: string;
    };
    redirectURL: string;
    bodySize: number;
  };
  serverIPAddress?: string;
  _resourceType?: string;
  analysis?: HarAnalysis;
}

export interface HarHeader {
  name: string;
  value: string;
}

export interface HarCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface HarLog {
  version: string;
  creator: {
    name: string;
    version: string;
  };
  entries: HarEntry[];
}

export interface HarRoot {
  log: HarLog;
}

export const analyzeEntry = (entry: HarEntry, averageTime: number = 500): HarAnalysis => {
  const securityIssues: string[] = [];
  const status = entry.response.status;
  
  // Auth Detection
  let authType: HarAnalysis['authType'];
  const authHeader = entry.request.headers.find(h => h.name.toLowerCase() === 'authorization')?.value || '';
  if (authHeader.startsWith('Bearer ')) authType = 'Bearer';
  else if (authHeader.startsWith('Basic ')) authType = 'Basic';
  
  if (entry.request.url.includes('SAMLRequest') || entry.request.postData?.text?.includes('SAMLResponse')) authType = 'SAML';
  if (entry.request.url.includes('code=') && entry.request.url.includes('state=')) authType = 'OAuth2';

  // Security Issues
  const hasHsts = entry.response.headers.some(h => h.name.toLowerCase() === 'strict-transport-security');
  const hasCsp = entry.response.headers.some(h => h.name.toLowerCase() === 'content-security-policy');
  const hasXContentTypeOptions = entry.response.headers.some(h => h.name.toLowerCase() === 'x-content-type-options');

  if (!hasHsts && entry.request.url.startsWith('https')) securityIssues.push('Missing HSTS header');
  if (!hasCsp) securityIssues.push('Missing CSP header');
  if (!hasXContentTypeOptions) securityIssues.push('Missing X-Content-Type-Options: nosniff');

  entry.response.cookies.forEach(c => {
    if (!c.httpOnly) securityIssues.push(`Cookie "${c.name}" is missing HttpOnly flag`);
    if (!c.secure && entry.request.url.startsWith('https')) securityIssues.push(`Cookie "${c.name}" is missing Secure flag`);
  });

  return {
    isSlow: entry.time > averageTime * 2,
    isLarge: (entry.response.content.size || 0) > 1024 * 500, // > 500KB
    hasErrors: status >= 400,
    authType,
    securityIssues
  };
};

export const parseHarFile = (jsonString: string): HarRoot => {
  try {
    const parsed: HarRoot = JSON.parse(jsonString);
    if (parsed.log?.entries) {
      const entries = parsed.log.entries;
      const avgTime = entries.reduce((acc, e) => acc + e.time, 0) / entries.length;
      
      parsed.log.entries = entries.map((entry, index) => ({
        ...entry,
        _id: `har-${index}-${Date.now()}`,
        analysis: analyzeEntry(entry, avgTime)
      }));
    }
    return parsed;
  } catch (e) {
    throw new Error('Invalid JSON format for HAR file');
  }
};

export const filterEntries = (
  entries: HarEntry[], 
  query: string, 
  resourceTypes: string[] = [], 
  statusCodes: string[] = []
): HarEntry[] => {
  let filtered = entries;

  // Search query filter (now with body and header search)
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(entry => 
      entry.request.url.toLowerCase().includes(lowerQuery) ||
      entry.request.method.toLowerCase().includes(lowerQuery) ||
      entry.response.status.toString().includes(lowerQuery) ||
      entry.request.headers.some(h => h.name.toLowerCase().includes(lowerQuery) || h.value.toLowerCase().includes(lowerQuery)) ||
      entry.request.postData?.text?.toLowerCase().includes(lowerQuery) ||
      entry.response.content.text?.toLowerCase().includes(lowerQuery)
    );
  }

  // Resource type filter
  if (resourceTypes.length > 0) {
    filtered = filtered.filter(entry => {
      const type = entry._resourceType?.toLowerCase() || '';
      return resourceTypes.some(rt => type === rt.toLowerCase());
    });
  }

  // Status code filter
  if (statusCodes.length > 0) {
    filtered = filtered.filter(entry => {
      const status = entry.response.status;
      return statusCodes.some(sc => {
        if (sc.endsWith('xx')) {
          const range = parseInt(sc[0]);
          return status >= range * 100 && status < (range + 1) * 100;
        }
        return status.toString() === sc;
      });
    });
  }

  return filtered;
};
