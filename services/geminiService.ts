
import { GoogleGenAI, Type } from "@google/genai";
import { Analysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mock responses for Gemini API.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the song. If it cannot be determined, estimate a plausible title.' },
        genre: { type: Type.STRING, description: 'The primary genre of the song, e.g., "Indie Pop", "Classic Rock".' },
        tempo: { type: Type.INTEGER, description: 'The tempo of the song in beats per minute (BPM), as an integer.' },
        key: { type: Type.STRING, description: 'The musical key of the song, e.g., "C#", "F", "A".' },
        mode: { type: Type.STRING, description: 'The mode of the song, typically "Major" or "Minor".' },
        chordProgression: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A common 4-chord progression found in the song, as an array of strings.'
        },
        timbre: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the instrument or sound source.' },
                    value: { type: Type.NUMBER, description: 'A value from 0 to 1 representing the prominence of this instrument.' }
                },
                required: ['name', 'value']
            },
            description: 'A profile of the top 5 most prominent instruments or sounds.'
        },
        energy: { type: Type.NUMBER, description: 'A value from 0 to 1 representing the energy level of the song.' },
        mood: { type: Type.STRING, description: 'A few words describing the mood of the song, e.g., "Uplifting, Energetic".' }
    },
    required: ['title', 'genre', 'tempo', 'key', 'mode', 'chordProgression', 'timbre', 'energy', 'mood']
};

export const analyzeMusicFromText = async (text: string, context?: string): Promise<Analysis> => {
  if (!ai) {
    // Mock response for development without API key
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: "lofi hip hop radio - beats to relax/study to",
          genre: "Lofi Hip-Hop",
          tempo: 80,
          key: 'C',
          mode: 'Minor',
          chordProgression: ['Am7', 'Dm7', 'G7', 'Cmaj7'],
          timbre: [
            { name: 'Rhodes Piano', value: 0.9 },
            { name: 'Lo-fi Drums', value: 0.8 },
            { name: 'Sub Bass', value: 0.7 },
            { name: 'Chilled Guitar', value: 0.5 },
            { name: 'Vinyl Crackle', value: 0.4 },
          ],
          energy: 0.2,
          mood: 'Relaxing, Chill, Study',
        });
      }, 1500);
    });
  }

  const prompt = `
    You are an expert musicologist AI. A user has provided the following text, which could be a song title, an artist, a genre, or a YouTube URL.
    Your task is to identify the song and generate a plausible and detailed musical analysis for it.

    Input: "${text}"
    ${context ? `\nContext from URL metadata: ${context}\n` : ''}
    First, use the provided input and context (if available) to identify the song's title and primary genre. If you cannot determine the exact song, create a plausible title and genre based on the available information.
    Then, generate the rest of the analysis. The timbre profile should list the 5 most prominent instruments. The chord progression should be a typical 4-chord loop appropriate for the genre.
    The final output MUST be a single JSON object matching the provided schema. Do not include any other text or markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const result = JSON.parse(cleanedJsonString);
    
    if (result.timbre && Array.isArray(result.timbre)) {
        result.timbre.forEach((t: { value: number; }) => {
            if (t.value > 1) t.value = 1;
            if (t.value < 0) t.value = 0;
        });
    }

    return result as Analysis;
  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    throw new Error("Could not generate analysis from Gemini API.");
  }
};


export const generatePrompt = async (analysis: Analysis): Promise<string> => {
  const timbreDescription = [...analysis.timbre]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(t => t.name.toLowerCase())
    .join(', ');

  const promptForGemini = `
    You are an expert music prompt engineer for generative AI music tools like Suno AI.
    Based on the following musical analysis data, create a single, cohesive, and descriptive prompt in one block of text.
    The prompt should be evocative and capture the essence of the song's style.
    Include genre, mood, instrumentation, tempo (BPM), and key.
    Do not use markdown or formatting.

    Analysis Data:
    - Genre: ${analysis.genre}
    - Tempo: ${analysis.tempo} BPM
    - Key: ${analysis.key} ${analysis.mode}
    - Mood: ${analysis.mood}
    - Primary Instruments (Timbre): ${timbreDescription}
    - Energy Level: ${analysis.energy > 0.7 ? 'High' : analysis.energy > 0.4 ? 'Medium' : 'Low'}
    - Chord Progression Feel: A standard progression like ${analysis.chordProgression.join(' - ')}

    Generate the prompt.
  `;
  
  if (!ai) {
    // Mock response for development without API key
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`[ Instrumental ], ${analysis.mood.toLowerCase()}, upbeat ${analysis.genre.toLowerCase()}, driving bassline, rhythmic drums, ${timbreDescription}, energetic and danceable, ${analysis.tempo} BPM, key of ${analysis.key} ${analysis.mode}`);
      }, 1000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptForGemini,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not generate prompt from Gemini API.");
  }
};
