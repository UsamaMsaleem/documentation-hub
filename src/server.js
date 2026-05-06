import express from "express";
import routes from './routes/authRoute.js'
import workspaceRoutes from './routes/workspaceRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import attachmentRoutes from './routes/attachmentRoutes.js'
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import profileRoute from "./routes/profileRoute.js";
import commentRoute from "./routes/commentRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import dns from 'node:dns'

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://document-sharing-zeta.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

let PORT = process.env.PORT || 5500;
let URI = process.env.URI;
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Routes
app.use("/user", routes);
app.use("/user", profileRoute);
app.use("/user", commentRoute);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/upload', uploadRoute);

mongoose
  .connect(URI)
  .then(() => {
    console.log("Mongodb connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error, "Ye mongodb error hai");
  });
