import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Calendar from "./components/Calendar";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import Charts from "./components/Charts";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Explore from "./pages/Explore";
import api from "./services/api";
import ProviderDashboard from "./pages/ProviderDashboard";
import "./App.css";

function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    event_type: "",
  });
  const [analytics, setAnalytics] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAnalytics();
  }, []);

  const fetchEvents = async (newFilters = filters) => {
    try {
      setLoading(true);
      const response = await api.getEvents(newFilters);
      setEvents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.getAnalytics({ days: 30 });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.deleteEvent(eventId);
      await fetchEvents();
      await fetchAnalytics();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleEventSuccess = async () => {
    await fetchEvents();
    await fetchAnalytics();
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const handleDateClick = (date) => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchEvents(updatedFilters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "analytics" && !analytics) {
      fetchAnalytics();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-container">
          <Link to="/" className="logo" style={{ textDecoration: "none" }}>
            <span className="logo-icon">📅</span>
            {!sidebarCollapsed && <span className="logo-text">Calendry</span>}
          </Link>
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/calendar/dashboard"
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleTabChange("dashboard")}
          >
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>
          <Link
            to="/calendar"
            className={`nav-item ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => handleTabChange("calendar")}
          >
            <span className="nav-icon">📆</span>
            {!sidebarCollapsed && <span>Calendar</span>}
          </Link>
          <Link
            to="/calendar/events"
            className={`nav-item ${activeTab === "events" ? "active" : ""}`}
            onClick={() => handleTabChange("events")}
          >
            <span className="nav-icon">📋</span>
            {!sidebarCollapsed && <span>Events</span>}
          </Link>
          <Link
            to="/calendar/analytics"
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => handleTabChange("analytics")}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span>Analytics</span>}
          </Link>
        </nav>

        <button className="create-event-btn" onClick={handleCreateEvent}>
          <span>+</span>
          {!sidebarCollapsed && <span>Create Event</span>}
        </button>

        <button
          className="logout-btn"
          onClick={handleLogout}
          style={{
            margin: "20px",
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            marginTop: "auto",
          }}
        >
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "calendar" && "Calendar"}
              {activeTab === "events" && "All Events"}
              {activeTab === "analytics" && "Analytics Dashboard"}
            </h1>
          </div>
          <div className="header-right">
            {activeTab === "events" && (
              <div className="filters">
                <select
                  className="filter-select"
                  value={filters.event_type}
                  onChange={(e) =>
                    handleFilterChange({ event_type: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  <option value="meeting">Meetings</option>
                  <option value="task">Tasks</option>
                </select>
              </div>
            )}
            <div className="user-avatar">
              <span>👤</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === "dashboard" && <ProviderDashboard />}
          {activeTab === "calendar" &&
            (loading && events.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your schedule...</p>
              </div>
            ) : (
              <Calendar
                events={events}
                onEventClick={handleEditEvent}
                onDateClick={handleDateClick}
              />
            ))}
          {activeTab === "events" && (
            <EventList
              events={events}
              onEventClick={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
          {activeTab === "analytics" && <Charts analytics={analytics} />}
        </div>
      </main>

      {showEventForm && (
        <EventForm
          event={selectedEvent}
          onClose={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleEventSuccess}
        />
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/explore" element={<Explore />} />
        {/* Register route removed – providers register via dashboard? Keep if needed but avoid confusion */}
        <Route
          path="/calendar/*"
          element={
            <ProtectedRoute>
              <CalendarApp />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;