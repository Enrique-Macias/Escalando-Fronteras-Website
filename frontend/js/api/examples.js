/**
 * EF CMS API Usage Examples
 * This file demonstrates how to use the API services
 * Remove this file in production
 */

// Wait for API services to be ready
document.addEventListener('apiServicesReady', function(event) {
    console.log('🎉 API Services are ready!', event.detail);
    
    // Example usage - you can uncomment these to test
    
    // Example 1: Get featured news
    /*
    async function loadFeaturedNews() {
        try {
            const news = await EFAPI.news.getFeaturedNews('es');
            console.log('Featured News:', news);
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }
    loadFeaturedNews();
    */
    
    // Example 2: Get upcoming events
    /*
    async function loadUpcomingEvents() {
        try {
            const events = await EFAPI.events.getUpcomingEvents(5, 'es');
            console.log('Upcoming Events:', events);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }
    loadUpcomingEvents();
    */
    
    // Example 3: Get team members
    /*
    async function loadTeamMembers() {
        try {
            const team = await EFAPI.team.getAllTeamMembers('es');
            console.log('Team Members:', team);
        } catch (error) {
            console.error('Error loading team:', error);
        }
    }
    loadTeamMembers();
    */
    
    // Example 4: Search functionality
    /*
    async function searchContent(query) {
        try {
            const [newsResults, eventsResults, articlesResults] = await Promise.all([
                EFAPI.news.searchNews(query, { limit: 5 }),
                EFAPI.events.searchEvents(query, { limit: 5 }),
                EFAPI.articles.searchArticles(query, { limit: 5 })
            ]);
            
            console.log('Search Results:', {
                news: newsResults,
                events: eventsResults,
                articles: articlesResults
            });
        } catch (error) {
            console.error('Error searching:', error);
        }
    }
    */
    
    // Example 5: Language switching
    /*
    function switchLanguage(lang) {
        EFAPI.language.setLanguage(lang);
        console.log('Language switched to:', lang);
        
        // Reload content with new language
        loadFeaturedNews();
        loadUpcomingEvents();
        loadTeamMembers();
    }
    */
    
    // Example 6: Error handling with retry
    /*
    async function loadWithRetry(apiCall, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiCall();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error.message);
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    // Usage:
    loadWithRetry(() => EFAPI.news.getFeaturedNews('es'));
    */
});

// Example 7: Loading states and error handling
/*
function createLoadingState(element) {
    element.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>${EFAPI.language.getUIText('loading')}</p>
        </div>
    `;
}

function createErrorState(element, error, retryCallback) {
    element.innerHTML = `
        <div class="error-state">
            <h3>${EFAPI.language.getUIText('error_loading')}</h3>
            <p>${error.message}</p>
            <button onclick="${retryCallback}">${EFAPI.language.getUIText('try_again')}</button>
        </div>
    `;
}

function createEmptyState(element, message) {
    element.innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;
}
*/

console.log('📚 EF CMS API Examples loaded - check console for usage examples');
