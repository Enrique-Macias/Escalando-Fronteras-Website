/**
 * Base API Client for EF CMS Integration
 * Handles all API communication with the CMS backend
 */

class APIClient {
    constructor() {
        // Get API URL from environment variables or use fallback
        this.baseURL = this.getAPIBaseURL();
        this.timeout = 10000; // 10 seconds timeout
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Get API base URL from environment variables
     * @returns {string} - API base URL
     */
    getAPIBaseURL() {
        // Check if environment variables are available
        if (typeof window !== 'undefined' && window.EF_ENV_VARS) {
            const envURL = window.EF_ENV_VARS.EF_CMS_API_URL;
            if (envURL) {
                console.log('🌐 Using API URL from environment:', envURL);
                return envURL;
            }
        }

        // Fallback to Railway URL
        const fallbackURL = 'https://ef-cms-production.up.railway.app/api';
        console.log('🌐 Using fallback API URL:', fallbackURL);
        return fallbackURL;
    }

    /**
     * Make HTTP request with error handling and timeout
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error - please check your connection');
            }
            
            throw error;
        }
    }

    /**
     * GET request helper
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Response data
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    /**
     * Build query parameters for pagination and filtering
     * @param {Object} options - Query options
     * @returns {Object} - Formatted query parameters
     */
    buildQueryParams(options = {}) {
        const params = {};
        
        // Pagination
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        
        // Search
        if (options.search) params.search = options.search;
        
        // Filtering
        if (options.category) params.category = options.category;
        if (options.author) params.author = options.author;
        if (options.dateFilter) params.dateFilter = options.dateFilter;
        
        // Language preference
        if (options.lang) params.lang = options.lang;
        
        return params;
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Export for use in other modules
window.APIClient = APIClient;
window.apiClient = apiClient;
