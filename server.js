import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";
import userRoutes from "./src/routes/userRoutes.js";
import { verifyEmailConnection } from "./src/services/emailService.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

connectDB()
  .then(() => {
    verifyEmailConnection();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err.message);
    process.exit(1);
  });
