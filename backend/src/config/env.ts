import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters.").optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  AI_PROVIDER: z.enum(["openai", "gemini"]).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-2024-08-06"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  MEMORY_AUTH_STORE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true")
}).superRefine((value, ctx) => {
  if (!value.JWT_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["JWT_SECRET"],
      message: "JWT_SECRET must be configured."
    });
  }

  if (!value.DATABASE_URL && !value.MEMORY_AUTH_STORE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "DATABASE_URL is required unless MEMORY_AUTH_STORE=true."
    });
  }
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  AI_PROVIDER: parsedEnv.AI_PROVIDER ?? (parsedEnv.GEMINI_API_KEY ? "gemini" : "openai"),
  JWT_SECRET: parsedEnv.JWT_SECRET!
};

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
