/**
 * Fundador Integration
 * Handles dynamic loading of fundadores from the CMS API
 */

class FundadorIntegration {
    constructor() {
        this.fundadorContainer = null;
        this.currentLanguage = 'es';
        this.fundadores = [];
    }

    init() {
        // Get current language from language switcher or localStorage
        this.getCurrentLanguage();
        
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.fundadorContainer = document.querySelector('.about-section .container .row');
            if (this.fundadorContainer) {
                this.loadFundadores();
            }
        });

        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.loadFundadores();
        });
    }
    
    getCurrentLanguage() {
        // Try to get language from language switcher instance
        if (window.languageSwitcher && window.languageSwitcher.currentLanguage) {
            this.currentLanguage = window.languageSwitcher.currentLanguage;
        } else {
            // Fallback to localStorage
            const storedLang = localStorage.getItem('userLanguagePreference');
            if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
                this.currentLanguage = storedLang;
            } else {
                // Default to Spanish
                this.currentLanguage = 'es';
            }
        }
        console.log('🌍 Fundador integration initialized with language:', this.currentLanguage);
    }
    
    // Method to update language and refresh content
    updateLanguage(newLanguage) {
        if (this.currentLanguage !== newLanguage) {
            this.currentLanguage = newLanguage;
            console.log('🔄 Fundador language updated to:', newLanguage);
            this.loadFundadores();
        }
    }

    async loadFundadores() {
        if (!this.fundadorContainer) return;

        try {
            // Show loading state
            this.showLoading();

            console.log('🔄 Loading fundadores...');
            console.log('🌐 API Base URL:', EFAPI.client.baseURL);
            console.log('🌍 Current Language:', this.currentLanguage);

            // Fetch fundadores from API
            const fundadores = await EFAPI.fundadores.getActiveFundadores();
            
            console.log('✅ Fundadores loaded:', fundadores);
            
            // Store fundadores for display
            this.fundadores = fundadores;
            
            // Display fundadores
            this.displayFundadores(fundadores);

        } catch (error) {
            console.error('❌ Error loading fundadores:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.fundadorContainer) {
            // Clear existing content
            this.fundadorContainer.innerHTML = '';
            
            // Add loading content
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'col-12 text-center';
            loadingDiv.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Cargando información del fundador...</p>
            `;
            this.fundadorContainer.appendChild(loadingDiv);
        }
    }

    showError(error) {
        if (!this.fundadorContainer) return;

        let errorMessage = 'Error al cargar la información del fundador';
        
        if (error.message.includes('Network error')) {
            errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Por favor, intenta de nuevo.';
        } else if (error.message.includes('HTTP 404')) {
            errorMessage = 'No se encontró la información del fundador.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }

        // Clear existing content
        this.fundadorContainer.innerHTML = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'col-12 text-center';
        errorDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${errorMessage}
            </div>
            <button class="btn btn-outline-primary btn-sm" onclick="window.fundadorIntegration.loadFundadores()">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Reintentar
            </button>
        `;
        this.fundadorContainer.appendChild(errorDiv);
    }

    displayFundadores(fundadores) {
        if (!this.fundadorContainer || !Array.isArray(fundadores)) {
            console.warn('No fundador container or invalid fundadores data');
            return;
        }

        if (fundadores.length === 0) {
            // Hide the entire section when there's no data
            const section = document.querySelector('.about-section');
            if (section) {
                section.style.display = 'none';
                console.log('✅ Fundador section hidden - no data available');
            }
            return;
        }

        // Show the section if it was previously hidden
        const section = document.querySelector('.about-section');
        if (section) {
            section.style.display = 'block';
        }

        // Clear existing content
        this.fundadorContainer.innerHTML = '';

        // Sort fundadores to prioritize co-founders first
        const sortedFundadores = this.sortFundadores(fundadores);
        
        // Display all fundadores with alternating layout
        sortedFundadores.forEach((fundador, index) => {
            this.displayFundador(fundador, index);
        });

        console.log(`✅ Displayed ${sortedFundadores.length} fundadores with alternating layout`);
    }

    sortFundadores(fundadores) {
        // Sort fundadores to prioritize co-founders first, then others
        return fundadores.sort((a, b) => {
            const aIsCoFounder = this.isCoFounder(a);
            const bIsCoFounder = this.isCoFounder(b);
            
            // Co-founders first
            if (aIsCoFounder && !bIsCoFounder) return -1;
            if (!aIsCoFounder && bIsCoFounder) return 1;
            
            // If both are co-founders, prioritize Alejandro Medina
            if (aIsCoFounder && bIsCoFounder) {
                const aIsAlejandro = a.name.toLowerCase().includes('alejandro') && a.name.toLowerCase().includes('medina');
                const bIsAlejandro = b.name.toLowerCase().includes('alejandro') && b.name.toLowerCase().includes('medina');
                
                if (aIsAlejandro && !bIsAlejandro) return -1;
                if (!aIsAlejandro && bIsAlejandro) return 1;
            }
            
            // Otherwise, maintain original order
            return 0;
        });
    }

    isCoFounder(fundador) {
        return (fundador.role_es && fundador.role_es.toLowerCase().includes('co-fundador')) ||
               (fundador.role_en && fundador.role_en.toLowerCase().includes('co-founder'));
    }

    displayFundador(fundador, index) {
        console.log(`🎯 Displaying fundador ${index + 1}:`, fundador.name);

        // Determine layout based on index (alternating pattern)
        const isEvenIndex = index % 2 === 0;
        
        // Create wrapper row for this fundador
        const fundadorRow = document.createElement('div');
        fundadorRow.className = 'row mb-5';
        if (index > 0) {
            fundadorRow.style.marginTop = '4rem'; // Add spacing between fundadores
        }

        // Create image column
        const imageCol = document.createElement('div');
        imageCol.className = 'col-lg-6 col-md-5 col-12 mb-4 mb-lg-0';
        
        const image = document.createElement('img');
        image.src = fundador.imageUrl;
        image.className = 'about-image bg-light shadow-lg img-fluid';
        image.alt = fundador.name;
        image.onerror = () => {
            // Fallback to default image if API image fails
            image.src = 'images/alejandro_medina.jpeg';
        };
        
        // Apply alternating alignment
        if (isEvenIndex) {
            image.className += ' ms-lg-auto'; // Right align on even indices
        } else {
            image.className += ' me-lg-auto'; // Left align on odd indices
        }
        
        imageCol.appendChild(image);

        // Create text content column
        const textCol = document.createElement('div');
        textCol.className = 'col-lg-5 col-md-7 col-12';
        
        const textBlock = document.createElement('div');
        textBlock.className = 'custom-text-block';

        // Name
        const name = document.createElement('h2');
        name.className = 'mb-0 text-center text-lg-start';
        name.textContent = fundador.name;
        textBlock.appendChild(name);

        // Role/Title
        const role = document.createElement('p');
        role.className = 'text-muted mb-lg-4 mb-md-4 text-center text-lg-start';
        role.textContent = this.currentLanguage === 'es' ? fundador.role_es : fundador.role_en;
        textBlock.appendChild(role);

        // Description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'text-center text-lg-start';
        
        const description = this.currentLanguage === 'es' ? fundador.body_es : fundador.body_en;
        const paragraphs = description.split('\n\n').filter(p => p.trim());
        
        paragraphs.forEach((paragraph, pIndex) => {
            const p = document.createElement('p');
            p.className = pIndex === paragraphs.length - 1 ? 'mb-4' : 'mb-3';
            p.textContent = paragraph.trim();
            descriptionDiv.appendChild(p);
        });
        
        textBlock.appendChild(descriptionDiv);

        // Social Media Icons (if available)
        if (fundador.facebookUrl || fundador.instagramUrl) {
            const socialDiv = document.createElement('div');
            socialDiv.className = 'text-center text-lg-start';
            
            const socialList = document.createElement('ul');
            socialList.className = 'social-icon mt-4 d-inline-block';
            
            if (fundador.facebookUrl) {
                const facebookItem = document.createElement('li');
                facebookItem.className = 'social-icon-item';
                
                const facebookLink = document.createElement('a');
                facebookLink.href = fundador.facebookUrl;
                facebookLink.className = 'social-icon-link bi-facebook';
                facebookLink.target = '_blank';
                facebookLink.rel = 'noopener noreferrer';
                
                facebookItem.appendChild(facebookLink);
                socialList.appendChild(facebookItem);
            }
            
            if (fundador.instagramUrl) {
                const instagramItem = document.createElement('li');
                instagramItem.className = 'social-icon-item';
                
                const instagramLink = document.createElement('a');
                instagramLink.href = fundador.instagramUrl;
                instagramLink.className = 'social-icon-link bi-instagram';
                instagramLink.target = '_blank';
                instagramLink.rel = 'noopener noreferrer';
                
                instagramItem.appendChild(instagramLink);
                socialList.appendChild(instagramItem);
            }
            
            socialDiv.appendChild(socialList);
            textBlock.appendChild(socialDiv);
        }

        textCol.appendChild(textBlock);

        // Append columns to row based on alternating layout
        if (isEvenIndex) {
            // Even index: Image first, then text (original layout)
            fundadorRow.appendChild(imageCol);
            fundadorRow.appendChild(textCol);
        } else {
            // Odd index: Text first, then image (reversed layout)
            fundadorRow.appendChild(textCol);
            fundadorRow.appendChild(imageCol);
        }

        // Append row to container
        this.fundadorContainer.appendChild(fundadorRow);

        console.log(`✅ Fundador ${index + 1} displayed successfully with ${isEvenIndex ? 'image-text' : 'text-image'} layout`);
    }

    /**
     * Force refresh fundadores data
     */
    forceRefresh() {
        console.log('🔄 Force refreshing fundadores...');
        this.loadFundadores();
    }
}

// Create global instance
window.fundadorIntegration = new FundadorIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fundadorIntegration.init();
    });
} else {
    window.fundadorIntegration.init();
}
