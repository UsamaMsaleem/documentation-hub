import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userCollection from "../models/auth/auth.js";
import session from "../models/auth/session.js";
import { verifyEmail, sendInvitationEmail } from "../Email/email.js";
import dotenv from "dotenv";
import { sendOtpMail } from "../Email/sendOtpMail.js";

dotenv.config();

// Signup User Function
export const signupUser = async (req, res) => {
  const { email, password } = req.body;
  let result = req.body;
  let checkEmail = await userCollection.findOne({ email });
  if (checkEmail) {
    return res.json({
      message: "user already exits!",
      success: false,
    });
  }
  let passwordJson = await bcrypt.hash(password, 10);
  let data = { ...result, password: passwordJson };

  let final = await userCollection.create(data);
  let token = jwt.sign({ id: final._id }, process.env.SECRET_KEY, {
    expiresIn: "10m",
  });
  final.token = token;
  verifyEmail(token, email);
  await final.save();
  res.json({
    message: "Signup successfully!",
    success: true,
    final,
  });
};

// Verification Function
export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }

    const user = await userCollection.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        message: "Email and Password required",
        success: false,
      });
    }

    let user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "user not found",
        success: false,
      });
    }
    let checkUser = await bcrypt.compare(password, user.password);

    if (!checkUser) {
      return res.status(404).json({
        message: "Password not match",
        success: false,
      });
    }

    if (user.isVerified !== true) {
      return res.status(403).json({
        message: "Please Verify Email Check",
        success: false,
      });
    }

    const existingSession = await session.findOne({ userId: user._id });
    if (existingSession) {
      await session.deleteOne({ userId: user._id });
    }

    await session.create({ userId: user._id });

    let tokenGenerate = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });

    res.cookie("token", tokenGenerate, {
      httpOnly: true,
      secure: true,        // MUST in production (HTTPS)
      sameSite: "none",    // IMPORTANT for cross-site frontend/backend
      // secure: false, // development mein false hona chahiye
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    let refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });

    user.isLoggedIn = true;
    await user.save();

    res.status(200).json({
      message: `Welcome Back ${user.username}`,
      success: true,
      tokenGenerate,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Logout Function
export const logout = async (req, res) => {
  try {
    const userId = req.userId;

    if (userId) {
      await session.deleteMany({ userId });
      await userCollection.findByIdAndUpdate(userId, { isLoggedIn: false });
    }

    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forget Password Function
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

// Verify OTP Function
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.email;

  if (!otp) {
    return res.status(400).json({
      message: "OTP is required",
      success: false,
    });
  }

  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (!otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "OTP not generated or already verfiy",
        success: false,
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP has expired please request a new one",
        success: false,
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        message: "OTP invalid",
        success: false,
      });
    }

    ((user.otp = null), (user.otpExpiry = null));

    await user.save();

    res.status(200).json({
      messaeg: "OTP verify successfully!",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      messaeg: "internal server error",
      success: true,
    });
  }
};

// Change Password Function
export const changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const email = req.params.email;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "feid are required",
      success: false,
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password does not match",
      success: false,
    });
  }

  try {
    let user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    user.save();

    return res.status(200).json({
      message: "Password Change Successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      success: false,
    });
  }
};

// Assign Role Function
export const assignRole = async (req, res) => {
  const { email, newRole } = req.body;

  if (!email || !newRole) {
    return res.status(400).json({
      success: false,
      message: "Email and newRole are required fields",
    });
  }

  const validRoles = ["admin", "editor", "viewer"];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role! Allowed roles are admin, editor, or viewer.",
    });
  }

  try {
    let user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    user.role = newRole;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${user.username}'s role to ${newRole}!`,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while assigning role",
      error: error.message
    });
  }
};

// Get All Users Function
export const  getAllUsers = async (req, res) => {
  try {
    const loggedInAdminId = req.userId;

    const users = await userCollection.find({ 
      _id: { $ne: loggedInAdminId } 
    }).select("-password");

    

    return res.status(200).json({
      success: true,
      count: users.length,
      message: "All users fetched except the current admin",
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message
    });
  }
};


// Invite users for signup
export const inviteUser = async (req, res) => {
 console.log(req.body)
  const { email } = req.body ?? {};

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await userCollection.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    await sendInvitationEmail(email);

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while inviting user",
      error: error.message,
    });
  }
};

