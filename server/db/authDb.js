
import { supabase } from "./supabaseClient.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

function checkError(error) {
  if (error) throw new Error(error.message);
}

export async function findUserByEmail(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  checkError(error);
  return data || null;
}

export async function findUserById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  checkError(error);
  return data || null;
}

export async function createUser({ name, email, password, churchName }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `usr_${crypto.randomBytes(8).toString("hex")}`;
  const workspaceId = `ws_${crypto.randomBytes(6).toString("hex")}`;

  const workspaceName = churchName
    ? `${churchName.trim()} Team`
    : "My Worship Team";

  const { data, error } = await supabase
    .from("app_users")
    .insert({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      church_name: (churchName || "Local Church").trim(),
      role: "Worship Leader",
      plan: "Free Worship Plan",
      avatar: "",
      workspaces: [
        {
          id: workspaceId,
          name: workspaceName,
          isDefault: true
        }
      ],
      current_workspace_id: workspaceId
    })
    .select("*")
    .single();

  checkError(error);
  return toSafeUser(data);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function updateUser(id, updates) {
  const dbUpdates = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.churchName !== undefined) dbUpdates.church_name = updates.churchName;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("app_users")
    .update(dbUpdates)
    .eq("id", id)
    .select("*")
    .single();

  checkError(error);
  return toSafeUser(data);
}

export async function changeUserPassword(id, oldPassword, newPassword) {
  const user = await findUserById(id);

  if (!user) throw new Error("User not found.");

  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from("app_users")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  checkError(error);
  return true;
}

export async function createResetToken(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    return { token: null, emailSent: true };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiry = Date.now() + 60 * 60 * 1000;

  const { error } = await supabase
    .from("app_users")
    .update({
      reset_token: token,
      reset_token_expiry: expiry
    })
    .eq("id", user.id);

  checkError(error);

  return { token, emailSent: true };
}

export async function verifyAndResetPassword(token, newPassword) {
  const { data: user, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("reset_token", token)
    .gt("reset_token_expiry", Date.now())
    .maybeSingle();

  checkError(error);

  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("app_users")
    .update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expiry: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  checkError(updateError);
  return true;
}

export async function addWorkspace(userId, workspaceName) {
  const user = await findUserById(userId);

  if (!user) throw new Error("User not found.");

  const workspaces = user.workspaces || [];

  const newWorkspace = {
    id: `ws_${crypto.randomBytes(6).toString("hex")}`,
    name: workspaceName.trim(),
    isDefault: false
  };

  workspaces.push(newWorkspace);

  const { data, error } = await supabase
    .from("app_users")
    .update({
      workspaces,
      current_workspace_id: newWorkspace.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select("*")
    .single();

  checkError(error);
  return toSafeUser(data);
}

export async function switchWorkspace(userId, workspaceId) {
  const user = await findUserById(userId);

  if (!user) throw new Error("User not found.");

  const target = (user.workspaces || []).find(
    (workspace) => workspace.id === workspaceId
  );

  if (!target) {
    throw new Error("Workspace not found in your account.");
  }

  const { data, error } = await supabase
    .from("app_users")
    .update({
      current_workspace_id: workspaceId,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select("*")
    .single();

  checkError(error);
  return toSafeUser(data);
}
