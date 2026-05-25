import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionModel.js";
import { SendOTPMail } from "../emailVerify/sendOTPMail.js";
import cloudinary from "../utils/cloudinary.js";

const jwtSecret = process.env.SECRET_KEY || "ekart-dev-secret";

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and save token separately (so we can control what is returned)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // create short-lived registration token
    const token = jwt.sign({ id: newUser._id }, jwtSecret, {
      expiresIn: "10m",
    });

    // send verification email (if verifyEmail is async, await it; otherwise it's fine)
    let verificationEmailSent = true;
    try {
      const mailResult = await verifyEmail(token, email);
      if (mailResult?.skipped) {
        newUser.isVerified = true;
        newUser.token = null;
        verificationEmailSent = false;
      }
    } catch (mailErr) {
      // don't crash app if email sending fails — but log it and continue
      console.error("verifyEmail error:", mailErr?.message || mailErr);
    }

    // store token on user and save when verification mail was actually sent
    if (verificationEmailSent) {
      newUser.token = token;
    }
    await newUser.save();

    // respond without sending password or sensitive fields
    const safeUser = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      isBlocked: newUser.isBlocked,
      isVerified: newUser.isVerified || false,
    };

    return res.status(201).json({
      success: true,
      message: verificationEmailSent
        ? "User registered successfully. Verification email sent."
        : "User registered successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in registering user",
      error: error.message,
    });
  }
};

/**
 * Verify registration token
 */
export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed: invalid token",
      });
    }

    const user = await User.findById(decoded.id);
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
    console.error("verify error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Re-send verification token
 */
export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "10m",
    });

    try {
      const mailResult = await verifyEmail(token, email);
      if (mailResult?.skipped) {
        return res.status(200).json({
          success: true,
          message:
            "Verification email skipped because mail service is not configured.",
          token: user.token,
        });
      }
    } catch (mailErr) {
      console.error("reVerify email error:", mailErr?.message || mailErr);
    }

    user.token = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      token: user.token,
    });
  } catch (error) {
    console.error("reVerify error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is not verified",
      });
    }

    if (existingUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Contact an administrator.",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign({ id: existingUser._id }, jwtSecret, {
      expiresIn: "10d",
    });
    const refreshToken = jwt.sign({ id: existingUser._id }, jwtSecret, {
      expiresIn: "30d",
    });

    existingUser.isLoggedIn = true;
    await existingUser.save();

    // If a session exists, delete it first (so we have a single current session)
    const existingSession = await Session.findOne({ userId: existingUser._id });
    if (existingSession) {
      await Session.deleteOne({ userId: existingUser._id });
    }

    // Create a new session document
    await Session.create({ userId: existingUser._id });

    // Do not send sensitive fields back
    const safeUser = {
      id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
      isBlocked: existingUser.isBlocked,
      isVerified: existingUser.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

/**
 * Logout
 */
export const logout = async (req, res) => {
  try {
    // depending on your isAuthenticated middleware, user id might be on req.id or req.user
    const userId = req.id || req.user?.id || req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id missing from request",
      });
    }

    await Session.deleteOne({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in logout",
    });
  }
};

/**
 * Forgot password (send OTP)
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    try {
      await SendOTPMail(otp, email);
    } catch (mailErr) {
      console.error("SendOTPMail error:", mailErr?.message || mailErr);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in forgot password",
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.params.email;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP generated. Please request a new one.",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in verifying OTP",
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in changing password",
    });
  }
};

/**
 * Get all users (admin)
 */
export const allUser = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry -token");
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("allUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching users",
    });
  }
};

/**
 * Get user by id
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params; // fixed
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in params",
      });
    }

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry -token",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching user by ID",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInUser = req.user;

    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNumber,
      phoneNo,
      role,
    } = req.body;

    if (
      loggedInUser._id.toString() !== userIdToUpdate &&
      loggedInUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this user",
      });
    }

    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    // ✅ FILE UPLOAD FIXED
    if (req.file) {
      if (profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    // ✅ FIELD UPDATES
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.city = city || user.city;
    user.zipCode = zipCode || user.zipCode;
    user.phoneNo = phoneNumber || phoneNo || user.phoneNo;
    user.phoneNumber = phoneNumber || phoneNo || user.phoneNumber;
    user.role = role || user.role;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;

    const updatedUser = await user.save();

    const safeUser = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked,
      profilePic: updatedUser.profilePic,
      phoneNo: updatedUser.phoneNo,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      city: updatedUser.city,
      zipCode: updatedUser.zipCode,
      isVerified: updatedUser.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password -otp -otpExpiry -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
