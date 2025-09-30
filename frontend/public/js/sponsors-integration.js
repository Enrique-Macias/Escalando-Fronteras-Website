/**
 * Sponsors Integration
 * Handles dynamic loading of sponsors from the CMS API
 */

class SponsorsIntegration {
    constructor() {
        this.sponsorsContainer = null;
        this.currentLanguage = 'es';
    }

    init() {
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.sponsorsContainer = document.querySelector('#sponsors .row-sponsors');
            if (this.sponsorsContainer) {
                this.loadSponsors();
            }
        });

        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.loadSponsors();
        });
    }

    async loadSponsors() {
        if (!this.sponsorsContainer) return;

        try {
            // Show loading state
            this.showLoading();

            // Loading sponsors

            // Fetch sponsors from API
            const sponsors = await EFAPI.sponsors.getAllSponsors();
            
            // Sponsors loaded
            
            // Display sponsors
            this.displaySponsors(sponsors);

        } catch (error) {
            console.error('❌ Error loading sponsors:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.sponsorsContainer) {
            this.sponsorsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Cargando patrocinadores...</p>
                </div>
            `;
        }
    }

    showError(error) {
        if (!this.sponsorsContainer) return;

        let errorMessage = 'Error al cargar los patrocinadores';
        
        if (error.message.includes('Network error')) {
            errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Por favor, intenta de nuevo.';
        } else if (error.message.includes('HTTP 404')) {
            errorMessage = 'No se encontraron patrocinadores.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }

        this.sponsorsContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Error:</strong> ${errorMessage}
                </div>
                <button class="btn btn-outline-primary btn-sm" onclick="window.sponsorsIntegration.loadSponsors()">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    displaySponsors(sponsors) {
        if (!this.sponsorsContainer || !Array.isArray(sponsors)) {
            console.warn('No sponsors container or invalid sponsors data');
            return;
        }

        if (sponsors.length === 0) {
            this.sponsorsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay patrocinadores disponibles en este momento.
                    </div>
                </div>
            `;
            return;
        }

        // Clear container
        this.sponsorsContainer.innerHTML = '';

        // Create sponsor elements based on the original structure
        sponsors.forEach((sponsor, index) => {
            const sponsorElement = this.createSponsorElement(sponsor, index);
            this.sponsorsContainer.appendChild(sponsorElement);
        });
    }

    createSponsorElement(sponsor, index) {
        const div = document.createElement('div');
        
        // Determine sponsor class based on index (matching original structure)
        let sponsorClass = 'sponsor1'; // Default for first sponsor (EF)
        
        if (index === 1) sponsorClass = 'sponsor2';
        else if (index === 2) sponsorClass = 'sponsor2';
        else if (index === 3) sponsorClass = 'sponsor3';
        else if (index === 4) sponsorClass = 'sponsor4';
        
        div.className = sponsorClass;

        // Create image element
        const img = document.createElement('img');
        img.src = sponsor.imageUrl;
        img.alt = sponsor.name;
        img.loading = 'lazy';

        // Handle image loading errors
        img.onerror = () => {
            console.warn(`Failed to load image for sponsor: ${sponsor.name}`);
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==';
        };

        // If sponsor has a link, wrap image in anchor tag
        if (sponsor.linkUrl) {
            const link = document.createElement('a');
            link.href = sponsor.linkUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.appendChild(img);
            div.appendChild(link);
        } else {
            div.appendChild(img);
        }

        return div;
    }

    /**
     * Force refresh sponsors data
     */
    forceRefresh() {
        // Force refreshing sponsors
        this.loadSponsors();
    }
}

// Create global instance
window.sponsorsIntegration = new SponsorsIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sponsorsIntegration.init();
    });
} else {
    window.sponsorsIntegration.init();
}
