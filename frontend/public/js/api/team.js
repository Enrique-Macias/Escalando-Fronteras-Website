/**
 * Team API Service
 * Handles all team-related API calls
 */

class TeamAPI {
    constructor(apiClient) {
        this.client = apiClient;
    }

    /**
     * Get paginated list of team members
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Team list with pagination
     */
    async getTeam(options = {}) {
        const params = this.client.buildQueryParams({
            page: 1,
            limit: 20,
            ...options
        });

        return this.client.get('/team', params);
    }

    /**
     * Get single team member by ID
     * @param {string} id - Team member ID
     * @returns {Promise<Object>} - Team member data
     */
    async getTeamMemberById(id) {
        if (!id) {
            throw new Error('Team member ID is required');
        }
        return this.client.get(`/team/${id}`);
    }

    /**
     * Get team statistics
     * @returns {Promise<Object>} - Team statistics
     */
    async getTeamStats() {
        return this.client.get('/team/stats');
    }

    /**
     * Get all team members (no pagination)
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - All team members
     */
    async getAllTeamMembers(lang = 'es') {
        const response = await this.getTeam({
            limit: 100, // Get all team members
            lang: lang
        });
        
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
     * Search team members
     * @param {string} query - Search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results with pagination
     */
    async searchTeam(query, options = {}) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        return this.getTeam({
            search: query.trim(),
            ...options
        });
    }

    /**
     * Get team members by role
     * @param {string} role - Role name
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} - Team members with specific role
     */
    async getTeamByRole(role, options = {}) {
        if (!role) {
            throw new Error('Role is required');
        }

        const response = await this.getTeam({
            search: role,
            ...options
        });

        // Handle both paginated response format and direct array format
        let teamMembers = [];
        if (Array.isArray(response)) {
            teamMembers = response;
        } else if (response && response.data) {
            teamMembers = response.data;
        }

        // Filter by exact role match
        const filteredMembers = teamMembers.filter(member => {
            const memberRole = options.lang === 'en' ? member.role_en : member.role;
            return memberRole && memberRole.toLowerCase().includes(role.toLowerCase());
        });

        return filteredMembers;
    }

    /**
     * Get featured team members (first 6 members)
     * @param {string} lang - Language preference
     * @returns {Promise<Array>} - Featured team members
     */
    async getFeaturedTeam(lang = 'es') {
        const response = await this.getTeam({
            limit: 6,
            lang: lang
        });
        
        // Handle both paginated response format and direct array format
        if (Array.isArray(response)) {
            return response.slice(0, 6); // Take first 6 members
        } else if (response && response.data) {
            return response.data;
        } else {
            return [];
        }
    }
}

// Create instance and export
const teamAPI = new TeamAPI(apiClient);
window.teamAPI = teamAPI;
