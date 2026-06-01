import { Router } from "express";
import { login, signup } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, signupSchema } from "../validators/auth.schemas";

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const result = await signup(signupSchema.parse(req.body));
    res.status(201).json(result);
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const result = await login(loginSchema.parse(req.body));
    res.json(result);
  })
);
