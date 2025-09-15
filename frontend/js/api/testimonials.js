/**
 * Testimonials API Service
 * Handles all testimonials-related API calls
 */

class TestimonialsAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of testimonials
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Testimonials list with pagination
     */
    async getTestimonials(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 10,
            ...options
        });

        return this.client.get('/testimonials', params);
    }

    /**
     * Get single testimonial by ID
     * @param {string} id - Testimonial ID
     * @returns {Promise<Object>} - Testimonial data
     */
    async getTestimonialById(id) {
        if (!id) {
            throw new Error('Testimonial ID is required');
        }
        return this.client.get(`/testimonials/${id}`);
    }

    /**
     * Get testimonials statistics
     * @returns {Promise<Object>} - Testimonials statistics
     */
    async getTestimonialsStats() {
        return this.client.get('/testimonials/stats');
    }

    /**
     * Get featured testimonials (first 3 testimonials)
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Featured testimonials
     */
    async getFeaturedTestimonials(lang = 'es') {
        const response = await this.getTestimonials({
            limit: 3,
            lang: lang
        });
        return response.data || [];
    }

    /**
     * Get all published testimonials
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - All published testimonials
     */
    async getAllTestimonials(lang = 'es') {
        const response = await this.getTestimonials({
            limit: 100, // Get all testimonials
            lang: lang
        });
        return response.data || [];
    }

    /**
     * Search testimonials
     * @param {string} query - Search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results with pagination
     */
    async searchTestimonials(query, options = {}) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        return this.getTestimonials({
            search: query.trim(),
            ...options
        });
    }

    /**
     * Get testimonials by author
     * @param {string} author - Author name
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Testimonials by author with pagination
     */
    async getTestimonialsByAuthor(author, options = {}) {
        if (!author) {
            throw new Error('Author is required');
        }

        return this.getTestimonials({
            author: author,
            ...options
        });
    }

    /**
     * Get random testimonials
     * @param {number} count - Number of random testimonials to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Random testimonials
     */
    async getRandomTestimonials(count = 3, lang = 'es') {
        const response = await this.getTestimonials({
            limit: 50, // Get more to have better randomization
            lang: lang
        });

        const testimonials = response.data || [];
        
        // Shuffle array and return requested count
        const shuffled = testimonials.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// Create instance and export
const testimonialsAPI = new TestimonialsAPI(apiClient);
window.testimonialsAPI = testimonialsAPI;
