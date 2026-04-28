import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderDashboard.css";
import Logo from '../components/Logo';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showZoomForm, setShowZoomForm] = useState(false);
  const [zoomMeeting, setZoomMeeting] = useState({
    topic: "",
    start_time: "",
    duration: 60,
  });
  const [zoomLink, setZoomLink] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service_type: "",
    service_name: "",
    price: "",
    description: "",
    duration: "60",
    city: "",
  });

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    loadProvider();
  }, []);

  // Load provider and auto‑create if missing
  const loadProvider = async () => {
    setLoading(true);
    let existingProvider = await fetchProviderFromApi();
    if (!existingProvider) {
      // No provider found – create one automatically
      await createProviderIfMissing();
      existingProvider = await fetchProviderFromApi(); // fetch again
    }
    if (existingProvider) {
      setProvider(existingProvider);
      setFormData({
        name: existingProvider.name,
        email: existingProvider.email,
        service_type: existingProvider.service_type,
        service_name: existingProvider.service_name,
        price: existingProvider.price,
        description: existingProvider.description || "",
        duration: existingProvider.duration || "60",
        city: existingProvider.city || "",
      });
    }
    await fetchEvents();
    setLoading(false);
  };

  const fetchProviderFromApi = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/providers");
      const data = await response.json();
      if (data.success) {
        const found = data.data.find((p) => p.email === userEmail);
        return found || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch provider:", error);
      return null;
    }
  };

  const createProviderIfMissing = async () => {
    const defaultProvider = {
      user_id: userEmail.split("@")[0],
      name: userEmail.split("@")[0], // fallback name
      email: userEmail,
      service_type: "teacher",
      service_name: "Consultation",
      price: 500,
      description: "Professional service",
      duration: 60,
      city: "Mumbai",
    };

    try {
      const response = await fetch("http://localhost:5000/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultProvider),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Provider created automatically");
        return true;
      } else {
        console.error("Auto-create failed:", data.message);
        return false;
      }
    } catch (err) {
      console.error("Auto-create error:", err);
      return false;
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      if (data.success) setEvents(data.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!provider) {
      alert("No provider record found. Please refresh the page.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/providers/${provider.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Profile updated successfully!");
        // Refresh provider data
        const updated = await fetchProviderFromApi();
        if (updated) setProvider(updated);
      } else {
        alert("Update failed: " + data.message);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile");
    }
  };

  const handleCreateZoomMeeting = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/zoom/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: zoomMeeting.topic,
          start_time: new Date(zoomMeeting.start_time).toISOString(),
          duration: zoomMeeting.duration,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setZoomLink(data.data.zoom_link);
        alert(`Zoom meeting created! Link: ${data.data.zoom_link}`);
        setShowZoomForm(false);
        fetchEvents();
      } else {
        alert("Failed to create Zoom meeting: " + data.message);
      }
    } catch (error) {
      console.error("Zoom meeting creation failed:", error);
      alert("Failed to create Zoom meeting");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleZoomChange = (e) => {
    setZoomMeeting({ ...zoomMeeting, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* Stats grid */}
      <div className="dashboard-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📦</div>
          <div>
            <div className="stat-value">1</div>
            <div className="stat-label">Total Services</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">🎥</div>
          <div>
            <div className="stat-value">
              {events.filter((e) => e.event_type === "meeting").length}
            </div>
            <div className="stat-label">Total Meetings</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">
              {
                events.filter((e) => e.event_type === "meeting" && e.zoom_link)
                  .length
              }
            </div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">4.9</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span>📋</span> Profile & Services
        </button>
        <button
          className={`tab ${activeTab === "zoom" ? "active" : ""}`}
          onClick={() => setActiveTab("zoom")}
        >
          <span>🎥</span> Zoom Meetings
        </button>
        <button
          className={`tab ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          <span>
           
          </span>{" "}
          Appointments
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="profile-tab">
          <div className="preview-card-dash">
            <h3>Live Preview</h3>
            <p>How customers see your service</p>
            <div className="preview-content">
              <div className="preview-icon-large">
                {formData.service_type === "teacher"
                  ? "👨‍🏫"
                  : formData.service_type === "doctor"
                    ? "👨‍⚕️"
                    : "💼"}
              </div>
              <div>
                <h4>{formData.service_name || "Your Service"}</h4>
                <p className="preview-by">by {formData.name || "Your Name"}</p>
                <p className="preview-desc">
                  {formData.description ||
                    "Service description will appear here"}
                </p>
                <div className="preview-price">
                  ₹{formData.price || "0"} / session
                </div>
                <div className="preview-duration">
                  ⏱️ {formData.duration || "60"} minutes
                </div>
                {formData.city && (
                  <div className="preview-city">📍 {formData.city}</div>
                )}
              </div>
            </div>
          </div>

          <div className="edit-form">
            <h3>Edit Your Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Service Type *</label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="teacher">Teacher / Tutor</option>
                  <option value="doctor">Doctor / Clinic</option>
                  <option value="salon">Salon / Spa</option>
                  <option value="gym">Gym / Fitness</option>
                  <option value="consultant">Consultant / CA</option>
                </select>
              </div>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your service..."
                />
              </div>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Zoom Meetings Tab */}
      {activeTab === "zoom" && (
        <div className="zoom-tab">
          <button
            className="create-zoom-btn"
            onClick={() => setShowZoomForm(!showZoomForm)}
          >
            + Create New Zoom Meeting
          </button>
          {showZoomForm && (
            <div className="zoom-form-card">
              <h3>Schedule a Zoom Meeting</h3>
              <form onSubmit={handleCreateZoomMeeting}>
                <div className="form-group">
                  <label>Meeting Topic *</label>
                  <input
                    type="text"
                    name="topic"
                    value={zoomMeeting.topic}
                    onChange={handleZoomChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={zoomMeeting.start_time}
                    onChange={handleZoomChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={zoomMeeting.duration}
                    onChange={handleZoomChange}
                  />
                </div>
                <button type="submit" className="submit-zoom-btn">
                  Create Meeting →
                </button>
              </form>
            </div>
          )}
          {zoomLink && (
            <div className="zoom-success-card">
              <div className="success-icon">✓</div>
              <h4>Zoom Meeting Created!</h4>
              <p>Share this link:</p>
              <a href={zoomLink} target="_blank" rel="noopener noreferrer">
                {zoomLink}
              </a>
              <button onClick={() => navigator.clipboard.writeText(zoomLink)}>
                Copy Link
              </button>
            </div>
          )}
          <div className="meetings-list">
            <h3>Recent Zoom Meetings</h3>
            {events
              .filter((e) => e.event_type === "meeting")
              .map((event) => (
                <div key={event.id} className="meeting-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{new Date(event.start_time).toLocaleString()}</p>
                  </div>
                  {event.zoom_link && (
                    <a
                      href={event.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              ))}
            {events.filter((e) => e.event_type === "meeting").length === 0 && (
              <p className="no-items">No meetings created yet</p>
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="appointments-tab">
          <h3>Upcoming Appointments</h3>
          {events
            .filter(
              (e) =>
                e.event_type === "meeting" &&
                new Date(e.start_time) > new Date(),
            )
            .map((event) => (
              <div key={event.id} className="appointment-item">
                <div>
                  <strong>{event.title}</strong>
                  <div className="appointment-datetime">
                    📅 {new Date(event.start_time).toLocaleDateString()} ⏰{" "}
                    {new Date(event.start_time).toLocaleTimeString()}
                  </div>
                </div>
                {event.zoom_link && (
                  <a
                    href={event.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="join-link"
                  >
                    🎥 Join Meeting
                  </a>
                )}
              </div>
            ))}
          {events.filter(
            (e) =>
              e.event_type === "meeting" && new Date(e.start_time) > new Date(),
          ).length === 0 && (
            <div className="empty-appointments">
              <div className="empty-icon">📅</div>
              <p>No upcoming appointments</p>
              <p className="empty-hint">
                Create a Zoom meeting to get started!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
