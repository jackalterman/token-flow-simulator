export type CertificateType = 'Leaf' | 'Intermediate' | 'Root' | 'Unknown';

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  thumbprint: string;
  pem: string;
  type?: CertificateType;
}

export const certificateService = {
  /**
   * Fetches certificate info for a given domain using public APIs.
   * This is a "best effort" fetch as CORS might block direct requests from the browser
   * to some public APIs. We'll try certspotter first.
   */
  async fetchFromUrl(domain: string): Promise<CertificateInfo[]> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    try {
      // Using CertSpotter API with expansion for better data
      const response = await fetch(`https://api.certspotter.com/v1/issuances?domain=${cleanDomain}&include_precertificates=false&expand=dns_names&expand=issuer&expand=cert&limit=5`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No certificates found for this domain.');
      }
      
      return data.map((cert: any) => ({
        subject: Array.isArray(cert.dns_names) ? cert.dns_names.join(', ') : (cert.subject?.common_name || 'Unknown Subject'),
        issuer: cert.issuer?.name || 'Unknown Issuer',
        validFrom: cert.not_before,
        validTo: cert.not_after,
        serialNumber: cert.id || 'N/A',
        thumbprint: cert.tbs_sha256 || 'N/A',
        pem: cert.cert?.pem || `-----BEGIN CERTIFICATE-----\n${cert.pubkey_sha256}\n-----END CERTIFICATE-----`,
        type: (Array.isArray(cert.dns_names) && cert.dns_names.length > 0) ? 'Leaf' : 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  /**
   * Simple parsing of PEM certificate string.
   * Extracts basic fields using regex for browser-side display.
   */
  parsePem(pem: string): CertificateInfo {
    const info: CertificateInfo = {
      subject: 'Unknown Subject',
      issuer: 'Unknown Issuer',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      serialNumber: 'Unknown',
      thumbprint: 'Unknown',
      pem: pem.trim()
    };

    // Try to extract metadata if it's there (some tools include it as text comments)
    const subjectMatch = pem.match(/Subject: (.*)/i);
    if (subjectMatch) info.subject = subjectMatch[1].trim();

    const issuerMatch = pem.match(/Issuer: (.*)/i);
    if (issuerMatch) info.issuer = issuerMatch[1].trim();

    const validFromMatch = pem.match(/Not Before: (.*)/i);
    if (validFromMatch) info.validFrom = validFromMatch[1].trim();

    const validToMatch = pem.match(/Not After : (.*)/i);
    if (validToMatch) info.validTo = validToMatch[1].trim();

    // If still unknown and looks like a raw PEM, we'd need a real parser.
    // For now, we'll just use what we have or placeholder.
    if (info.subject === 'Unknown Subject' && pem.includes('BEGIN CERTIFICATE')) {
       // Placeholder indicating it's a valid PEM but parsing failed
       info.subject = 'Encoded Certificate (Raw PEM)';
    }

    // Basic type detection
    if (info.subject !== 'Unknown Subject' && info.issuer !== 'Unknown Issuer') {
        if (info.subject === info.issuer) {
            info.type = 'Root';
        }
    }

    return info;
  },

  /**
   * Splits a PEM chain into individual certificates.
   */
  splitChain(chain: string): string[] {
    const pattern = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;
    return chain.match(pattern) || [];
  },

  /**
   * Downloads a certificate as a file.
   */
  exportCertificate(pem: string, filename: string) {
    const blob = new Blob([pem], { type: 'application/x-x509-ca-cert' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
