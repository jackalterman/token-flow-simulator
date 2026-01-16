import React from 'react';

const JWT_CLAIM_DESCRIPTIONS: Record<string, string> = {
  // Header
  alg: 'Algorithm: Identifies the cryptographic algorithm used to secure the JWT.',
  typ: 'Token Type: Declares the media type of this token, always "JWT".',
  kid: 'Key ID: A hint indicating which key was used to secure the JWT.',

  // Payload
  iss: 'Issuer: Identifies the principal that issued the JWT.',
  sub: 'Subject: Identifies the principal that is the subject of the JWT.',
  aud: 'Audience: Identifies the recipients that the JWT is intended for.',
  exp: 'Expiration Time: Time on or after which the JWT MUST NOT be accepted for processing.',
  nbf: 'Not Before: Time before which the JWT MUST NOT be accepted for processing.',
  iat: 'Issued At: Time at which the JWT was issued.',
  jti: 'JWT ID: Provides a unique identifier for the JWT.',
};

interface JsonViewerProps {
  data: object;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const formatValue = (value: any): string => {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return String(value);
  };

  const renderHumanReadableTime = (key: string, value: unknown) => {
    if (['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number') {
        return `(${new Date(value * 1000).toLocaleString()})`
    }
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-100 font-mono whitespace-pre-wrap break-all">
      <pre className="whitespace-pre-wrap break-all">
        <code>
          {`{\n`}
          {Object.entries(data).map(([key, value], index, arr) => (
            <div key={key} className="relative group pl-4">
                <span className="text-sky-400 cursor-pointer relative" title={JWT_CLAIM_DESCRIPTIONS[key]}>
                    "{key}"
                    {JWT_CLAIM_DESCRIPTIONS[key] && (
                        <span className="absolute top-full left-0 mt-2 hidden group-hover:block w-72 bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans rounded-xl py-3 px-4 z-50 border border-slate-700 shadow-2xl pointer-events-none whitespace-normal normal-case tracking-normal animate-fade-in ring-1 ring-white/10">
                            {JWT_CLAIM_DESCRIPTIONS[key]}
                        </span>
                    )}
                </span>
                <span className="text-slate-100">: </span>
                <span className="text-amber-300">{formatValue(value)}</span>
                <span className="text-slate-100">{index < arr.length - 1 ? ',' : ''}</span>
                <span className="text-slate-400 ml-2 text-xs italic">{renderHumanReadableTime(key, value)}</span>
            </div>
          ))}
          {`}`}
        </code>
      </pre>
    </div>
  );
};

export default JsonViewer;