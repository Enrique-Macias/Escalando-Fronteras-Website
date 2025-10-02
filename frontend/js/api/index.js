/**
 * API Services Index
 * Main entry point for all API services
 * Load this file to initialize all API services
 */

// API Services will be loaded in this order:
// 1. client.js - Base API client
// 2. language.js - Language service
// 3. news.js - News API
// 4. events.js - Events API
// 5. team.js - Team API
// 6. testimonials.js - Testimonials API
// 7. articles.js - Articles API
// 8. sponsors.js - Sponsors API
// 9. apoyo.js - Apoyo API
// 10. fundadores.js - Fundadores API

// Loading EF CMS API Services

// Check if all required services are loaded
function checkServicesLoaded() {
    const requiredServices = [
        'apiClient',
        'languageService',
        'newsAPI',
        'eventsAPI',
        'teamAPI',
        'testimonialsAPI',
        'articlesAPI',
        'sponsorsAPI',
        'apoyoAPI',
        'fundadoresAPI'
    ];

    const missingServices = requiredServices.filter(service => !window[service]);
    
    if (missingServices.length === 0) {
        // All API services loaded successfully
        
        // Initialize language service
        languageService.updatePageLanguage();
        
        // Dispatch ready event
        const event = new CustomEvent('apiServicesReady', {
            detail: {
                services: requiredServices,
                language: languageService.getCurrentLanguage()
            }
        });
        document.dispatchEvent(event);
        
    } else {
        // Missing API services
    }
}

// Check services after a short delay to ensure all scripts are loaded
setTimeout(checkServicesLoaded, 100);

// Export main API object for easy access
window.EFAPI = {
    client: window.apiClient,
    language: window.languageService,
    news: window.newsAPI,
    events: window.eventsAPI,
    team: window.teamAPI,
    testimonials: window.testimonialsAPI,
    articles: window.articlesAPI,
    sponsors: window.sponsorsAPI,
    apoyo: window.apoyoAPI,
    fundadores: window.fundadoresAPI
};

// EF API Services initialized
