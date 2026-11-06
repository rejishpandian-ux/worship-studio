import React, { useState } from "react";
import {
  Sparkles,
  X,
  Mail,
  Lock,
  User,
  Church,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export function AuthModal({ isOpen, onClose, initialView = "signin", showToast }) {
  if (!isOpen) return null;

  const { signIn, signUp, forgotPassword, resetPassword, authConfig } = useAuth();
  const [view, setView] = useState(initialView); // 'signin' | 'signup' | 'forgot' | 'reset'

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [churchName, setChurchName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [resetToken, setResetToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quick fill for demo account
  const handleFillDemo = () => {
    setEmail("pastor@peaceag.org");
    setPassword("Worship2026!");
    setErrorMsg("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await signIn(email, password, rememberMe);
      if (showToast) showToast("Welcome back to Worship Studio!");
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password, confirmPassword, churchName });
      if (showToast) showToast("Account created successfully!");
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccessMsg(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setView("reset");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process forgot password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      if (showToast) showToast("Password reset successfully! Please sign in.");
      setView("signin");
      setPassword("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-scrim" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-head">
          <div className="brand" style={{ margin: 0 }}>
            <div className="brand-mark" style={{ width: "32px", height: "32px" }}>
              <Sparkles size={18} />
            </div>
            <div>
              <b style={{ fontSize: "14px" }}>Worship Studio</b>
              <small style={{ fontSize: "8px" }}>PEACEAG PRESENTATION</small>
            </div>
          </div>
          <button className="icon-btn mini" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* View Titles */}
        <div style={{ marginTop: "16px", marginBottom: "20px" }}>
          {view === "signin" && (
            <>
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">
                Sign in to your worship team account to sync presentations and access cloud backups.
              </p>
            </>
          )}
          {view === "signup" && (
            <>
              <h2 className="auth-title">Create Team Account</h2>
              <p className="auth-subtitle">
                Set up a dedicated workspace for your church worship team and sermon presentations.
              </p>
            </>
          )}
          {view === "forgot" && (
            <>
              <h2 className="auth-title">Reset your password</h2>
              <p className="auth-subtitle">
                Enter your account email to receive reset instructions or generate a recovery token.
              </p>
            </>
          )}
          {view === "reset" && (
            <>
              <h2 className="auth-title">Enter new password</h2>
              <p className="auth-subtitle">
                Create a secure password with at least 6 characters.
              </p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {view === "signin" && (
          <form onSubmit={handleSignIn} className="auth-form">
            <label className="auth-field-label">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pastor@peaceag.org"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="auth-field-label">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Password</span>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setView("forgot");
                    setErrorMsg("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--soft)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "var(--gold)" }}
                />
                Remember me on this device
              </label>

              <button
                type="button"
                className="text-btn"
                style={{ fontSize: "11px", color: "var(--gold)" }}
                onClick={handleFillDemo}
              >
                Use Demo Login
              </button>
            </div>

            <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="ai-spin" /> Signing In...
                </>
              ) : (
                "Sign In to Worship Studio"
              )}
            </button>

            {/* Google OAuth Alternative */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="outline-btn auth-google-btn"
              onClick={() => {
                if (!authConfig.googleConfigured) {
                  setErrorMsg("Google Sign-In requires GOOGLE_CLIENT_ID in .env. Email & password authentication is fully active!");
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="auth-switch-text">
              Don't have a team account yet?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setView("signup");
                  setErrorMsg("");
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {view === "signup" && (
          <form onSubmit={handleSignUp} className="auth-form">
            <label className="auth-field-label">
              <span>Full Name</span>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pastor David"
                />
              </div>
            </label>

            <label className="auth-field-label">
              <span>Church or Ministry Name</span>
              <div className="auth-input-wrap">
                <Church size={15} className="auth-input-icon" />
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="e.g. Peace AG Church"
                />
              </div>
            </label>

            <label className="auth-field-label">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worship@yourchurch.org"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="auth-field-label">
              <span>Password (min. 6 characters)</span>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <label className="auth-field-label">
              <span>Confirm Password</span>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <p style={{ fontSize: "11px", color: "var(--muted)", margin: "8px 0 16px", lineHeight: "1.5" }}>
              By creating an account, you acknowledge Worship Studio's commitment to reverent church presentation tools.
            </p>

            <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="ai-spin" /> Creating Account...
                </>
              ) : (
                "Create Worship Account"
              )}
            </button>

            <div className="auth-switch-text">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setView("signin");
                  setErrorMsg("");
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <label className="auth-field-label">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your account email..."
                />
              </div>
            </label>

            <button type="submit" className="primary-btn auth-submit-btn" disabled={loading} style={{ marginTop: "12px" }}>
              {loading ? <Loader2 size={16} className="ai-spin" /> : "Request Password Reset"}
            </button>

            <div className="auth-switch-text">
              Remembered your password?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setView("signin");
                  setErrorMsg("");
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {view === "reset" && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <label className="auth-field-label">
              <span>Reset Token</span>
              <div className="auth-input-wrap">
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token here"
                />
              </div>
            </label>

            <label className="auth-field-label">
              <span>New Password (min. 6 characters)</span>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </label>

            <button type="submit" className="primary-btn auth-submit-btn" disabled={loading} style={{ marginTop: "12px" }}>
              {loading ? <Loader2 size={16} className="ai-spin" /> : "Update Password"}
            </button>

            <div className="auth-switch-text">
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setView("signin");
                  setErrorMsg("");
                }}
              >
                Return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

