import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/mongoose.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.js";

// 👇 NEW: multi-tenant resource routers
import clientsRouter from "./routes/clients.routes.js";
import casesRouter from "./routes/cases.routes.js";
import hearingsRouter from "./routes/hearings.routes.js";

const app = express();

// FIXED: Added PATCH to allowed methods
app.use(cors({ 
  origin: ["http://localhost:5173", "https://easy-case.vercel.app"], 
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] // Added PATCH here
}));

app.use(express.json());

// connect to Atlas before serving requests
await connectDB(process.env.MONGODB_URI); // FIXED: Added .env back

// basic health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// auth routes (signup/login)
app.use("/auth", authRoutes);

// 👇 NEW: protected data routes (use requireAuth inside each router)
app.use("/api/clients", clientsRouter);
app.use("/api/cases", casesRouter);
app.use("/api/hearings", authMiddleware, hearingsRouter);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 EasyCase API on http://localhost:${port}`));
