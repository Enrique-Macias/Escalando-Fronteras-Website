/**
 * Articles API Service
 * Handles all articles-related API calls
 */

class ArticlesAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of articles
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Articles list with pagination
     */
    async getArticles(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 10,
            ...options
        });

        return this.client.get('/articles', params);
    }

    /**
     * Get single article by ID
     * @param {string} id - Article ID
     * @returns {Promise<Object>} - Article data
     */
    async getArticleById(id) {
        if (!id) {
            throw new Error('Article ID is required');
        }
        return this.client.get(`/articles/${id}`);
    }

    /**
     * Get articles statistics
     * @returns {Promise<Object>} - Articles statistics
     */
    async getArticlesStats() {
        return this.client.get('/articles/stats');
    }

    /**
     * Get featured articles (first 3 articles)
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Featured articles
     */
    async getFeaturedArticles(lang = 'es') {
        const response = await this.getArticles({
            limit: 3,
            lang: lang
        });
        return response.data || [];
    }

    /**
     * Get recent articles (last 30 days)
     * @param {number} limit - Number of articles to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Recent articles
     */
    async getRecentArticles(limit = 5, lang = 'es') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const response = await this.getArticles({
            limit: limit,
            dateFilter: thirtyDaysAgo.toISOString(),
            lang: lang
        });

        return response.data || [];
    }

    /**
     * Search articles
     * @param {string} query - Search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results with pagination
     */
    async searchArticles(query, options = {}) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        return this.getArticles({
            search: query.trim(),
            ...options
        });
    }

    /**
     * Get articles by category
     * @param {string} category - Category name
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Articles by category with pagination
     */
    async getArticlesByCategory(category, options = {}) {
        if (!category) {
            throw new Error('Category is required');
        }

        return this.getArticles({
            category: category,
            ...options
        });
    }

    /**
     * Get articles by author
     * @param {string} author - Author name
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} - Articles by author
     */
    async getArticlesByAuthor(author, options = {}) {
        if (!author) {
            throw new Error('Author is required');
        }

        const response = await this.getArticles({
            search: author,
            ...options
        });

        // Filter by exact author match
        const filteredArticles = (response.data || []).filter(article => {
            const articleAuthor = options.lang === 'en' ? article.author_en : article.author;
            return articleAuthor && articleAuthor.toLowerCase().includes(author.toLowerCase());
        });

        return filteredArticles;
    }

    /**
     * Get popular articles (most recent with high engagement)
     * @param {number} limit - Number of articles to return
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Popular articles
     */
    async getPopularArticles(limit = 5, lang = 'es') {
        const response = await this.getArticles({
            limit: limit,
            lang: lang
        });

        // Sort by creation date (most recent first)
        const sortedArticles = (response.data || []).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return sortedArticles;
    }
}

// Create instance and export
const articlesAPI = new ArticlesAPI(apiClient);
window.articlesAPI = articlesAPI;
