import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/index.js";
import requestId from "./middleware/requestId.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import itemRoutes from "./routes/items.js";
import requestRoutes from "./routes/requests.js";
import transactionRoutes from "./routes/transactions.js";
import reviewRoutes from "./routes/reviews.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import recommendationRoutes from "./routes/recommendations.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(requestId);
app.use(globalLimiter);

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);

app.use(errorHandler);

export default app;
