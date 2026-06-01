import { z } from "zod";

export const workoutSetSchema = z.object({
  weightKg: z.number().nonnegative().optional(),
  reps: z.number().int().positive()
});

export const workoutExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  bodyPart: z.string().min(1).max(80),
  sets: z.array(workoutSetSchema).min(1)
});

export const createWorkoutLogSchema = z.object({
  workoutDate: z.coerce.date(),
  sessionTitle: z.string().min(1).max(120),
  condition: z.string().max(80).optional(),
  memo: z.string().max(2000).optional(),
  exercises: z.array(workoutExerciseSchema).min(1)
});

export const workoutQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});
