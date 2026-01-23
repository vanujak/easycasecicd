import app from "./app.js";
import { connectDB } from "./db/mongoose.js";

// server entry point
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`🚀 EasyCase API on http://localhost:${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
