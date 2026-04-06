import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { recordRoutes } from "./routes/recordRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { notFound } from "./utils/httpError.js";

export function createApp({ jwtSecret, clientOrigin }) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: clientOrigin,
      credentials: false,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes({ jwtSecret }));

  app.use("/api", requireAuth(jwtSecret));
  app.use("/api/users", userRoutes());
  app.use("/api/records", recordRoutes());
  app.use("/api/dashboard", dashboardRoutes());

  app.use((_req, _res, next) => next(notFound("Route not found")));
  app.use(errorHandler);

  return app;
}

