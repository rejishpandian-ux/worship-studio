
// Worship Studio - Authentication Router
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

import {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  updateUser,
  changeUserPassword,
  createResetToken,
  verifyAndResetPassword,
  addWorkspace,
  switchWorkspace
} from "../db/authDb.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Check your .env file.");
}

// Convert database user into safe frontend user
function toSafeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    churchName: user.church_name,
    role: user.role,
    plan: user.plan,
    avatar: user.avatar,
    workspaces: user.workspaces || [],
    currentWorkspaceId: user.current_workspace_id,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

// Generate JWT
function generateToken(user, rememberMe = false) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      currentWorkspaceId: user.currentWorkspaceId
    },
    JWT_SECRET,
    { expiresIn: rememberMe ? "30d" : "7d" }
  );
}

// Authentication middleware
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required. Please sign in."
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired session. Please sign in again."
    });
  }
}

// Configuration
router.get("/config", (req, res) => {
  res.json({
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    supabaseConfigured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
    )
  });
});

// 1. Sign Up
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword, churchName } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: "Full name is required." });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters."
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const user = await createUser({ name, email, password, churchName });
    const token = generateToken(user, true);

    res.status(201).json({
      user,
      token,
      message: "Account created successfully!"
    });
  } catch (err) {
    console.error("Sign up error:", err);
    res.status(400).json({
      error: err.message || "Failed to create account."
    });
  }
});

// 2. Sign In
router.post("/signin", async (req, res) => {
  const { email, password, rememberMe } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required."
    });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const safeUser = toSafeUser(user);
    const token = generateToken(safeUser, Boolean(rememberMe));

    res.json({
      user: safeUser,
      token,
      message: "Signed in successfully!"
    });
  } catch (err) {
    console.error("Sign in error:", err);
    res.status(500).json({
      error: "Internal server error during sign in."
    });
  }
});

// 3. Get Current User
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    res.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// 4. Update Profile
router.put("/profile", requireAuth, async (req, res) => {
  const { name, churchName, avatar } = req.body || {};

  try {
    const updated = await updateUser(req.user.id, {
      ...(name && { name: name.trim() }),
      ...(churchName && { churchName: churchName.trim() }),
      ...(avatar !== undefined && { avatar })
    });

    res.json({
      user: updated,
      message: "Profile updated successfully!"
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to update profile."
    });
  }
});

// 5. Change Password
router.put("/password", requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      error: "Current and new passwords are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters."
    });
  }

  try {
    await changeUserPassword(req.user.id, oldPassword, newPassword);

    res.json({
      success: true,
      message: "Password updated successfully!"
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to update password."
    });
  }
});

// 6. Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const { token } = await createResetToken(email);

    const response = {
      success: true,
      message: "If an account exists with this email, a reset token has been generated."
    };

    // Development only. Never expose reset tokens in production.
    if (process.env.NODE_ENV !== "production" && token) {
      response.resetToken = token;
    }

    res.json(response);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Could not process password reset request." });
  }
});

// 7. Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};

  if (!token || !newPassword) {
    return res.status(400).json({
      error: "Reset token and new password are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters."
    });
  }

  try {
    await verifyAndResetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Your password has been reset. You can now sign in."
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to reset password."
    });
  }
});

// 8. Add Workspace
router.post("/workspace", requireAuth, async (req, res) => {
  const { name } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: "Workspace name is required." });
  }

  try {
    const updated = await addWorkspace(req.user.id, name);

    res.json({
      user: updated,
      message: `Workspace "${name}" created!`
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to create workspace."
    });
  }
});

// 9. Switch Workspace
router.post("/workspace/switch", requireAuth, async (req, res) => {
  const { workspaceId } = req.body || {};

  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required." });
  }

  try {
    const updated = await switchWorkspace(req.user.id, workspaceId);

    res.json({
      user: updated,
      message: "Switched workspace successfully."
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to switch workspace."
    });
  }
});

// 10. Sign Out
router.post("/signout", (req, res) => {
  res.json({
    success: true,
    message: "Signed out successfully."
  });
});

export default router;
