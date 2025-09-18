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
        console.log('🎪 Events integration init() called');
        document.addEventListener('apiServicesReady', () => {
            console.log('🎪 Events integration: API services ready');
            this.recentEventsContainer = document.getElementById('recent-events-container');
            console.log('🎪 Events container found:', this.recentEventsContainer);
            this.loadingElement = this.recentEventsContainer ? this.recentEventsContainer.querySelector('.spinner-border') : null;
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            // Load recent events
            console.log('🎪 Starting to load recent events...');
            this.loadRecentEvents();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadRecentEvents();
            });
        });
    }

    async loadRecentEvents() {
        // Try to find the container if we don't have it yet
        if (!this.recentEventsContainer) {
            this.recentEventsContainer = document.getElementById('recent-events-container');
            console.log('🎪 Trying to find events container again:', this.recentEventsContainer);
        }
        
        if (!this.recentEventsContainer) {
            console.log('⚠️ Events container still not found, will try again later');
            return;
        }

        try {
            this.showLoading();
            console.log('🔄 Loading recent events...');
            console.log('🌐 API Base URL:', EFAPI.client.baseURL);
            console.log('🌍 Current Language:', this.currentLanguage);

            const events = await EFAPI.events.getEvents({
                limit: 2, // Get only the latest 2 events
                lang: this.currentLanguage,
                published: true
            });
            
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
            
            console.log('✅ Recent events loaded:', eventsList);
            
            this.displayRecentEvents(eventsList);

        } catch (error) {
            console.error('❌ Error loading recent events:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.recentEventsContainer) {
            this.recentEventsContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">${EFAPI.language.getUIText('Cargando eventos...')}</span>
                    </div>
                    <p class="mt-2 small">${EFAPI.language.getUIText('Cargando eventos...')}</p>
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
                : (event.location_city || event.location_country || 'Ubicación');
            const imageUrl = event.coverImageUrl || (event.images && event.images[0]) || 'images/eventos/ejemplo_evento.jpg';
            const eventDate = new Date(event.date);
            const formattedDate = this.formatDate(eventDate);
            
            // Add margin-top for subsequent events
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

        this.recentEventsContainer.innerHTML = eventsHTML;
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

    showError(error) {
        if (this.recentEventsContainer) {
            this.recentEventsContainer.innerHTML = `
                <div class="error-state">
                    <div class="alert alert-warning alert-sm" role="alert">
                        <h6 class="alert-heading">${EFAPI.language.getUIText('error_loading')}</h6>
                        <p class="small">${error.message || 'Error desconocido'}</p>
                        <button class="btn btn-sm btn-primary" onclick="eventsIntegration.loadRecentEvents()">
                            ${EFAPI.language.getUIText('try_again')}
                        </button>
                    </div>
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎪 Initializing Events Integration...');
    window.eventsIntegration = new EventsIntegration();
    console.log('✅ Events Integration initialized:', window.eventsIntegration);
});

// Export for use in other scripts
window.EventsIntegration = EventsIntegration;
