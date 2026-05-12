import express from "express";
import routes from "./routes/authRoute.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import profileRoute from "./routes/profileRoute.js";
import commentRoute from "./routes/commentRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import dns from "node:dns";

dotenv.config();

const app = express();

// DNS configuration
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Allowed Origins
const allowedOrigins = [
  "https://document-sharing-zeta.vercel.app",
  "https://documentation-hub-h5zv.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/user", routes);
app.use("/user", profileRoute);
app.use("/user", commentRoute);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/upload", uploadRoute);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
  });
});

// Environment Variables
const PORT = process.env.PORT || 5500;
const URI = process.env.URI;

// Database Connection
mongoose
  .connect(URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });