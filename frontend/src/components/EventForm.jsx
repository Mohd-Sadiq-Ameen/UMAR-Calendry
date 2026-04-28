import { useState, useEffect } from 'react';
import api from '../services/api';

export default function EventForm({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'task',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createZoomLink, setCreateZoomLink] = useState(false);
  const [zoomStatus, setZoomStatus] = useState(null);

  useEffect(() => {
    // Check Zoom status
    api.getZoomStatus().then(response => {
      setZoomStatus(response.data);
    }).catch(err => {
      console.error('Failed to check Zoom status:', err);
    });

    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        start_time: event.start_time,
        end_time: event.end_time,
      });
    } else {
      // Set default times (now and +1 hour)
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        start_time: formatDateTimeLocal(now),
        end_time: formatDateTimeLocal(later),
      }));
    }
  }, [event]);

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert to ISO format
      const eventData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      let response;
      
      if (event) {
        // Update existing event
        response = await api.updateEvent(event.id, eventData);
      } else {
        // Create new event
        if (createZoomLink && formData.event_type === 'meeting') {
          // Create Zoom meeting first
          const duration = Math.round(
            (new Date(eventData.end_time) - new Date(eventData.start_time)) / (1000 * 60)
          );

          const zoomResponse = await api.createZoomMeeting({
            topic: eventData.title,
            start_time: eventData.start_time,
            duration: duration,
          });

          eventData.zoom_link = zoomResponse.data.zoom_link;
          eventData.zoom_meeting_id = zoomResponse.data.zoom_meeting_id;
        }

        response = await api.createEvent(eventData);
      }

      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this event"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
              >
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {!event && formData.event_type === 'meeting' && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={createZoomLink}
                  onChange={(e) => setCreateZoomLink(e.target.checked)}
                />
                <span>Generate Zoom meeting link</span>
              </label>
              {zoomStatus && !zoomStatus.configured && (
                <small className="zoom-warning">
                  ⚠️ Zoom not configured - will create mock link
                </small>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}