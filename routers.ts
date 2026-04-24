import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import {
  uploadPaperProcedure,
  parsePdfProcedure,
  generateScriptProcedure,
  synthesizeAudioProcedure,
  deleteConversionProcedure,
} from "./conversion-procedures";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  papers: router({
    list: protectedProcedure.query(({ ctx }) => db.getPapersByUserId(ctx.user.id)),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPaperById(input.id)),
  }),

  conversions: router({
    create: protectedProcedure
      .input(z.object({ paperId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const paper = await db.getPaperById(input.paperId);
        if (!paper || paper.userId !== ctx.user.id) {
          throw new Error("Paper not found or unauthorized");
        }
        const result = await db.createConversion({
          paperId: input.paperId,
          userId: ctx.user.id,
          status: "uploaded",
        });
        return result;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversion = await db.getConversionById(input.id);
        if (!conversion || conversion.userId !== ctx.user.id) {
          throw new Error("Conversion not found or unauthorized");
        }
        return conversion;
      }),

    list: protectedProcedure.query(({ ctx }) => db.getConversionsByUserId(ctx.user.id)),

    updateScript: protectedProcedure
      .input(z.object({ id: z.number(), script: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const conversion = await db.getConversionById(input.id);
        if (!conversion || conversion.userId !== ctx.user.id) {
          throw new Error("Conversion not found or unauthorized");
        }
        return db.updateConversionScript(input.id, input.script);
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string(), errorMessage: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const conversion = await db.getConversionById(input.id);
        if (!conversion || conversion.userId !== ctx.user.id) {
          throw new Error("Conversion not found or unauthorized");
        }
        return db.updateConversionStatus(input.id, input.status, input.errorMessage);
      }),

    uploadPaper: uploadPaperProcedure,
    parsePdf: parsePdfProcedure,
    generateScript: generateScriptProcedure,
    synthesizeAudio: synthesizeAudioProcedure,
    delete: deleteConversionProcedure,
  }),

  voices: router({
    list: publicProcedure.query(() => db.getAllVoices()),
  }),
});

export type AppRouter = typeof appRouter;
