/**
 * Search Integration Script
 * Handles search functionality for events
 */

class SearchIntegration {
    constructor() {
        this.searchForm = null;
        this.searchInput = null;
        this.allEvents = [];
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        // Listen for API services to be ready first
        document.addEventListener('apiServicesReady', () => {
            console.log('🔍 API services ready, initializing search...');
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            this.loadAllEvents();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadAllEvents();
            });
        });

        // Wait for news integration to create the form, then set up search
        this.waitForSearchForm();
    }

    waitForSearchForm(attempts = 0) {
        const maxAttempts = 20;
        
        this.searchForm = document.querySelector('.search-form');
        this.searchInput = document.getElementById('search');
        
        console.log(`🔍 Attempt ${attempts + 1}: Search form found:`, !!this.searchForm);
        console.log(`🔍 Attempt ${attempts + 1}: Search input found:`, !!this.searchInput);
        
        if (this.searchForm && this.searchInput) {
            this.setupSearchListeners();
            console.log('✅ Search integration initialized successfully');
        } else if (attempts < maxAttempts) {
            console.log(`⚠️ Search form not ready, retrying in 500ms... (${attempts + 1}/${maxAttempts})`);
            setTimeout(() => this.waitForSearchForm(attempts + 1), 500);
        } else {
            console.log('❌ Search form not found after maximum attempts');
        }
    }

    setupSearchListeners() {
        console.log('🔍 Setting up search listeners...');
        
        // Remove form action and method to prevent navigation
        this.searchForm.removeAttribute('action');
        this.searchForm.removeAttribute('method');
        
        // Prevent form submission and handle search
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔍 Form submitted, performing search...');
            this.performSearch();
            return false;
        });

        // Prevent button click from submitting form
        const submitButton = this.searchForm.querySelector('button[type="submit"]');
        if (submitButton) {
            // Change button type to prevent form submission
            submitButton.type = 'button';
            
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🔍 Search button clicked, performing search...');
                this.performSearch();
                return false;
            });
        }

        // Real-time search as user types
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('🔍 Input changed:', query);
            if (query.length >= 2) {
                this.performSearch();
            } else if (query.length === 0) {
                this.resetSearch();
            }
        });

        // Handle Enter key specifically
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Enter key pressed, performing search...');
                this.performSearch();
                return false;
            } else if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        
        console.log('✅ Search listeners set up successfully');
    }

    async loadAllEvents() {
        try {
            console.log('🔍 Loading all events for search...');
            
            const events = await EFAPI.events.getEvents({
                limit: 50, // Load more events for comprehensive search
                lang: this.currentLanguage,
                published: true
            });
            
            if (Array.isArray(events)) {
                this.allEvents = events;
            } else if (events && events.events) {
                this.allEvents = events.events;
            } else if (events && events.data) {
                this.allEvents = events.data;
            } else {
                this.allEvents = [];
            }
            
            console.log('✅ Loaded events for search:', this.allEvents.length);
            
        } catch (error) {
            console.error('❌ Error loading events for search:', error);
            this.allEvents = [];
        }
    }

    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (!query || query.length < 2) {
            this.resetSearch();
            return;
        }

        console.log('🔍 Searching for:', query);

        // Filter events based on search query
        const filteredEvents = this.allEvents.filter(event => {
            const title = this.currentLanguage === 'en' ? 
                (event.title_en || event.title_es || '').toLowerCase() : 
                (event.title_es || '').toLowerCase();
            
            const description = this.currentLanguage === 'en' ? 
                (event.body_en || event.body_es || '').toLowerCase() : 
                (event.body_es || '').toLowerCase();
            
            const location = `${event.location_city || ''} ${event.location_country || ''}`.toLowerCase();
            const category = (event.category || '').toLowerCase();
            const tags = (event.tags || []).join(' ').toLowerCase();

            return title.includes(query) ||
                   description.includes(query) ||
                   location.includes(query) ||
                   category.includes(query) ||
                   tags.includes(query);
        });

        console.log('✅ Found events:', filteredEvents.length);

        // Display filtered results
        this.displaySearchResults(filteredEvents, query);
    }

    displaySearchResults(events, query) {
        const recentEventsContainer = document.getElementById('recent-events-container');
        
        if (!recentEventsContainer) {
            console.log('⚠️ Recent events container not found');
            return;
        }

        if (events.length === 0) {
            recentEventsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="alert alert-info alert-sm" role="alert">
                        <h6>No se encontraron eventos</h6>
                        <p class="small mb-0">No hay eventos que coincidan con "${query}"</p>
                    </div>
                </div>
            `;
            return;
        }

        // Use the same display method as events integration
        let eventsHTML = '';
        
        // Show only first 5 search results to avoid overwhelming the sidebar
        const displayEvents = events.slice(0, 5);
        
        displayEvents.forEach((event, index) => {
            const title = this.currentLanguage === 'en' ? event.title_en || event.title_es : event.title_es;
            const location = event.location_city && event.location_country 
                ? `${event.location_city}, ${event.location_country}` 
                : (event.location_city || event.location_country || 'Ubicación');
            const imageUrl = event.coverImageUrl || (event.images && event.images[0]) || 'images/eventos/ejemplo_evento.jpg';
            const eventDate = new Date(event.date);
            const formattedDate = this.formatDate(eventDate);
            
            const marginClass = index > 0 ? 'mt-4' : '';
            
            eventsHTML += `
                <div class="news-block news-block-two-col d-flex ${marginClass}">
                    <div class="news-block-two-col-image-wrap">
                        <a href="#" onclick="return false;">
                            <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" loading="lazy" onerror="this.src='images/eventos/ejemplo_evento.jpg'">
                        </a>
                    </div>

                    <div class="news-block-two-col-info">
                        <div class="news-block-title mb-2">
                            <h6><a href="#" class="news-block-title-link" onclick="return false;">${title}</a></h6>
                        </div>

                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${formattedDate}
                            </p>
                        </div>
                        
                        ${location ? `
                            <div class="news-block-location">
                                <p class="small text-muted">
                                    <i class="bi-geo-alt custom-icon me-1"></i>
                                    ${location}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        // Add search results header
        const resultsHeader = events.length > 5 ? 
            `<p class="small text-muted mb-3">Mostrando ${displayEvents.length} de ${events.length} resultados para "${query}"</p>` :
            `<p class="small text-muted mb-3">${events.length} resultado${events.length !== 1 ? 's' : ''} para "${query}"</p>`;

        recentEventsContainer.innerHTML = resultsHeader + eventsHTML;

        // Add clear search button
        this.addClearSearchButton();
    }

    addClearSearchButton() {
        const recentEventsContainer = document.getElementById('recent-events-container');
        if (recentEventsContainer) {
            const clearButton = `
                <div class="text-center mt-3">
                    <button class="btn btn-sm btn-outline-secondary" onclick="searchIntegration.clearSearch()">
                        <i class="bi-x-circle me-1"></i>Limpiar búsqueda
                    </button>
                </div>
            `;
            recentEventsContainer.innerHTML += clearButton;
        }
    }

    resetSearch() {
        // Reload the original recent events
        if (window.eventsIntegration) {
            window.eventsIntegration.loadRecentEvents();
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.resetSearch();
        this.searchInput.focus();
    }

    formatDate(date) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${month} ${day}, ${year}`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.searchIntegration = new SearchIntegration();
});

// Export for use in other scripts
window.SearchIntegration = SearchIntegration;
