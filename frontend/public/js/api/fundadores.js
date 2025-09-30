/**
 * Fundadores API Service
 * Handles all fundadores-related API calls
 */

class FundadoresAPI {
    constructor(apiClient) {
        this.client = apiClient;
        this.endpoint = '/fundadores';
    }

    /**
     * Get all fundadores
     * @returns {Promise<Array>} Array of fundadores
     */
    async getAllFundadores() {
        try {
            // Fetching all fundadores
            const response = await this.client.get(this.endpoint);
            
            if (response && Array.isArray(response)) {
                // Found fundadores
                return response;
            } else {
                console.warn('⚠️ Unexpected response format for fundadores');
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching fundadores:', error);
            throw error;
        }
    }

    /**
     * Get active fundadores (all fundadores are considered active)
     * @returns {Promise<Array>} Array of active fundadores
     */
    async getActiveFundadores() {
        return this.getAllFundadores();
    }

    /**
     * Get fundador by ID
     * @param {string} id - Fundador ID
     * @returns {Promise<Object|null>} Fundador object or null
     */
    async getFundadorById(id) {
        try {
            // Fetching fundador with ID
            const fundadores = await this.getAllFundadores();
            const fundador = fundadores.find(f => f.id === id);
            
            if (fundador) {
                // Found fundador
                return fundador;
            } else {
                console.warn(`⚠️ Fundador with ID ${id} not found`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error fetching fundador ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get fundadores by role
     * @param {string} role - Role to filter by
     * @returns {Promise<Array>} Array of fundadores with the specified role
     */
    async getFundadoresByRole(role) {
        try {
            // Fetching fundadores with role
            const fundadores = await this.getAllFundadores();
            const filtered = fundadores.filter(f => 
                f.role_es === role || f.role_en === role
            );
            
            // Found fundadores with role
            return filtered;
        } catch (error) {
            console.error(`❌ Error fetching fundadores by role ${role}:`, error);
            throw error;
        }
    }

    /**
     * Get co-founders specifically
     * @returns {Promise<Array>} Array of co-founders
     */
    async getCoFounders() {
        return this.getFundadoresByRole('Co-Founder of Escalando Fronteras');
    }

    /**
     * Get fundadores with social media links
     * @returns {Promise<Array>} Array of fundadores with social media
     */
    async getFundadoresWithSocial() {
        try {
            // Fetching fundadores with social media
            const fundadores = await this.getAllFundadores();
            const withSocial = fundadores.filter(f => 
                f.facebookUrl || f.instagramUrl
            );
            
            // Found fundadores with social media
            return withSocial;
        } catch (error) {
            console.error('❌ Error fetching fundadores with social media:', error);
            throw error;
        }
    }
}

// Export for use in other modules
window.fundadoresAPI = new FundadoresAPI(window.apiClient);
