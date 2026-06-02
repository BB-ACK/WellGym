import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { corsOrigins } from "./config/env";
import { aiRouter } from "./routes/ai.routes";
import { authRouter } from "./routes/auth.routes";
import { inbodyRouter } from "./routes/inbody.routes";
import { workoutRouter } from "./routes/workout.routes";
import { HttpError } from "./utils/httpError";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, "허용되지 않은 CORS origin입니다."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "8mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "wellgym-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/workout", workoutRouter);
app.use("/api/inbody", inbodyRouter);
app.use("/api/ai", aiRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, "요청한 API를 찾을 수 없습니다."));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "요청 형식이 올바르지 않습니다.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
});
