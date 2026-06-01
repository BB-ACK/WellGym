import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { createWorkoutLogSchema, workoutQuerySchema } from "../validators/workout.schemas";

export const workoutRouter = Router();

workoutRouter.use(requireAuth);

const workoutInclude = {
  exercises: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      sets: { orderBy: { sortOrder: "asc" as const } }
    }
  }
};

workoutRouter.post(
  "/logs",
  asyncHandler(async (req, res) => {
    const body = createWorkoutLogSchema.parse(req.body);
    const log = await prisma.workoutLog.create({
      data: {
        userId: req.user!.id,
        workoutDate: body.workoutDate,
        sessionTitle: body.sessionTitle,
        condition: body.condition,
        memo: body.memo,
        exercises: {
          create: body.exercises.map((exercise, exerciseIndex) => ({
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sortOrder: exerciseIndex,
            sets: {
              create: exercise.sets.map((set, setIndex) => ({
                weightKg: set.weightKg,
                reps: set.reps,
                sortOrder: setIndex
              }))
            }
          }))
        }
      },
      include: workoutInclude
    });

    res.status(201).json(log);
  })
);

workoutRouter.get(
  "/logs",
  asyncHandler(async (req, res) => {
    const query = workoutQuerySchema.parse(req.query);
    const logs = await prisma.workoutLog.findMany({
      where: {
        userId: req.user!.id,
        workoutDate: {
          gte: query.from,
          lte: query.to
        }
      },
      orderBy: { workoutDate: "desc" },
      include: workoutInclude
    });

    res.json(logs);
  })
);
