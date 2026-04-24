/**
 * External API Integration Helpers
 * These functions will connect to LlamaParse, OpenAI, ElevenLabs, and Ollama (local)
 * APIs are called from tRPC procedures to keep credentials server-side
 */

import { invokeLLM } from "./_core/llm";

// ─────────────────────────────────────────────────────────────────────────────
// 🦙 OLLAMA — LOCAL MODEL INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────
// Ollama runs models locally (no API key needed).
// Default base URL: http://localhost:11434
//
// Setup:
//   1. Install Ollama → https://ollama.com/download
//   2. Pull a model → `ollama pull llama3` (or mistral, phi3, gemma2, etc.)
//   3. Ollama starts automatically; confirm with `ollama list`
//   4. Optionally override the base URL via env:
//        OLLAMA_BASE_URL=http://localhost:11434
//
// Available models to swap in for OLLAMA_MODEL:
//   - "llama3"          fast, general purpose (recommended)
//   - "mistral"         strong reasoning
//   - "phi3"            lightweight, very fast
//   - "gemma2"          Google's open model
//   - "deepseek-r1"     strong at structured text
//   - "llava"           multimodal (if you add image support later)
//
// To change the model, update OLLAMA_MODEL in your .env file
// or pass `model` directly to invokeOllamaLLM().
// ─────────────────────────────────────────────────────────────────────────────

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Core Ollama chat completion helper.
 *
 * This is the single place to write your system prompt and model config
 * for every local-model feature in this file. Change OLLAMA_DEFAULT_MODEL
 * or pass `model` per-call to switch models without touching call-sites.
 *
 * @param messages  Full conversation array (system + user turns)
 * @param model     Override the default model for this call
 * @returns         The assistant's reply text
 */
export async function invokeOllamaLLM(
  messages: OllamaMessage[],
  model: string = OLLAMA_DEFAULT_MODEL
): Promise<string> {
  const url = `${OLLAMA_BASE_URL}/api/chat`;

  const body = {
    model,
    messages,
    stream: false, // set true if you want streaming in future
    options: {
      // ── TUNE THESE TO CONTROL OUTPUT STYLE ──────────────────────────────
      temperature: 0.7,    // 0 = deterministic, 1 = creative
      top_p: 0.9,          // nucleus sampling
      num_predict: 2048,   // max tokens in the response
      // ────────────────────────────────────────────────────────────────────
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama request failed (${res.status}): ${err}`);
  }

  const data: OllamaResponse = await res.json();
  return data.message.content ?? "";
}

// ─────────────────────────────────────────────────────────────────────────────
// 📄 LLAMAPARSE — PDF PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse PDF using LlamaParse API
 * Extracts text from complex research papers with proper layout handling
 */
export async function parsePdfWithLlamaParse(fileUrl: string): Promise<string> {
  if (!process.env.LLAMAPARSE_API_KEY) {
    console.warn("LlamaParse API key not configured");
    return "";
  }

  try {
    // POST https://api.llamaparse.com/parse
    console.log("Parsing PDF with LlamaParse:", fileUrl);
    return ""; // Replace with actual API response
  } catch (error) {
    console.error("LlamaParse error:", error);
    throw new Error("Failed to parse PDF");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎙️ PODCAST SCRIPT GENERATION
// Choose between local Ollama or cloud OpenAI below.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ✏️ WRITE YOUR SYSTEM PROMPT HERE (used by both Ollama and OpenAI paths).
 * Centralised so you only need to edit one place.
 */
const PODCAST_SYSTEM_PROMPT = `You are an expert podcast scriptwriter specializing in making complex academic research accessible to a general audience.

Your task is to convert a research paper into an engaging, conversational podcast script that:
1. Explains the research in simple, everyday language
2. Highlights the key findings and their practical implications
3. Maintains scientific accuracy while being entertaining
4. Uses analogies and real-world examples to illustrate concepts
5. Includes natural transitions between topics
6. Is approximately 5-10 minutes of narration (1500-2500 words)

Format the script as natural dialogue with clear paragraph breaks for pacing.`;

/**
 * Generate podcast script using local Ollama model.
 * Use this when you want zero API cost and full privacy.
 *
 * Switch the model by setting OLLAMA_MODEL in your .env, e.g.:
 *   OLLAMA_MODEL=mistral
 */
export async function generatePodcastScriptWithOllama(
  extractedText: string,
  paperTitle?: string
): Promise<string> {
  const userPrompt = `Please convert this research paper into a podcast script:

${paperTitle ? `Title: ${paperTitle}\n\n` : ""}${extractedText.substring(0, 4000)}...`;

  try {
    return await invokeOllamaLLM([
      { role: "system", content: PODCAST_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);
  } catch (error) {
    console.error("Ollama podcast generation error:", error);
    throw new Error("Failed to generate podcast script via Ollama");
  }
}

/**
 * Generate conversational podcast script from research paper text.
 * Uses OpenAI GPT-4 (cloud). Falls back to Ollama if OPENAI_API_KEY is absent.
 */
export async function generatePodcastScript(
  extractedText: string,
  paperTitle?: string
): Promise<string> {
  // ── LOCAL FALLBACK ──────────────────────────────────────────────────────
  // If no OpenAI key is set, route automatically to local Ollama.
  // Remove this block if you always want to require OpenAI.
  if (!process.env.OPENAI_API_KEY) {
    console.info("OPENAI_API_KEY not set — falling back to local Ollama model");
    return generatePodcastScriptWithOllama(extractedText, paperTitle);
  }
  // ───────────────────────────────────────────────────────────────────────

  try {
    const userPrompt = `Please convert this research paper into a podcast script:

${paperTitle ? `Title: ${paperTitle}\n\n` : ""}${extractedText.substring(0, 4000)}...`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: PODCAST_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    return typeof content === "string" ? content : "";
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Failed to generate podcast script");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔊 ELEVENLABS — TEXT TO SPEECH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate audio from podcast script using ElevenLabs
 */
export async function synthesizeAudioWithElevenLabs(
  script: string,
  voiceId: string
): Promise<string> {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured");
    return "";
  }

  try {
    // POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
    console.log("Synthesizing audio with ElevenLabs, voice:", voiceId);
    return ""; // Replace with actual S3 URL after upload
  } catch (error) {
    console.error("ElevenLabs error:", error);
    throw new Error("Failed to synthesize audio");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🛠️ UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate if a PDF file is readable and not corrupted
 */
export async function validatePdfFile(fileBuffer: Buffer): Promise<boolean> {
  try {
    const pdfSignature = fileBuffer.slice(0, 4).toString("ascii");
    return pdfSignature.startsWith("%PDF");
  } catch (error) {
    console.error("PDF validation error:", error);
    return false;
  }
}

/**
 * Get available ElevenLabs voices
 */
export async function getAvailableVoices(): Promise<
  Array<{ id: string; name: string; gender: string }>
> {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured — returning default voices");
    return [
      { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "Female" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", gender: "Female" },
      { id: "pFZP5JQG7iQjIQuC4Iy4", name: "Chris", gender: "Male" },
      { id: "TxGEqnHWrfWFTfGW9XjX", name: "Sam", gender: "Male" },
    ];
  }

  try {
    // GET https://api.elevenlabs.io/v1/voices
    return [];
  } catch (error) {
    console.error("ElevenLabs voices error:", error);
    return [];
  }
}

/**
 * Check if the local Ollama server is reachable.
 * Call this on startup or in a health-check endpoint.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * List all models currently available in the local Ollama instance.
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models ?? []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}
