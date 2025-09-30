/**
 * Events Integration Script
 * Fetches and displays recent events data from EF CMS API
 */

class EventsIntegration {
    constructor() {
        this.recentEventsContainer = null;
        this.loadingElement = null;
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        // Events integration init() called
        document.addEventListener('apiServicesReady', () => {
            // Events integration: API services ready
            this.recentEventsContainer = document.getElementById('recent-events-container');
            // Events container found
            this.loadingElement = this.recentEventsContainer ? this.recentEventsContainer.querySelector('.spinner-border') : null;
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            // Load recent events
            // Starting to load recent events
            this.loadRecentEvents();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadRecentEvents();
            });
        });
    }

    async loadRecentEvents() {
        // loadRecentEvents called
        
        // Try to find the container if we don't have it yet
        if (!this.recentEventsContainer) {
            this.recentEventsContainer = document.getElementById('recent-events-container');
            // Trying to find events container again
        }
        
        if (!this.recentEventsContainer) {
            // Events container still not found, will try again later
            return;
        }

        try {
            this.showLoading();
            // Loading recent events

            const events = await EFAPI.events.getEvents({
                limit: 2, // Get only the latest 2 events
                lang: this.currentLanguage,
                published: true
            });
            
            // Events API response
            
            let eventsList = [];
            if (Array.isArray(events)) {
                eventsList = events;
            } else if (events && events.events) {
                eventsList = events.events; // API returns { events: [...] }
            } else if (events && events.data) {
                eventsList = events.data; // Fallback for other API formats
            } else {
                eventsList = [];
            }
            
            // Recent events loaded
            
            this.displayRecentEvents(eventsList);

        } catch (error) {
            console.error('❌ Error loading recent events:', error);
            this.showError(error);
        }
    }

    // Method to force refresh events (useful for language changes)
    forceRefresh() {
        // Force refreshing events
        
        // Clear any existing timeout or loading state
        this.recentEventsContainer = document.getElementById('recent-events-container');
        
        if (!this.recentEventsContainer) {
            // Events container not found during force refresh
            return;
        }
        
        // Force reload with a clean state
        this.loadRecentEvents();
    }

    // Method to reset and reload events (even more aggressive)
    resetAndReload() {
        // Reset and reload events
        
        this.recentEventsContainer = document.getElementById('recent-events-container');
        
        if (this.recentEventsContainer) {
            // Clear container first
            this.recentEventsContainer.innerHTML = '';
            
            // Then reload
            setTimeout(() => {
                this.loadRecentEvents();
            }, 100);
        }
    }

    showLoading() {
        if (this.recentEventsContainer) {
            const loadingText = this.currentLanguage === 'en' ? 'Loading events...' : 'Cargando eventos...';
            
            this.recentEventsContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">${loadingText}</span>
                    </div>
                    <p class="mt-2 small">${loadingText}</p>
                </div>
            `;
        }
    }

    displayRecentEvents(eventsList) {
        if (!eventsList || eventsList.length === 0) {
            this.showEmptyState();
            return;
        }

        let eventsHTML = '';
        
        eventsList.forEach((event, index) => {
            const title = this.currentLanguage === 'en' ? event.title_en || event.title_es : event.title_es;
            const location = event.location_city && event.location_country 
                ? `${event.location_city}, ${event.location_country}` 
                : (event.location_city || event.location_country || (this.currentLanguage === 'en' ? 'Location' : 'Ubicación'));
            const imageUrl = event.coverImageUrl || (event.images && event.images[0]) || 'images/eventos/ejemplo_evento.jpg';
            const eventDate = new Date(event.date);
            const formattedDate = this.formatDate(eventDate);
            
            // Add margin-top for subsequent events
            const marginClass = index > 0 ? 'mt-4' : '';
            
            eventsHTML += `
                <div class="news-block news-block-two-col d-flex ${marginClass}" style="cursor: pointer;" onclick="window.eventsIntegration.navigateToEvent('${event.id}')">
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

        this.recentEventsContainer.innerHTML = eventsHTML;
    }

    formatDate(date) {
        if (this.currentLanguage === 'en') {
            // English date format: "Month Day, Year"
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            
            return `${month} ${day}, ${year}`;
        } else {
            // Spanish date format: "Month Day, Year" (capitalized)
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

    showError(error) {
        if (this.recentEventsContainer) {
            const errorTitle = this.currentLanguage === 'en' ? 'Error loading events' : 'Error al cargar eventos';
            const errorMessage = error.message || (this.currentLanguage === 'en' ? 'Network error - please check your connection' : 'Error de red - por favor verifica tu conexión');
            const retryText = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';
            
            this.recentEventsContainer.innerHTML = `
                <div class="error-state network-error">
                    <div class="error-icon">
                        <i class="bi-wifi-off"></i>
                    </div>
                    <h6>${errorTitle}</h6>
                    <p class="small">${errorMessage}</p>
                    <button class="btn-retry-sm" onclick="eventsIntegration.loadRecentEvents()">
                        ${retryText}
                    </button>
                </div>
            `;
        }
    }

    showEmptyState() {
        if (this.recentEventsContainer) {
            this.recentEventsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="alert alert-info alert-sm" role="alert">
                        <h6 class="alert-heading">${EFAPI.language.getUIText('no_events_available')}</h6>
                        <p class="small">${EFAPI.language.getUIText('please_try_later')}</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Navigate to eventos.html with specific event selected
     * @param {string} eventId - The ID of the event to display
     */
    navigateToEvent(eventId) {
        // Navigating to event
        
        // Store the selected event ID in sessionStorage for the eventos page to use
        sessionStorage.setItem('selectedEventId', eventId);
        
        // Also store the current language preference
        sessionStorage.setItem('selectedLanguage', this.currentLanguage);
        
        // Navigate to eventos.html
        window.location.href = 'eventos.html';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initializing Events Integration
    window.eventsIntegration = new EventsIntegration();
    // Events Integration initialized
});

// Export for use in other scripts
window.EventsIntegration = EventsIntegration;
