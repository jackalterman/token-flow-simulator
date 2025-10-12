import type { DecodedJwt, JwtHeader, JwtPayload, VerificationResult } from '../types';

function base64UrlEncode(data: string | Uint8Array): string {
  const str = typeof data === 'string' ? data : String.fromCharCode.apply(null, Array.from(new Uint8Array(data)));
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function exportPem(keyData: ArrayBuffer, type: 'public' | 'private'): string {
    const base64Key = arrayBufferToBase64(keyData);
    const header = type === 'public' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN PRIVATE KEY-----';
    const footer = type === 'public' ? '-----END PUBLIC KEY-----' : '-----END PRIVATE KEY-----';
    const chunks = base64Key.match(/.{1,64}/g) || [];
    return `${header}\n${chunks.join('\n')}\n${footer}`;
}

function importPem(pem: string, type: 'public' | 'private') {
    const b64 = pem
        .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/, '')
        .replace(/-----END (PUBLIC|PRIVATE) KEY-----/, '')
        .replace(/\s/g, '');
    return base64ToArrayBuffer(b64);
}


export const jwtService = {
  async generateRsaKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-SSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );

    const publicKeyData = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyData = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: exportPem(publicKeyData, 'public'),
      privateKey: exportPem(privateKeyData, 'private'),
    };
  },

  async sign(header: JwtHeader, payload: JwtPayload, key: string): Promise<string> {
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    
    let signature: ArrayBuffer;

    if (header.alg === 'HS256') {
        const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(dataToSign));
    } else if (header.alg === 'RS256') {
        const privateKeyBuffer = importPem(key, 'private');
        const cryptoKey = await crypto.subtle.importKey('pkcs8', privateKeyBuffer, { name: 'RSA-SSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
        signature = await crypto.subtle.sign('RSA-SSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(dataToSign));
    } else {
        throw new Error(`Unsupported algorithm: ${header.alg}`);
    }

    const encodedSignature = base64UrlEncode(new Uint8Array(signature));
    return `${dataToSign}.${encodedSignature}`;
  },

  decode(token: string): DecodedJwt | null {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      if (!encodedHeader || !encodedPayload || !signature) {
        return null;
      }

      const header: JwtHeader = JSON.parse(base64UrlDecode(encodedHeader));
      const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));

      return {
        header,
        payload,
        signature,
        raw: { header: encodedHeader, payload: encodedPayload, token }
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  },

  async verify(token: string, key: string, options?: { audience?: string; issuer?: string }): Promise<VerificationResult> {
    const decoded = this.decode(token);
    if (!decoded) {
      return { isValid: false, reason: 'Token is malformed or could not be decoded.' };
    }
    
    const { header, payload, raw } = decoded;
    const dataToSign = `${raw.header}.${raw.payload}`;
    const signatureBytes = new Uint8Array(base64UrlDecode(decoded.signature).split('').map(c => c.charCodeAt(0)));

    try {
      let isValidSignature = false;
      if (header.alg === 'HS256') {
          const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
          isValidSignature = await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, new TextEncoder().encode(dataToSign));
      } else if (header.alg === 'RS256') {
          const publicKeyBuffer = importPem(key, 'public');
          const cryptoKey = await crypto.subtle.importKey('spki', publicKeyBuffer, { name: 'RSA-SSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
          isValidSignature = await crypto.subtle.verify('RSA-SSA-PKCS1-v1_5', cryptoKey, signatureBytes, new TextEncoder().encode(dataToSign));
      } else {
        return { isValid: false, reason: `Unsupported algorithm "${header.alg}" for verification.` };
      }

      if (!isValidSignature) {
        return { isValid: false, reason: 'Signature is invalid.' };
      }

      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && now > payload.exp) {
        return { isValid: false, reason: `Token expired at ${new Date(payload.exp * 1000).toLocaleString()}.` };
      }

      if (payload.nbf && now < payload.nbf) {
        return { isValid: false, reason: `Token is not valid before ${new Date(payload.nbf * 1000).toLocaleString()}.` };
      }
      
      if (options?.audience && payload.aud && payload.aud !== options.audience) {
        return { isValid: false, reason: `Invalid audience. Expected "${options.audience}", but got "${payload.aud}".` };
      }

      if (options?.issuer && payload.iss && payload.iss !== options.issuer) {
        return { isValid: false, reason: `Invalid issuer. Expected "${options.issuer}", but got "${payload.iss}".` };
      }

      return { isValid: true, reason: 'Token signature and claims are valid.' };
    } catch (error: any) {
      console.error('Verification error:', error);
      return { isValid: false, reason: `Verification failed: ${error.message}` };
    }
  }
};
