const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Events
    async getEvents(filters = {}) {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.event_type) params.append('event_type', filters.event_type);
        if (filters.provider_id) params.append('provider_id', filters.provider_id);
        const queryString = params.toString();
        const endpoint = queryString ? `/events?${queryString}` : '/events';

        return this.request(endpoint);
    }

    async getEvent(id) {
        return this.request(`/events/${id}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE',
        });
    }

    // Zoom
    async createZoomMeeting(meetingData) {
        return this.request('/zoom/create', {
            method: 'POST',
            body: JSON.stringify(meetingData),
        });
    }

    async deleteZoomMeeting(meetingId) {
        return this.request(`/zoom/delete/${meetingId}`, {
            method: 'DELETE',
        });
    }

    async getZoomStatus() {
        return this.request('/zoom/status');
    }

    // Analytics
    async getAnalytics(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.days) queryParams.append('days', params.days);
        if (params.provider_id) queryParams.append('provider_id', params.provider_id);
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/analytics?${queryString}` : '/analytics';

        return this.request(endpoint);
    }
    

    async getDistribution(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const queryString = params.toString();
        const endpoint = queryString ? `/analytics/distribution?${queryString}` : '/analytics/distribution';

        return this.request(endpoint);
    }

    async getDailyBreakdown(days = 7) {
        return this.request(`/analytics/daily?days=${days}`);
    }

    async getInsights() {
        return this.request('/analytics/insights');
    }
}

export default new ApiService();