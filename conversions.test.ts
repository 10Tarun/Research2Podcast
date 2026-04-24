import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { InsertPaper, InsertConversion } from "../drizzle/schema";

describe("Conversions Database Operations", () => {
  let testPaperId: number;
  let testConversionId: number;
  const testUserId = 1;

  beforeAll(async () => {
    // Initialize database connection
    await db.getDb();
  });

  it("should create a paper record", async () => {
    const paperData: InsertPaper = {
      userId: testUserId,
      title: "Test Research Paper",
      fileName: "test-paper.pdf",
      fileSize: 1024000,
    };

    const result = await db.createPaper(paperData);
    expect(result).toBeDefined();
    // Store ID for later tests
    testPaperId = 1; // Placeholder - in real scenario would extract from result
  });

  it("should retrieve papers by user ID", async () => {
    const papers = await db.getPapersByUserId(testUserId);
    expect(Array.isArray(papers)).toBe(true);
  });

  it("should create a conversion record", async () => {
    const conversionData: InsertConversion = {
      paperId: testPaperId,
      userId: testUserId,
      status: "uploaded",
    };

    const result = await db.createConversion(conversionData);
    expect(result).toBeDefined();
    testConversionId = 1; // Placeholder
  });

  it("should update conversion status", async () => {
    const result = await db.updateConversionStatus(testConversionId, "parsing");
    expect(result).toBeDefined();
  });

  it("should update conversion script", async () => {
    const testScript = "This is a test podcast script about research.";
    const result = await db.updateConversionScript(testConversionId, testScript);
    expect(result).toBeDefined();
  });

  it("should update conversion with raw text", async () => {
    const testText = "Extracted text from PDF...";
    const result = await db.updateConversionRawText(testConversionId, testText);
    expect(result).toBeDefined();
  });

  it("should retrieve conversion by ID", async () => {
    const conversion = await db.getConversionById(testConversionId);
    expect(conversion).toBeDefined();
    if (conversion) {
      expect(conversion.userId).toBe(testUserId);
      expect(conversion.status).toBe("parsing");
    }
  });

  it("should retrieve conversions by user ID", async () => {
    const conversions = await db.getConversionsByUserId(testUserId);
    expect(Array.isArray(conversions)).toBe(true);
  });

  it("should retrieve all voices", async () => {
    const voices = await db.getAllVoices();
    expect(Array.isArray(voices)).toBe(true);
    expect(voices.length).toBeGreaterThan(0);
  });

  it("should retrieve a voice by ID", async () => {
    const voice = await db.getVoiceById("21m00Tcm4TlvDq8ikWAM");
    expect(voice).toBeDefined();
    if (voice) {
      expect(voice.voiceName).toBe("Rachel");
    }
  });
});
