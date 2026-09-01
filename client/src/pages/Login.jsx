import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove old error while user is correcting input
    if (error) {
      setError("");
    }
  }

  function validateForm() {
    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      return "Email is required";
    }

    if (!password) {
      return "Password is required";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(formData.email.trim().toLowerCase(), formData.password);

      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape auth-shape-one"></div>
        <div className="auth-shape auth-shape-two"></div>
      </div>

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">P</div>

          <div>
            <strong>ProjectFlow</strong>
            <span>Project Management</span>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>

          <h1>Sign in to your account</h1>

          <p>
            Manage projects, tasks, teams, and conversations from one place.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-form-group">
            <label htmlFor="email">Email address</label>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉</span>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <div className="auth-label-row">
              <label htmlFor="password">Password</label>

              <button
                type="button"
                className="forgot-password-button"
                onClick={() => setError("Password reset is not available yet.")}
              >
                Forgot password?
              </button>
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-button-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Register */}
        <div className="auth-switch">
          <span>Don't have an account?</span>

          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
