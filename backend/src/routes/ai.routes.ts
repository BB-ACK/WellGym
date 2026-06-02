import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { analyzeInbodyPhoto, generateDietPlan, generateWorkoutFeedback } from "../services/ai.service";
import { asyncHandler } from "../utils/asyncHandler";
import { dietRequestSchema, feedbackRequestSchema, inbodyOcrRequestSchema } from "../validators/ai.schemas";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post(
  "/diet",
  asyncHandler(async (req, res) => {
    const body = dietRequestSchema.parse(req.body);
    const result = await generateDietPlan(req.user!.id, body);
    res.json(result);
  })
);

aiRouter.post(
  "/feedback",
  asyncHandler(async (req, res) => {
    const body = feedbackRequestSchema.parse(req.body);
    const result = await generateWorkoutFeedback(req.user!.id, body.workoutLogId);
    res.json(result);
  })
);

aiRouter.post(
  "/inbody-ocr",
  asyncHandler(async (req, res) => {
    const body = inbodyOcrRequestSchema.parse(req.body);
    const result = await analyzeInbodyPhoto(body);
    res.json(result);
  })
);
