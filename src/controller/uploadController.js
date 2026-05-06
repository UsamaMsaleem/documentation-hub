import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Determine folder based on file type
    const isImage = req.file.mimetype.startsWith("image/");
    const folder = isImage ? "Documents/Images" : "Documents/Files";

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folder,
      resource_type: isImage ? "image" : "raw", // Automatically detect file type (image, video, raw)
    });


    const downloadUrl = cloudinary.url(result.public_id, {
      resource_type: isImage ? "image" : "raw",
      flags: "attachment",
    })

    // Remove file from local storage after upload
    // fs.unlinkSync(req.file.path); 

    console.log("executed");
    console.log(downloadUrl);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        name: req.file.originalname,
        url: result.secure_url,
        downloadUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.log("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};