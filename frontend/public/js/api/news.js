/**
 * News API Service
 * Handles all news-related API calls
 */

class NewsAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of news articles
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - News list with pagination
     */
    async getNews(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 10,
            ...options
        });

        return this.client.get('/news', params);
    }

    /**
     * Get single news article by ID
     * @param {string} id - News article ID
     * @returns {Promise<Object>} - News article data
     */
    async getNewsById(id) {
        if (!id) {
            throw new Error('News ID is required');
        }
        return this.client.get(`/news/${id}`);
    }

    /**
     * Get news statistics
     * @returns {Promise<Object>} - News statistics
     */
    async getNewsStats() {
        return this.client.get('/news/stats');
    }

    /**
     * Get featured/latest news (first 3 articles)
     * @param {string} lang - Language preference ('es' or 'en')
     * @returns {Promise<Array>} - Featured news articles
     */
    async getFeaturedNews(lang = 'es') {
        const response = await this.getNews({
            limit: 3,
            lang: lang
        });
        return response.data || [];
    }

    /**
     * Search news articles
     * @param {string} query - Search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results with pagination
     */
    async searchNews(query, options = {}) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        return this.getNews({
            search: query.trim(),
            ...options
        });
    }

    /**
     * Get news by category
     * @param {string} category - Category name
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - News by category with pagination
     */
    async getNewsByCategory(category, options = {}) {
        if (!category) {
            throw new Error('Category is required');
        }

        return this.getNews({
            category: category,
            ...options
        });
    }

    /**
     * Get recent news (last 30 days)
     * @param {number} limit - Number of articles to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Recent news articles
     */
    async getRecentNews(limit = 5, lang = 'es') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const response = await this.getNews({
            limit: limit,
            dateFilter: thirtyDaysAgo.toISOString(),
            lang: lang
        });

        return response.data || [];
    }
}

// Create instance and export
const newsAPI = new NewsAPI(apiClient);
window.newsAPI = newsAPI;
