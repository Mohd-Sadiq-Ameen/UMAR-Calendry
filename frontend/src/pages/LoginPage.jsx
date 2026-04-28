import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Logo from '../components/Logo';


export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    confirmPassword: "",
    role: "customer", // or 'provider'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

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
      if (!formData.full_name) {
        newErrors.full_name = "Full name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerMessage("");

    const url = isLogin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/register";

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userRole", data.user?.role || (isLogin ? "customer" : formData.role));
        localStorage.setItem("providerId", data.user?.provider_id || "");

        // Redirect after success message
        setTimeout(() => {
          const role = data.user?.role || formData.role;
          if (role === "provider") {
            navigate("/calendar/dashboard");
          } else {
            navigate("/calendar");
          }
        }, 1500);
      } else {
        setServerMessage(data.message || (isLogin ? "Login failed" : "Registration failed"));
        setShowSuccess(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setServerMessage("Network error. Is the backend running?");
      setIsLoading(false);
    } finally {
      if (!showSuccess) setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {!showSuccess ? (
            <>
              <div className="login-header">
                <Logo size={48} />
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

              {serverMessage && <div className="error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{serverMessage}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                  <>
                    <div className={`form-group ${errors.full_name ? "error" : ""}`}>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          name="full_name"
                          id="full_name"
                          placeholder=" "
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="full_name">Full Name</label>
                      </div>
                      {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                    </div>
                    <div className="form-group">
                      <label>I am a:</label>
                      <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="customer">Customer (book services)</option>
                        <option value="provider">Service Provider (offer services)</option>
                      </select>
                    </div>
                  </>
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
                    <a href="#" className="forgot-password">Forgot password?</a>
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
                      setServerMessage("");
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