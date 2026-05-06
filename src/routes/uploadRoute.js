import express from "express";
import { isAuthenticated } from "../midlewares/inAuthentication.js";
import upload from "../utils/multer.js";
import { uploadFileController } from "../controller/uploadController.js";

const uploadRoute = express.Router();

uploadRoute.post("/upload", isAuthenticated, upload.single("file"), uploadFileController);

export default uploadRoute;
