import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { createInbodySchema } from "../validators/inbody.schemas";

export const inbodyRouter = Router();

inbodyRouter.use(requireAuth);

inbodyRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createInbodySchema.parse(req.body);
    const inbody = await prisma.inbody.create({
      data: {
        ...body,
        userId: req.user!.id
      }
    });

    res.status(201).json(inbody);
  })
);

inbodyRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const history = await prisma.inbody.findMany({
      where: { userId: req.user!.id },
      orderBy: { measuredAt: "desc" }
    });
    res.json(history);
  })
);

inbodyRouter.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const latest = await prisma.inbody.findFirst({
      where: { userId: req.user!.id },
      orderBy: { measuredAt: "desc" }
    });
    res.json(latest);
  })
);
