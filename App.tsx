
import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisResult, VariationParams } from './types';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';
import VariationControls from './components/VariationControls';
import PromptGenerator from './components/PromptGenerator';
import { MusicNoteIcon } from './components/icons/MusicNoteIcon';
import { analyzeMusicFromText } from './services/geminiService';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [variationParams, setVariationParams] = useState<VariationParams>({
    tempo: 0,
    key: 0,
    energy: 0,
  });

  const handleAnalyze = useCallback(async (source: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setVariationParams({ tempo: 0, key: 0, energy: 0 });

    try {
      let analysisContext: string | undefined = undefined;
      if (YOUTUBE_URL_REGEX.test(source)) {
        try {
          // Regex to extract the 11-character YouTube video ID
          const videoIdMatch = source.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
          if (videoIdMatch && videoIdMatch[1]) {
            const videoId = videoIdMatch[1];
            const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
            const response = await fetch(oembedUrl);
            
            if (response.ok) {
              const data = await response.json();
              analysisContext = `The user provided a YouTube link. Metadata from the link: Title: "${data.title}", Author: "${data.author_name}".`;
            } else {
               console.warn(`YouTube oEmbed request failed with status: ${response.status}`);
            }
          } else {
            console.warn("Could not extract a valid YouTube video ID from the provided URL.");
          }
        } catch (e) {
            console.warn("An error occurred while fetching YouTube metadata", e);
            // continue without metadata
        }
      }
      
      const analysis = await analyzeMusicFromText(source, analysisContext);
      
      const newResult: AnalysisResult = {
        title: analysis.title,
        sourceUrl: source,
        analysis,
        confidence: 0.85, // It's AI generated, so confidence is not 100%
        timestamp: new Date().toISOString(),
      };
      setAnalysisResult(newResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVariationChange = useCallback((newParams: VariationParams) => {
    setVariationParams(newParams);
  }, []);
  
  const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const variedAnalysis = useMemo((): AnalysisResult | null => {
    if (!analysisResult) return null;

    const newTempo = Math.round(analysisResult.analysis.tempo * (1 + variationParams.tempo / 100));
    const originalKeyIndex = KEYS.indexOf(analysisResult.analysis.key);
    // Handle cases where the key from Gemini might not be in our list
    if (originalKeyIndex === -1) {
        return {
             ...analysisResult,
             analysis: {
                ...analysisResult.analysis,
                tempo: newTempo,
                energy: Math.max(0, Math.min(1, analysisResult.analysis.energy + variationParams.energy / 100)),
             }
        }
    }
    const newKeyIndex = (originalKeyIndex + variationParams.key + KEYS.length) % KEYS.length;
    const newKey = KEYS[newKeyIndex];
    const newEnergy = Math.max(0, Math.min(1, analysisResult.analysis.energy + variationParams.energy / 100));

    return {
      ...analysisResult,
      analysis: {
        ...analysisResult.analysis,
        tempo: newTempo,
        key: newKey,
        energy: newEnergy,
      }
    };
  }, [analysisResult, variationParams]);

  return (
    <div className="min-h-screen font-sans">
      <main className="container mx-auto p-4 md:p-8 max-w-5xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <MusicNoteIcon className="h-12 w-12 text-brand-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-text-primary">
              Sonif<span className="text-brand-primary">AI</span> Formula
            </h1>
          </div>
          <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
            Analyze musical properties, generate creative variations, and create descriptive prompts for AI music generators.
          </p>
        </header>

        <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />

        {isLoading && (
          <div className="flex justify-center items-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="ml-4 text-lg text-brand-text-secondary">Analyzing music DNA...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
            <p><strong>Analysis Failed:</strong> {error}</p>
          </div>
        )}

        {variedAnalysis && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <AnalysisDisplay result={variedAnalysis} />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <VariationControls 
                params={variationParams} 
                onParamChange={handleVariationChange}
              />
              <PromptGenerator analysis={variedAnalysis.analysis} />
            </div>
          </div>
        )}
      </main>
      <footer className="text-center p-4 mt-8 text-brand-text-secondary text-sm">
        <p>Built with React, Tailwind CSS, and the Gemini API. An open-source experiment.</p>
      </footer>
    </div>
  );
};

export default App;
