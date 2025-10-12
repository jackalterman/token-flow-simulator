
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  content: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-lg relative my-2">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckIcon className="h-5 w-5 text-green-400" />
        ) : (
          <ClipboardIcon className="h-5 w-5" />
        )}
      </button>
      <pre className="p-4 text-sm text-slate-100 overflow-x-auto">
        <code className={`language-${language}`}>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
