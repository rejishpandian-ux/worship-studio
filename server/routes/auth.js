// Worship Studio - Authentication Router
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
const JWT_SECRET = process.env.JWT_SECRET || "worship_studio_jwt_secret_secure_key_2026";

// Helper: Generate JWT token
function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? "30d" : "7d";
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      currentWorkspaceId: user.currentWorkspaceId
    },
    JWT_SECRET,
    { expiresIn }
  );
}

// Auth Middleware: verify bearer token
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
  }
}

// Public configuration check
router.get("/config", (req, res) => {
  res.json({
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id"),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
});

// 1. Sign Up
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword, churchName } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Full name is required." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      churchName
    });
    const token = generateToken(user, true);
    res.status(201).json({ user, token, message: "Account created successfully!" });
  } catch (err) {
    console.error("Sign up error:", err);
    res.status(400).json({ error: err.message || "Failed to create account." });
  }
});

// 2. Sign In
router.post("/signin", async (req, res) => {
  const { email, password, rememberMe } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = generateToken(safeUser, Boolean(rememberMe));
    res.json({ user: safeUser, token, message: "Signed in successfully!" });
  } catch (err) {
    console.error("Sign in error:", err);
    res.status(500).json({ error: "Internal server error during sign in." });
  }
});

// 3. Get Current User Profile (Me)
router.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User account not found." });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 4. Update Profile
router.put("/profile", requireAuth, (req, res) => {
  const { name, churchName, avatar } = req.body || {};
  try {
    const updated = updateUser(req.user.id, {
      ...(name && { name: name.trim() }),
      ...(churchName && { churchName: churchName.trim() }),
      ...(avatar !== undefined && { avatar })
    });
    res.json({ user: updated, message: "Profile updated successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update profile." });
  }
});

// 5. Change Password
router.put("/password", requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  try {
    await changeUserPassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update password." });
  }
});

// 6. Forgot Password (Request Reset Token)
router.post("/forgot-password", (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const { token } = createResetToken(email);
  res.json({
    success: true,
    message: "If an account exists with this email, a reset token has been generated.",
    resetToken: token // Available for seamless local testing
  });
});

// 7. Reset Password with Token
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Reset token and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    await verifyAndResetPassword(token, newPassword);
    res.json({ success: true, message: "Your password has been reset. You can now sign in." });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to reset password." });
  }
});

// 8. Add Workspace
router.post("/workspace", requireAuth, (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Workspace name is required." });
  }

  try {
    const updated = addWorkspace(req.user.id, name);
    res.json({ user: updated, message: `Workspace "${name}" created!` });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create workspace." });
  }
});

// 9. Switch Workspace
router.post("/workspace/switch", requireAuth, (req, res) => {
  const { workspaceId } = req.body || {};
  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required." });
  }

  try {
    const updated = switchWorkspace(req.user.id, workspaceId);
    res.json({ user: updated, message: "Switched workspace successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to switch workspace." });
  }
});

// 10. Sign Out
router.post("/signout", (req, res) => {
  res.json({ success: true, message: "Signed out successfully." });
});

export default router;

