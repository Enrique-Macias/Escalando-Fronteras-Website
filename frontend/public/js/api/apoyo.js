/**
 * Apoyo API Service
 * Handles all apoyo-related API calls (GoFundMe widgets)
 */

class ApoyoAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of apoyo items
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Apoyo list with pagination
     */
    async getApoyo(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 20,
            ...options
        });

        return this.client.get('/apoyo', params);
    }

    /**
     * Get single apoyo item by ID
     * @param {string} id - Apoyo item ID
     * @returns {Promise<Object>} - Apoyo item data
     */
    async getApoyoById(id) {
        if (!id) {
            throw new Error('Apoyo item ID is required');
        }
        return this.client.get(`/apoyo/${id}`);
    }

    /**
     * Get all active apoyo items (no pagination)
     * @returns {Promise<Array>} - All active apoyo items
     */
    async getAllApoyo() {
        const response = await this.getApoyo();
        
        // Handle both paginated response format and direct array format
        let apoyoItems = [];
        if (response && response.apoyo) {
            apoyoItems = response.apoyo;
        } else if (Array.isArray(response)) {
            apoyoItems = response;
        } else if (response && response.data) {
            apoyoItems = response.data;
        } else {
            apoyoItems = [];
        }

        // Filter only active items
        return apoyoItems.filter(item => item.isActive === true);
    }

    /**
     * Get active apoyo items for display
     * @returns {Promise<Array>} - Active apoyo items
     */
    async getActiveApoyo() {
        const allApoyo = await this.getAllApoyo();
        return allApoyo.filter(item => item.isActive === true);
    }
}

// Create instance and export
const apoyoAPI = new ApoyoAPI(apiClient);
window.apoyoAPI = apoyoAPI;
