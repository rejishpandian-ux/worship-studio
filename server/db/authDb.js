// Worship Studio - Secure Persistent User & Workspace Store
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean safe user helper (strips sensitive fields)
function toSafeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.resetToken;
  delete safe.resetTokenExpiry;
  return safe;
}

// Load or initialize users collection
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    // Initialize with a default demo worship leader account
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync("Worship2026!", salt);
    const initialUsers = [
      {
        id: "usr_peaceag_demo",
        name: "Pastor David",
        email: "pastor@peaceag.org",
        passwordHash: demoPasswordHash,
        churchName: "Peace AG Church",
        role: "Worship Leader",
        plan: "Church Pro Plan",
        avatar: "",
        workspaces: [
          { id: "ws_main", name: "Peace AG Main Worship", isDefault: true },
          { id: "ws_youth", name: "Youth Ministry", isDefault: false },
          { id: "ws_tamil", name: "Tamil Service Gathering", isDefault: false }
        ],
        currentWorkspaceId: "ws_main",
        createdAt: new Date().toISOString(),
        resetToken: null,
        resetTokenExpiry: null
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), "utf8");
    return initialUsers;
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse users.json, returning empty list:", err);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export function findUserById(id) {
  if (!id) return null;
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser({ name, email, password, churchName }) {
  const users = loadUsers();
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const userId = `usr_${crypto.randomBytes(8).toString("hex")}`;
  const defaultWsId = `ws_${crypto.randomBytes(6).toString("hex")}`;

  const defaultWsName = churchName ? `${churchName} Team` : "My Worship Team";

  const newUser = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    churchName: (churchName || "Local Church").trim(),
    role: "Worship Leader",
    plan: "Free Worship Plan",
    avatar: "",
    workspaces: [
      { id: defaultWsId, name: defaultWsName, isDefault: true }
    ],
    currentWorkspaceId: defaultWsId,
    createdAt: new Date().toISOString(),
    resetToken: null,
    resetTokenExpiry: null
  };

  users.push(newUser);
  saveUsers(users);

  return toSafeUser(newUser);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function updateUser(id, updates) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found.");

  const user = users[idx];
  const safeUpdates = { ...updates };
  delete safeUpdates.passwordHash;
  delete safeUpdates.id;

  users[idx] = {
    ...user,
    ...safeUpdates,
    updatedAt: new Date().toISOString()
  };

  saveUsers(users);
  return toSafeUser(users[idx]);
}

export async function changeUserPassword(id, oldPassword, newPassword) {
  const users = loadUsers();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error("User not found.");

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) throw new Error("Current password is incorrect.");

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  saveUsers(users);
  return true;
}

export function createResetToken(email) {
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    // Return mock success to prevent email enumeration
    return { token: null, emailSent: true };
  }

  const token = crypto.randomBytes(24).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour valid
  saveUsers(users);

  return { token, emailSent: true };
}

export async function verifyAndResetPassword(token, newPassword) {
  const users = loadUsers();
  const user = users.find(
    (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now()
  );

  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  saveUsers(users);
  return true;
}

export function addWorkspace(userId, workspaceName) {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");

  const newWs = {
    id: `ws_${crypto.randomBytes(6).toString("hex")}`,
    name: workspaceName.trim(),
    isDefault: false
  };

  user.workspaces.push(newWs);
  user.currentWorkspaceId = newWs.id;
  saveUsers(users);

  return toSafeUser(user);
}

export function switchWorkspace(userId, workspaceId) {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");

  const target = user.workspaces.find((w) => w.id === workspaceId);
  if (!target) throw new Error("Workspace not found in your account.");

  user.currentWorkspaceId = target.id;
  saveUsers(users);

  return toSafeUser(user);
}
