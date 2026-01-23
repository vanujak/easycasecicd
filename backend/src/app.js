import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.js";
import clientsRouter from "./routes/clients.routes.js";
import casesRouter from "./routes/cases.routes.js";
import hearingsRouter from "./routes/hearings.routes.js";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://easy-case.vercel.app", "http://3.229.137.7"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// basic health check
app.get("/health", (_req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() })
);

// auth routes (signup/login)
app.use("/auth", authRoutes);

// protected data routes
app.use("/api/clients", clientsRouter);
app.use("/api/cases", casesRouter);
app.use("/api/hearings", authMiddleware, hearingsRouter);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

export default app;
