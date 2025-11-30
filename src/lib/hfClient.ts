/**
 * Hugging Face Client - Optional Enhancement Layer
 * Provides additional AI capabilities alongside Lovable AI
 */

import { HfInference } from "@huggingface/inference";

// HF Token is optional - features gracefully degrade if not configured
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

export const HF_MODELS = {
  coreLLM: "Qwen/Qwen2.5-7B-Instruct",
  visionVL: "Qwen/Qwen2-VL-7B-Instruct",
  videoVLM: "HuggingFaceTB/SmolVLM-Instruct",
  embeddings: "sentence-transformers/all-MiniLM-L6-v2",
  imageGen: "black-forest-labs/FLUX.1-schnell",
} as const;

type HFModels = typeof HF_MODELS;

let hfClient: HfInference | null = null;

export function getHFClient(): HfInference | null {
  if (!HF_TOKEN) {
    console.warn("[HF] Token not configured - HF features unavailable");
    return null;
  }
  
  if (!hfClient) {
    hfClient = new HfInference(HF_TOKEN);
  }
  
  return hfClient;
}

export function isHFAvailable(): boolean {
  return !!HF_TOKEN;
}

/**
 * Browser-side embedding generation using HF Transformers.js
 * Falls back gracefully if not available
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][] | null> {
  const client = getHFClient();
  if (!client) return null;

  try {
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const result = await client.featureExtraction({
          model: HF_MODELS.embeddings,
          inputs: text,
        });
        return Array.isArray(result) ? result : [result];
      })
    );
    
    return embeddings as number[][];
  } catch (error) {
    console.error("[HF] Embedding generation failed:", error);
    return null;
  }
}

/**
 * Image generation using HF models
 * This is browser-callable but should be rate-limited
 */
/**
 * Image generation using HF models
 * Returns blob or null for graceful fallback
 */
export async function generateImageHF(args: {
  prompt: string;
  negativePrompt?: string;
}): Promise<Blob | null> {
  const client = getHFClient();
  if (!client) return null;

  try {
    const result = await client.textToImage({
      model: HF_MODELS.imageGen,
      inputs: args.prompt,
      parameters: {
        negative_prompt: args.negativePrompt,
      } as any,
    }) as unknown;
    
    // HF returns Blob from textToImage
    return result as Blob;
  } catch (error) {
    console.error("[HF] Image generation failed:", error);
    return null;
  }
}

/**
 * Feature extraction for semantic search
 * Useful for memory search and context matching
 */
export async function extractFeatures(text: string): Promise<number[] | null> {
  const client = getHFClient();
  if (!client) return null;

  try {
    const result = await client.featureExtraction({
      model: HF_MODELS.embeddings,
      inputs: text,
    });
    
    // Handle different result types from HF
    if (Array.isArray(result)) {
      // If it's already an array of numbers, return it
      if (typeof result[0] === 'number') {
        return result as number[];
      }
      // If it's a nested array, flatten the first level
      if (Array.isArray(result[0])) {
        return result[0] as number[];
      }
    }
    
    return null;
  } catch (error) {
    console.error("[HF] Feature extraction failed:", error);
    return null;
  }
}

// Export types
export type { HfInference };
