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

type StructuredJsonInput = {
  schemaName: string;
  schema: Record<string, unknown>;
  systemPrompt: string;
  userPrompt: string;
};

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
      task: "인바디와 목표 기반 맞춤형 식단 추천",
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
      task: "운동 일지와 최신 인바디 기반 운동 피드백",
      latestInbody,
      workoutLog
    })
  });
}

async function callStructuredJson(input: StructuredJsonInput) {
  if (env.AI_PROVIDER === "gemini") {
    return callGeminiStructuredJson(input);
  }

  return callOpenAiStructuredJson(input);
}

async function callOpenAiStructuredJson(input: StructuredJsonInput) {
  if (!openai) {
    throw new HttpError(503, "OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  try {
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
  } catch (error) {
    throw mapProviderError("OpenAI", error);
  }
}

async function callGeminiStructuredJson(input: StructuredJsonInput) {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, "GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }

  const model = env.GEMINI_MODEL.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    env.GEMINI_API_KEY
  )}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: input.systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: input.userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: toGeminiResponseSchema(input.schema)
        }
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage = getGeminiErrorMessage(payload) ?? response.statusText;
      throw mapProviderHttpError("Gemini", response.status, providerMessage);
    }

    const content = extractGeminiText(payload);
    if (!content) {
      throw new HttpError(502, "Gemini 응답이 비어 있습니다.", { providerPayload: payload });
    }

    return JSON.parse(content);
  } catch (error) {
    throw mapProviderError("Gemini", error);
  }
}

function toGeminiResponseSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === "additionalProperties" || key === "minItems") {
      continue;
    }

    if (key === "type" && typeof value === "string") {
      output.type = value.toUpperCase();
      continue;
    }

    if (key === "properties" && isRecord(value)) {
      output.properties = Object.fromEntries(
        Object.entries(value).map(([propertyName, propertySchema]) => [
          propertyName,
          isRecord(propertySchema) ? toGeminiResponseSchema(propertySchema) : propertySchema
        ])
      );
      output.propertyOrdering = Object.keys(value);
      continue;
    }

    if (key === "items" && isRecord(value)) {
      output.items = toGeminiResponseSchema(value);
      continue;
    }

    output[key] = value;
  }

  return output;
}

function extractGeminiText(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) {
    return null;
  }

  return candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
        return [];
      }
      return candidate.content.parts.map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""));
    })
    .join("")
    .trim();
}

function getGeminiErrorMessage(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }

  return typeof payload.error.message === "string" ? payload.error.message : null;
}

function mapProviderError(provider: "OpenAI" | "Gemini", error: unknown) {
  if (error instanceof HttpError) {
    return error;
  }

  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 502;
  const message = error instanceof Error ? error.message : `${provider} 요청 중 오류가 발생했습니다.`;
  console.error(`${provider} structured output error:`, error);

  return mapProviderHttpError(provider, status, message);
}

function mapProviderHttpError(provider: "OpenAI" | "Gemini", status: number, providerMessage: string) {
  if (status === 401 || status === 403) {
    return new HttpError(502, `${provider} API 키 또는 권한을 확인해야 합니다.`, { providerMessage });
  }
  if (status === 429) {
    return new HttpError(502, `${provider} 사용량 한도 또는 요청 제한에 걸렸습니다.`, { providerMessage });
  }
  if (status >= 400 && status < 500) {
    return new HttpError(502, `${provider} 요청 형식 또는 모델 설정을 확인해야 합니다.`, { providerMessage });
  }

  return new HttpError(502, `${provider} 응답 생성 중 오류가 발생했습니다.`, { providerMessage });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
