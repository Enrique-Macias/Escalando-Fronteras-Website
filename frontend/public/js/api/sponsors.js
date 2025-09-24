/**
 * Sponsors API Service
 * Handles all sponsors-related API calls
 */

class SponsorsAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get all sponsors
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Sponsors list
     */
    async getSponsors(options = {}) {
        const params = this.client.buildQueryParams({
            ...options
        });

        return this.client.get('/sponsors', params);
    }

    /**
     * Get single sponsor by ID
     * @param {string} id - Sponsor ID
     * @returns {Promise<Object>} - Sponsor data
     */
    async getSponsorById(id) {
        if (!id) {
            throw new Error('Sponsor ID is required');
        }
        return this.client.get(`/sponsors/${id}`);
    }

    /**
     * Get all sponsors (no pagination)
     * @returns {Promise<Array>} - All sponsors
     */
    async getAllSponsors() {
        const response = await this.getSponsors();
        
        // Handle both paginated response format and direct array format
        if (Array.isArray(response)) {
            return response;
        } else if (response && response.data) {
            return response.data;
        } else {
            return [];
        }
    }

    /**
     * Get featured sponsors (first 5 sponsors)
     * @returns {Promise<Array>} - Featured sponsors
     */
    async getFeaturedSponsors() {
        const response = await this.getSponsors();
        
        // Handle both paginated response format and direct array format
        let sponsors = [];
        if (Array.isArray(response)) {
            sponsors = response;
        } else if (response && response.data) {
            sponsors = response.data;
        }

        return sponsors.slice(0, 5); // Take first 5 sponsors
    }
}

// Create instance and export
const sponsorsAPI = new SponsorsAPI(apiClient);
window.sponsorsAPI = sponsorsAPI;
