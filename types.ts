
export interface Timbre {
  name: string;
  value: number;
}

export interface Analysis {
  title: string;
  genre: string;
  tempo: number;
  key: string;
  mode: string;
  chordProgression: string[];
  timbre: Timbre[];
  energy: number;
  mood: string;
}

export interface AnalysisResult {
  title: string;
  sourceUrl: string;
  analysis: Analysis;
  confidence: number;
  timestamp: string;
}

export interface VariationParams {
  tempo: number; // as percentage change
  key: number; // as semitone steps
  energy: number; // as percentage change
}
