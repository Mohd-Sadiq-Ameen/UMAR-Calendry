import { format, parseISO } from 'date-fns';
import { useState } from 'react';

export default function EventList({ events, onEventClick, onDeleteEvent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const formatDateTime = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  };

  const handleDelete = (e, eventId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDeleteEvent(eventId);
    }
  };

  const openZoomLink = (e, zoomLink) => {
    e.stopPropagation();
    window.open(zoomLink, '_blank');
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <h3>No events yet</h3>
        <p>Create your first event to get started</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
        </div>
      </div>

      <div className={`event-list ${viewMode}`}>
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className={`event-card ${event.event_type} ${viewMode}`}
            onClick={() => onEventClick(event)}
          >
            <div className="event-card-header">
              <div className={`event-type-badge ${event.event_type}`}>
                {event.event_type === 'meeting' ? '🎥 Meeting' : '✓ Task'}
              </div>
              <button
                className="delete-btn"
                onClick={(e) => handleDelete(e, event.id)}
                title="Delete event"
              >
                🗑️
              </button>
            </div>
            
            <div className="event-card-content">
              <h3 className="event-title">{event.title}</h3>
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
              <div className="event-meta">
                <span className="event-time">
                  🕐 {formatDateTime(event.start_time)}
                </span>
                {event.zoom_link && (
                  <button
                    className="zoom-link-btn"
                    onClick={(e) => openZoomLink(e, event.zoom_link)}
                    title="Join Zoom meeting"
                  >
                    🎥 Join Meeting
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}