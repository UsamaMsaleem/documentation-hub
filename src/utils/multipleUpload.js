import cloudinary from "./cloudinary.js";

const multipleUpload = async (files, folder = "uploads") => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {

        // ✅ FIX 1: correct resource type detection
        const resourceType =
          file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype === "application/pdf"
              ? "raw"
              : "auto";

        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType, // ✅ FIXED
            type: "upload", // ensure public delivery
          },
          (error, result) => {
            if (error) return reject(error);

            // ✅ FIX 2: always use result.resource_type
            const finalResourceType = result.resource_type;

            // ✅ FIX 3: proper download URL (no 401 + no blank file)
            const downloadUrl = cloudinary.url(result.public_id, {
              resource_type: finalResourceType,
              type: "upload",
              flags: "attachment",
              secure: true,
              version: result.version,
            });

            resolve({
              url: result.secure_url,          // preview/open
              downloadUrl,                    // ✅ download use this
              publicId: result.public_id,
              fileType: finalResourceType,
              name: file.originalname,
              fileSize: file.size,
            });
          }
        );

        stream.end(file.buffer);
      });
    });

    return await Promise.all(uploadPromises);

  } catch (error) {
    throw error;
  }
};

export default multipleUpload;  