/**
 * Events API Service
 * Handles all events-related API calls
 */

class EventsAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of events
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Events list with pagination
     */
    async getEvents(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 10,
            ...options
        });

        return this.client.get('/events', params);
    }

    /**
     * Get single event by ID
     * @param {string} id - Event ID
     * @returns {Promise<Object>} - Event data
     */
    async getEventById(id) {
        if (!id) {
            throw new Error('Event ID is required');
        }
        return this.client.get(`/events/${id}`);
    }

    /**
     * Get events statistics
     * @returns {Promise<Object>} - Events statistics
     */
    async getEventsStats() {
        return this.client.get('/events/stats');
    }

    /**
     * Get upcoming events
     * @param {number} limit - Number of events to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Upcoming events
     */
    async getUpcomingEvents(limit = 5, lang = 'es') {
        const now = new Date();
        const response = await this.getEvents({
            limit: limit,
            dateFilter: now.toISOString(),
            lang: lang
        });

        // Filter events that are in the future
        const upcomingEvents = (response.data || []).filter(event => {
            const eventDate = new Date(event.date);
            return eventDate > now;
        });

        return upcomingEvents;
    }

    /**
     * Get past events
     * @param {number} limit - Number of events to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Past events
     */
    async getPastEvents(limit = 10, lang = 'es') {
        const now = new Date();
        const response = await this.getEvents({
            limit: limit,
            lang: lang
        });

        // Filter events that are in the past
        const pastEvents = (response.data || []).filter(event => {
            const eventDate = new Date(event.date);
            return eventDate < now;
        });

        return pastEvents;
    }

    /**
     * Get events by category
     * @param {string} category - Category name
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Events by category with pagination
     */
    async getEventsByCategory(category, options = {}) {
        if (!category) {
            throw new Error('Category is required');
        }

        return this.getEvents({
            category: category,
            ...options
        });
    }

    /**
     * Search events
     * @param {string} query - Search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results with pagination
     */
    async searchEvents(query, options = {}) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        return this.getEvents({
            search: query.trim(),
            ...options
        });
    }

    /**
     * Get events by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} - Events in date range
     */
    async getEventsByDateRange(startDate, endDate, options = {}) {
        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }

        const response = await this.getEvents({
            dateFilter: startDate.toISOString(),
            ...options
        });

        // Filter events within the date range
        const filteredEvents = (response.data || []).filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate <= endDate;
        });

        return filteredEvents;
    }
}

// Create instance and export
const eventsAPI = new EventsAPI(apiClient);
window.eventsAPI = eventsAPI;
