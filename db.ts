import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, papers, conversions, voices, InsertPaper, InsertConversion } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _seedingPromise: Promise<void> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Seed default voices on first connection
      if (!_seedingPromise) {
        _seedingPromise = seedDefaultVoices().catch(err => console.warn("[Database] Failed to seed voices:", err));
      }
      await _seedingPromise;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Papers queries
export async function createPaper(data: InsertPaper) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(papers).values(data);
  return result;
}

export async function getPapersByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(papers).where(eq(papers.userId, userId));
}

export async function getPaperById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  return result[0];
}

// Conversions queries
export async function createConversion(data: InsertConversion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversions).values(data);
  return result;
}

export async function getConversionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
  return result[0];
}

export async function getConversionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(conversions).where(eq(conversions.userId, userId));
}

export async function updateConversionStatus(id: number, status: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, unknown> = { status };
  if (errorMessage) updates.errorMessage = errorMessage;
  if (status === "completed") updates.completedAt = new Date();
  return db.update(conversions).set(updates).where(eq(conversions.id, id));
}

export async function updateConversionScript(id: number, script: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(conversions).set({ script }).where(eq(conversions.id, id));
}

export async function updateConversionAudio(id: number, audioUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(conversions).set({ audioUrl, status: "completed", completedAt: new Date() }).where(eq(conversions.id, id));
}

export async function updateConversionRawText(id: number, rawText: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(conversions).set({ rawText }).where(eq(conversions.id, id));
}

// Voices queries
export async function getAllVoices() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(voices);
}

export async function getVoiceById(voiceId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(voices).where(eq(voices.voiceId, voiceId)).limit(1);
  return result[0];
}

export async function seedDefaultVoices() {
  const db = await getDb();
  if (!db) return;
  
  const defaultVoices = [
    { voiceId: "21m00Tcm4TlvDq8ikWAM", voiceName: "Rachel", gender: "Female", accent: "American", description: "Clear, warm, and professional female voice" },
    { voiceId: "EXAVITQu4vr4xnSDxMaL", voiceName: "Bella", gender: "Female", accent: "American", description: "Calm and soothing female voice" },
    { voiceId: "pFZP5JQG7iQjIQuC4Iy4", voiceName: "Chris", gender: "Male", accent: "American", description: "Friendly and engaging male voice" },
    { voiceId: "TxGEqnHWrfWFTfGW9XjX", voiceName: "Sam", gender: "Male", accent: "American", description: "Deep and authoritative male voice" },
  ];
  
  for (const voice of defaultVoices) {
    try {
      await db.insert(voices).values(voice).onDuplicateKeyUpdate({ set: voice });
    } catch (error) {
      console.warn(`Failed to seed voice ${voice.voiceName}:`, error);
    }
  }
}
