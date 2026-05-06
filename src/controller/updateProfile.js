import User from "../models/auth/auth.js";
import cloudinary from "../utils/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, bio } = req.body;

    let updateFields = { username, bio };

    // Upload image to Cloudinary via buffer stream (memoryStorage compatible)
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Profiles" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
      updateFields.image = imageUrl;
    }

    const updateData = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      updateData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
