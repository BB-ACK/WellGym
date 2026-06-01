import OpenAI from "openai";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const dietResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["dailyCalories", "macroRatio", "recommendedMeals", "managementTips", "rationale"],
  properties: {
    dailyCalories: { type: "integer" },
    macroRatio: {
      type: "object",
      additionalProperties: false,
      required: ["carbohydrate", "protein", "fat"],
      properties: {
        carbohydrate: { type: "integer" },
        protein: { type: "integer" },
        fat: { type: "integer" }
      }
    },
    recommendedMeals: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["mealType", "foods", "calories", "notes"],
        properties: {
          mealType: { type: "string" },
          foods: { type: "array", items: { type: "string" } },
          calories: { type: "integer" },
          notes: { type: "string" }
        }
      }
    },
    managementTips: { type: "array", items: { type: "string" } },
    rationale: { type: "string" }
  }
} as const;

const feedbackResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallScore",
    "summary",
    "volumeAnalysis",
    "strengths",
    "cautions",
    "nextWorkoutSuggestions",
    "recoveryTips"
  ],
  properties: {
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    volumeAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["totalSets", "estimatedVolumeKg", "dominantBodyParts", "comment"],
      properties: {
        totalSets: { type: "integer" },
        estimatedVolumeKg: { type: "number" },
        dominantBodyParts: { type: "array", items: { type: "string" } },
        comment: { type: "string" }
      }
    },
    strengths: { type: "array", items: { type: "string" } },
    cautions: { type: "array", items: { type: "string" } },
    nextWorkoutSuggestions: { type: "array", items: { type: "string" } },
    recoveryTips: { type: "array", items: { type: "string" } }
  }
} as const;

export async function generateDietPlan(
  userId: string,
  input: {
    goalWeightKg: number;
    targetDate?: Date;
    periodWeeks?: number;
    activityLevel: "low" | "medium" | "high";
    dietaryPreference?: string;
    allergies: string[];
  }
) {
  const latestInbody = await prisma.inbody.findFirst({
    where: { userId },
    orderBy: { measuredAt: "desc" }
  });

  if (!latestInbody) {
    throw new HttpError(400, "식단 추천을 위해 최신 인바디 데이터가 필요합니다.");
  }

  return callStructuredJson({
    schemaName: "diet_plan",
    schema: dietResponseSchema,
    systemPrompt:
      "You are a certified fitness nutrition assistant for a Korean gym app. Return only Korean JSON that matches the provided schema. Avoid medical diagnosis. Keep recommendations practical, safe, and based on the user's latest inbody metrics and stated goal.",
    userPrompt: JSON.stringify({
      task: "인바디와 목표 기반 식단 추천",
      latestInbody,
      goal: input
    })
  });
}

export async function generateWorkoutFeedback(userId: string, workoutLogId?: string) {
  const [latestInbody, workoutLog] = await Promise.all([
    prisma.inbody.findFirst({
      where: { userId },
      orderBy: { measuredAt: "desc" }
    }),
    workoutLogId
      ? prisma.workoutLog.findFirst({
          where: { id: workoutLogId, userId },
          include: {
            exercises: {
              orderBy: { sortOrder: "asc" },
              include: { sets: { orderBy: { sortOrder: "asc" } } }
            }
          }
        })
      : prisma.workoutLog.findFirst({
          where: { userId },
          orderBy: { workoutDate: "desc" },
          include: {
            exercises: {
              orderBy: { sortOrder: "asc" },
              include: { sets: { orderBy: { sortOrder: "asc" } } }
            }
          }
        })
  ]);

  if (!latestInbody) {
    throw new HttpError(400, "운동 피드백을 위해 최신 인바디 데이터가 필요합니다.");
  }
  if (!workoutLog) {
    throw new HttpError(404, "분석할 운동 일지를 찾을 수 없습니다.");
  }

  return callStructuredJson({
    schemaName: "workout_feedback",
    schema: feedbackResponseSchema,
    systemPrompt:
      "You are a senior strength coach for a Korean gym app. Return only Korean JSON that matches the provided schema. Evaluate the workout log with the user's latest inbody metrics. Be concrete, encouraging, and safety-minded. Do not invent exercises or measurements.",
    userPrompt: JSON.stringify({
      task: "운동 일지 및 최신 인바디 기반 당일 운동 피드백",
      latestInbody,
      workoutLog
    })
  });
}

async function callStructuredJson(input: {
  schemaName: string;
  schema: Record<string, unknown>;
  systemPrompt: string;
  userPrompt: string;
}) {
  if (!openai) {
    throw new HttpError(503, "OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: input.schemaName,
        strict: true,
        schema: input.schema
      }
    }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new HttpError(502, "AI 응답이 비어 있습니다.");
  }

  return JSON.parse(content);
}
