import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface UseGeminiVisionConfig {
  referenceImagePath?: string;
  matchPrompt: string;
  mockMode?: boolean;
}

interface VisionResult {
  isMatch: boolean;
  description: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // exponential-ish backoff

export function useGeminiVision(config: UseGeminiVisionConfig) {
  const { referenceImagePath, matchPrompt } = config;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const refImageBase64 = useRef<string | null>(null);

  const loadReferenceImage = useCallback(async (): Promise<string | null> => {
    if (!referenceImagePath) return null;
    if (refImageBase64.current) return refImageBase64.current;

    try {
      const resp = await fetch(referenceImagePath);
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          refImageBase64.current = base64;
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }, [referenceImagePath]);

  const callGemini = useCallback(
    async (parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }>, apiKey: string): Promise<string> => {
      const ai = new GoogleGenAI({ apiKey });

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts }],
          });
          return response.text ?? '';
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
          if (is429 && attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
            continue;
          }
          throw err;
        }
      }
      throw new Error('Max retries exceeded');
    },
    []
  );

  const lastCallTime = useRef<number>(0);
  const isAnalyzingRef = useRef(false);

  const analyze = useCallback(
    async (capturedBase64: string) => {
      // Safety guard: Prevent concurrent calls
      if (isAnalyzingRef.current) {
        console.warn('Vision analysis already in progress, ignoring call.');
        return;
      }

      // Safety guard: Rate limit (debounce) - 2 seconds
      const now = Date.now();
      if (now - lastCallTime.current < 2000) {
        console.warn('Vision analysis called too frequently, ignoring call.');
        return;
      }
      lastCallTime.current = now;
      isAnalyzingRef.current = true;

      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      setQuotaExhausted(false);

      // Mock mode: auto-match after delay
      const isMock =
        config.mockMode ??
        (new URLSearchParams(window.location.search).has('mock') ||
        window.location.hash.includes('mock=true'));

      if (isMock) {
        await new Promise((r) => setTimeout(r, 1500));
        setResult({ isMatch: true, description: 'Mock mode: match confirmed.' });
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
        return;
      }

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key not configured');

        const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

        // Add reference image if available
        const refBase64 = await loadReferenceImage();
        if (refBase64) {
          parts.push({
            inlineData: { mimeType: 'image/jpeg', data: refBase64 },
          });
          parts.push({
            text: 'This is the reference image of what we are looking for.',
          });
        }

        // Add captured image
        parts.push({
          inlineData: { mimeType: 'image/jpeg', data: capturedBase64 },
        });

        parts.push({
          text: `Analyze this photo carefully. ${matchPrompt}

Answer with JSON only: {"isMatch": true/false, "description": "brief explanation"}
Only mark isMatch as true if the photo clearly and specifically shows what is described. A vague or unrelated photo should be marked as false.`,
        });

        const text = await callGemini(parts, apiKey);

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as VisionResult;
          setResult(parsed);
        } else {
          // Fallback: check for positive keywords
          const positive = /yes|match|correct|found|shows/i.test(text);
          setResult({
            isMatch: positive,
            description: text.slice(0, 200),
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
        if (is429) {
          setQuotaExhausted(true);
          setError('API limit reached. Use the manual confirm button below.');
        } else {
          setError(
            err instanceof Error ? err.message : 'Vision analysis failed'
          );
        }
      } finally {
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
      }
    },
    [loadReferenceImage, matchPrompt, callGemini]
  );

  const manualConfirm = useCallback(() => {
    setResult({ isMatch: true, description: 'Manually confirmed by player.' });
    setError(null);
    setQuotaExhausted(false);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setQuotaExhausted(false);
  }, []);

  return { analyze, isAnalyzing, result, error, reset, quotaExhausted, manualConfirm };
}
