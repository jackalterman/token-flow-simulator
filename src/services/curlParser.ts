/**
 * CURL Parser Service
 * Handles import and export of CURL commands.
 */

interface RequestConfig {
  url: string;
  method: string;
  headers: { key: string; value: string; enabled: boolean }[];
  body: string;
  authType: 'none' | 'basic' | 'bearer';
  basicAuth?: { user: string; pass: string };
  bearerToken?: string;
}

export const toCurl = (config: RequestConfig): string => {
  let curl = `curl --location --request ${config.method} '${config.url}'`;
  
  // Headers
  config.headers.forEach(h => {
    if (h.enabled && h.key.trim()) {
      curl += ` --header '${h.key}: ${h.value}'`;
    }
  });
  
  // Auth
  if (config.authType === 'bearer' && config.bearerToken) {
    curl += ` --header 'Authorization: Bearer ${config.bearerToken}'`;
  } else if (config.authType === 'basic' && config.basicAuth?.user) {
    const auth = btoa(`${config.basicAuth.user}:${config.basicAuth.pass}`);
    curl += ` --header 'Authorization: Basic ${auth}'`;
  }
  
  // Body
  if (config.method !== 'GET' && config.method !== 'HEAD' && config.body) {
    // Escape single quotes in body
    const escapedBody = config.body.replace(/'/g, "'\\''");
    curl += ` --data-raw '${escapedBody}'`;
  }
  
  return curl;
};

export const fromCurl = (curl: string): Partial<RequestConfig> | null => {
  if (!curl || !curl.includes('curl')) return null;
  
  const result: Partial<RequestConfig> = {
    headers: [],
    method: 'GET'
  };
  
  // 1. Extract URL (look for strings starting with http)
  const urlMatch = curl.match(/'(https?:\/\/[^']+)'|"(https?:\/\/[^"]+)"|(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    result.url = urlMatch[1] || urlMatch[2] || urlMatch[3];
  }
  
  // 2. Extract Method
  const methodMatch = curl.match(/(?:-X|--request)\s+([A-Z]+)/);
  if (methodMatch) {
    result.method = methodMatch[1];
  } else if (curl.includes('--data') || curl.includes('-d')) {
    result.method = 'POST';
  }
  
  // 3. Extract Headers
  const headerMatches = curl.matchAll(/(?:-H|--header)\s+['"]([^'"]+)['"]/g);
  for (const match of headerMatches) {
    const headerStr = match[1];
    const separatorIndex = headerStr.indexOf(':');
    if (separatorIndex !== -1) {
      const key = headerStr.substring(0, separatorIndex).trim();
      const value = headerStr.substring(separatorIndex + 1).trim();
      
      if (key.toLowerCase() === 'authorization') {
        if (value.toLowerCase().startsWith('bearer ')) {
          result.authType = 'bearer';
          result.bearerToken = value.substring(7).trim();
        } else if (value.toLowerCase().startsWith('basic ')) {
          result.authType = 'basic';
          try {
            const decoded = atob(value.substring(6).trim());
            const [user, pass] = decoded.split(':');
            result.basicAuth = { user, pass: pass || '' };
          } catch (e) {}
        }
      } else {
        result.headers?.push({ key, value, enabled: true });
      }
    }
  }
  
  // 4. Extract Body
  const bodyMatch = curl.match(/(?:-d|--data|--data-raw|--data-binary)\s+(['"]([\s\S]*?)['"]|([^\s]+))/);
  if (bodyMatch) {
    result.body = bodyMatch[2] || bodyMatch[3];
    // If we didn't find a method and there's a body, default to POST
    if (!methodMatch && result.method === 'GET') {
      result.method = 'POST';
    }
  }
  
  return result;
};
