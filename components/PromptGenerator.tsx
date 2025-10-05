
import React, { useState, useCallback } from 'react';
import { generatePrompt } from '../services/geminiService';
import { Analysis } from '../types';
import Card from './shared/Card';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface PromptGeneratorProps {
  analysis: Analysis;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ analysis }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGeneratePrompt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPrompt('');
    try {
      const generated = await generatePrompt(analysis);
      setPrompt(generated);
    } catch (e) {
      setError('Failed to generate prompt. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [analysis]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card title="Prompt Generator">
      <div className="p-2 space-y-4">
        <button
          onClick={handleGeneratePrompt}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-brand-accent hover:opacity-90 text-white font-semibold px-4 py-2 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Generate Suno Prompt'}
        </button>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {prompt && (
          <div className="relative">
            <textarea
              readOnly
              value={prompt}
              className="w-full h-48 bg-brand-bg border border-brand-border rounded-md p-3 text-sm font-mono leading-relaxed resize-none"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-brand-surface border border-brand-border rounded-md text-brand-text-secondary hover:text-brand-text-primary transition-colors"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="w-4 h-4" />
            </button>
            {copied && <span className="absolute bottom-4 right-2 text-xs bg-brand-accent text-white px-2 py-1 rounded-md">Copied!</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PromptGenerator;
