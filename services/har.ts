export interface HarEntry {
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

export const parseHarFile = (jsonString: string): HarRoot => {
  try {
    return JSON.parse(jsonString);
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

  // Search query filter
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(entry => 
      entry.request.url.toLowerCase().includes(lowerQuery) ||
      entry.request.method.toLowerCase().includes(lowerQuery) ||
      entry.response.status.toString().includes(lowerQuery) ||
      entry.request.headers.some(h => h.name.toLowerCase().includes(lowerQuery) || h.value.toLowerCase().includes(lowerQuery))
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
