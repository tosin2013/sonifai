
import React, { useState } from 'react';

interface InputFormProps {
  onAnalyze: (source: string) => void;
  isLoading: boolean;
}

type InputMode = 'url' | 'upload';

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url || fileName) {
      onAnalyze(url || fileName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg p-6">
      <div className="flex border-b border-brand-border mb-4">
        <button
          onClick={() => setInputMode('url')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === 'url'
              ? 'border-b-2 border-brand-primary text-brand-primary'
              : 'text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          YouTube Link
        </button>
        <button
          onClick={() => setInputMode('upload')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === 'upload'
              ? 'border-b-2 border-brand-primary text-brand-primary'
              : 'text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          Upload Audio
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {inputMode === 'url' ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube link here..."
            className="flex-grow bg-brand-bg border border-brand-border rounded-md px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
            disabled={isLoading}
          />
        ) : (
          <label className="flex-grow bg-brand-bg border border-brand-border rounded-md px-4 py-2 text-brand-text-secondary cursor-pointer hover:border-brand-primary transition-colors flex items-center">
            <span className="truncate">{fileName || 'Choose an audio file...'}</span>
            <input type="file" onChange={handleFileChange} className="hidden" accept="audio/*" disabled={isLoading} />
          </label>
        )}
        <button
          type="submit"
          className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading || (!url && !fileName)}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
