import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";
import Logo from '../components/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: "📅", title: "Smart Calendar", desc: "Drag-and-drop scheduling, real-time availability" },
    { icon: "🔔", title: "Auto Reminders", desc: "WhatsApp & email reminders reduce no-shows by 70%" },
    { icon: "📊", title: "Analytics", desc: "Track bookings, revenue, and peak hours" },
    { icon: "💳", title: "Secure Payments", desc: "UPI, cards, netbanking – all major methods" },
    { icon: "🌐", title: "Custom Branding", desc: "Your own booking page with your logo" },
    { icon: "🔐", title: "Data Security", desc: "Enterprise-grade encryption, GDPR compliant" },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Bookings/Month" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9", label: "User Rating" },
  ];

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <Logo size={28} />
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/explore" className="nav-link-btn">Explore</Link>
          </div>
          <button className="nav-cta" onClick={() => navigate("/login")}>
            Login →
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Streamline Your
              <span className="gradient-text"> Schedule</span>
            </h1>
            <p className="hero-subtitle">
              The professional's choice for appointment management. Smart calendar, automated reminders,
              and powerful analytics all in one place.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-hero" onClick={() => navigate("/login")}>
                Get Started Free <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary-hero">Watch Demo</button>
            </div>
            <div className="hero-stats">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-card-hero">
                  <div className="stat-value-hero">{stat.value}</div>
                  <div className="stat-label-hero">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-dots"><span></span><span></span><span></span></div>
                <div className="preview-title">Calendar View</div>
              </div>
              <div className="preview-calendar">
                <div className="preview-weekdays">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="preview-dates">
                  {[...Array(31).keys()].map(day => (
                    <div key={day+1} className={`preview-date ${day+1 === 15 ? "active" : ""}`}>{day+1}</div>
                  ))}
                </div>
                <div className="preview-event">
                  <div className="event-dot"></div>
                  <div className="event-text">Meeting with team · 2:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Calendry</span>
            <h2>Everything you need to manage appointments seamlessly</h2>
            <p>Built for professionals who value their time</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="howitworks-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2>Get started in minutes</h2>
            <p>No complex setup. No credit card required.</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-icon">📝</div>
              <h3>Create Account</h3>
              <p>Sign up with your email and set up your profile</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-icon">⚙️</div>
              <h3>Configure Settings</h3>
              <p>Set your availability, services, and payment options</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-icon">🔗</div>
              <h3>Share Your Link</h3>
              <p>Share your personalized booking page with clients</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">04</div>
              <div className="step-icon">🎉</div>
              <h3>Start Booking</h3>
              <p>Receive bookings and automatic reminders</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to transform your scheduling?</h2>
          <p>Join thousands of professionals who trust Calendry for their appointment management.</p>
          <button className="cta-button" onClick={() => navigate("/login")}>
            Get Started Free <span className="cta-arrow">→</span>
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo"><span>📅</span><span>Calendry</span></div>
              <p>Smart appointment management for modern professionals</p>
            </div>
            <div className="footer-links">
              <div className="link-group"><h4>Product</h4><a href="#features">Features</a><a href="#">Pricing</a><a href="#">Integrations</a></div>
              <div className="link-group"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a></div>
              <div className="link-group"><h4>Support</h4><a href="#">Help Center</a><a href="#">Contact</a><a href="#">Privacy</a></div>
            </div>
          </div>
          <div className="footer-bottom"><p>&copy; 2024 Calendry. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}