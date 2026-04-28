import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Full name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIfProvider = async (email) => {
    try {
      const response = await fetch("http://localhost:5000/api/providers");
      const data = await response.json();
      if (data.success) {
        return data.data.some((p) => p.email === email);
      }
      return false;
    } catch (error) {
      console.error("Failed to check provider status:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      setTimeout(async () => {
        setIsLoading(false);
        setShowSuccess(true);

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", formData.email);

        const isProvider = await checkIfProvider(formData.email);

        setTimeout(() => {
          navigate(isProvider ? "/dashboard" : "/calendar");
        }, 1500);
      }, 1500);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {!showSuccess ? (
            <>
              <div className="login-header">
                <div className="brand-icon">📅</div>
                <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p>{isLogin ? "Sign in to your account" : "Get started with Calendry"}</p>
              </div>

              <div className="login-toggle">
                <button className={`toggle-btn ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
                  Sign In
                </button>
                <button className={`toggle-btn ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                  <div className={`form-group ${errors.name ? "error" : ""}`}>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder=" "
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="name">Full Name</label>
                    </div>
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                )}

                <div className={`form-group ${errors.email ? "error" : ""}`}>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder=" "
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="email">Email Address</label>
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className={`form-group ${errors.password ? "error" : ""}`}>
                  <div className="input-wrapper password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder=" "
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="password-toggle"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className={`eye-icon ${showPassword ? "show" : ""}`}></span>
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                {!isLogin && (
                  <div className={`form-group ${errors.confirmPassword ? "error" : ""}`}>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder=" "
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                )}

                {isLogin && (
                  <div className="form-options">
                    <label className="remember-wrapper">
                      <input type="checkbox" name="remember" />
                      <span className="checkbox-label">
                        <span className=""></span>
                        Remember me
                      </span>
                    </label>
                    <a href="#" className="forgot-password">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button type="submit" className={`login-btn ${isLoading ? "loading" : ""}`}>
                  <span className="btn-text">{isLogin ? "Sign In" : "Create Account"}</span>
                  <span className="btn-loader"></span>
                </button>
              </form>

              <div className="signup-link">
                <p>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </a>
                </p>
              </div>
            </>
          ) : (
            <div className="success-message show">
              <div className="success-icon">✓</div>
              <h3>{isLogin ? "Login Successful!" : "Account Created!"}</h3>
              <p>Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}