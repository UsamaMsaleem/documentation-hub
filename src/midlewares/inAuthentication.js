import jwt from "jsonwebtoken";
import User from "../models/auth/auth.js";


export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; 
    req.userId = user._id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};



export const isAdmin = async (req, res, next) => {
  try {
    
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied! Sirf Admins hi roles change kar sakte hain.",
      });
    }

    next(); 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error checking admin role",
    });
  }
};