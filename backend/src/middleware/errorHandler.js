import { HttpError } from "../utils/httpError.js";
import { ZodError } from "zod";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid input",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: "HttpError",
      message: err.message,
      details: err.details ?? undefined,
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong",
  });
}

