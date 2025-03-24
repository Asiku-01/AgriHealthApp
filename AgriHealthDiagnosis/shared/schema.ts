import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const diagnoses = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  type: text("type").notNull(), // 'plant' or 'livestock'
  image: text("image").notNull(), // base64 encoded image
  symptoms: text("symptoms"), // Additional symptom description
  environmentalData: jsonb("environmental_data").$type<{
    temperature?: number;
    humidity?: number;
    soilPh?: number;
    location?: string;
    weatherConditions?: string;
  }>(),
  diagnosis: jsonb("diagnosis").$type<{
    condition: string;
    confidence: number;
    recommendations: string[];
    progressHistory?: Array<{
      date: string;
      status: string;
      notes: string;
      imageUrl?: string;
      environmentalData?: {
        temperature?: number;
        humidity?: number;
        soilPh?: number;
        location?: string;
        weatherConditions?: string;
      };
    }>;
    aiMetadata?: {
      modelConfidence: number;
      similarCases: string[];
      predictedProgression: string;
      outbreakRiskLevel?: 'low' | 'medium' | 'high';
    };
    expertConsultation?: {
      required: boolean;
      specialistType: string;
      priority: 'low' | 'medium' | 'high';
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiagnosisSchema = createInsertSchema(diagnoses).pick({
  type: true,
  image: true,
  userId: true,
  symptoms: true,
  environmentalData: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;