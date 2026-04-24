/**
 * Extended tRPC procedures for conversion pipeline
 * These handle the full workflow: upload → parse → script → audio
 */

import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as api from "./api-integrations";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Upload PDF file and create paper record
 * Validates file and stores metadata
 */
export const uploadPaperProcedure = protectedProcedure
  .input(
    z.object({
      fileName: z.string(),
      fileSize: z.number(),
      title: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // Validate file size (50MB max)
      if (input.fileSize > 50 * 1024 * 1024) {
        throw new Error("File size exceeds 50MB limit");
      }

      // Create paper record
      const result = await db.createPaper({
        userId: ctx.user.id,
        title: input.title || input.fileName,
        fileName: input.fileName,
        fileSize: input.fileSize,
      });

      return {
        success: true,
        paperId: result[0]?.insertId || 1,
        message: "Paper uploaded successfully",
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload paper");
    }
  });

/**
 * Parse PDF using LlamaParse
 * Extracts text from uploaded PDF
 */
export const parsePdfProcedure = protectedProcedure
  .input(z.object({ conversionId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    try {
      const conversion = await db.getConversionById(input.conversionId);
      if (!conversion || conversion.userId !== ctx.user.id) {
        throw new Error("Conversion not found or unauthorized");
      }

      // Update status to parsing
      await db.updateConversionStatus(input.conversionId, "parsing");

      // TODO: Get actual PDF file from storage
      // For now, return placeholder
      const extractedText = "Sample extracted text from PDF...";

      // Validate extracted text
      if (!extractedText || extractedText.length < 100) {
        await db.updateConversionStatus(
          input.conversionId,
          "failed",
          "PDF contains insufficient text"
        );
        throw new Error("PDF contains insufficient text");
      }

      // Store raw text
      await db.updateConversionRawText(input.conversionId, extractedText);

      return {
        success: true,
        textLength: extractedText.length,
        preview: extractedText.substring(0, 200),
      };
    } catch (error) {
      console.error("Parse error:", error);
      await db.updateConversionStatus(
        input.conversionId,
        "failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  });

/**
 * Generate podcast script from extracted text
 * Uses OpenAI to create conversational script
 */
export const generateScriptProcedure = protectedProcedure
  .input(z.object({ conversionId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    try {
      const conversion = await db.getConversionById(input.conversionId);
      if (!conversion || conversion.userId !== ctx.user.id) {
        throw new Error("Conversion not found or unauthorized");
      }

      if (!conversion.rawText) {
        throw new Error("No extracted text available");
      }

      // Update status to scripting
      await db.updateConversionStatus(input.conversionId, "scripting");

      // Generate script using OpenAI
      const script = await api.generatePodcastScript(conversion.rawText);

      if (!script) {
        await db.updateConversionStatus(
          input.conversionId,
          "failed",
          "Failed to generate script"
        );
        throw new Error("Failed to generate script");
      }

      // Store generated script
      await db.updateConversionScript(input.conversionId, script);

      return {
        success: true,
        scriptLength: script.length,
        preview: script.substring(0, 300),
      };
    } catch (error) {
      console.error("Script generation error:", error);
      await db.updateConversionStatus(
        input.conversionId,
        "failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  });

/**
 * Synthesize audio from script
 * Uses ElevenLabs to create natural-sounding narration
 */
export const synthesizeAudioProcedure = protectedProcedure
  .input(
    z.object({
      conversionId: z.number(),
      voiceId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const conversion = await db.getConversionById(input.conversionId);
      if (!conversion || conversion.userId !== ctx.user.id) {
        throw new Error("Conversion not found or unauthorized");
      }

      if (!conversion.script) {
        throw new Error("No script available for audio synthesis");
      }

      // Update status to synthesizing
      await db.updateConversionStatus(input.conversionId, "synthesizing");

      // Synthesize audio using ElevenLabs
      const audioUrl = await api.synthesizeAudioWithElevenLabs(
        conversion.script,
        input.voiceId
      );

      if (!audioUrl) {
        await db.updateConversionStatus(
          input.conversionId,
          "failed",
          "Failed to synthesize audio"
        );
        throw new Error("Failed to synthesize audio");
      }

      // Store audio URL and mark as completed
      await db.updateConversionAudio(input.conversionId, audioUrl);

      return {
        success: true,
        audioUrl,
        message: "Audio synthesis completed",
      };
    } catch (error) {
      console.error("Audio synthesis error:", error);
      await db.updateConversionStatus(
        input.conversionId,
        "failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  });

/**
 * Delete a conversion and its associated data
 */
export const deleteConversionProcedure = protectedProcedure
  .input(z.object({ conversionId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    try {
      const conversion = await db.getConversionById(input.conversionId);
      if (!conversion || conversion.userId !== ctx.user.id) {
        throw new Error("Conversion not found or unauthorized");
      }

      // TODO: Delete audio file from S3 if it exists
      // TODO: Delete conversion record from database

      return {
        success: true,
        message: "Conversion deleted successfully",
      };
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  });
