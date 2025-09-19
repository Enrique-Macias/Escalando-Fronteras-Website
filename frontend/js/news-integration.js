/**
 * News Integration Script
 * Fetches and displays news data from EF CMS API
 */

class NewsIntegration {
    constructor() {
        this.newsContainer = null;
        this.loadingElement = null;
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        document.addEventListener('apiServicesReady', () => {
            this.newsContainer = document.getElementById('news-container');
            this.loadingElement = this.newsContainer ? this.newsContainer.querySelector('.spinner-border') : null;
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            this.loadNews();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadNews();
            });
        });
    }

    async loadNews() {
        if (!this.newsContainer) return;

        try {
            this.showLoading();
            console.log('🔄 Loading news...');
            console.log('🌐 API Base URL:', EFAPI.client.baseURL);
            console.log('🌍 Current Language:', this.currentLanguage);

            const news = await EFAPI.news.getNews({
                limit: 2, // Get only the latest 2 news
                lang: this.currentLanguage,
                published: true
            });
            
            let newsList = [];
            if (Array.isArray(news)) {
                newsList = news;
            } else if (news && news.news) {
                newsList = news.news; // API returns { news: [...] }
            } else if (news && news.data) {
                newsList = news.data; // Fallback for other API formats
            } else {
                newsList = [];
            }
            
            console.log('✅ News loaded:', newsList);
            
            this.displayNews(newsList);

        } catch (error) {
            console.error('❌ Error loading news:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `
                <div class="col-lg-12 col-12 mb-5">
                    <h2>${EFAPI.language.getUIText('latest_news')}</h2>
                </div>
                <div class="col-lg-7 col-12">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">${EFAPI.language.getUIText('loading_news')}</span>
                        </div>
                        <p class="mt-2">${EFAPI.language.getUIText('loading_news')}</p>
                    </div>
                </div>
            `;
        }
    }

    displayNews(newsList) {
        if (!newsList || newsList.length === 0) {
            this.hideSection();
            return;
        }

        // Collect categories and tags from news data
        const categoriesSet = new Set();
        const tagsSet = new Set();
        
        newsList.forEach(newsItem => {
            if (newsItem.category) {
                categoriesSet.add(newsItem.category);
            }
            if (newsItem.tags && Array.isArray(newsItem.tags)) {
                newsItem.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        let newsHTML = '';
        
        newsList.forEach((newsItem, index) => {
            const title = this.currentLanguage === 'en' ? newsItem.title_en || newsItem.title_es : newsItem.title_es;
            const content = this.currentLanguage === 'en' ? newsItem.body_en || newsItem.body_es : newsItem.body_es;
            const author = this.currentLanguage === 'en' ? newsItem.author_en || newsItem.author : newsItem.author;
            const imageUrl = newsItem.coverImageUrl || 'images/eventos/montaña2.0EF.jpeg';
            const category = newsItem.category || 'General';
            const location = newsItem.location_city && newsItem.location_country 
                ? `${newsItem.location_city}, ${newsItem.location_country}` 
                : (newsItem.location_city || newsItem.location_country || 'Ubicación');
            const createdAt = new Date(newsItem.createdAt);
            const formattedDate = this.formatDate(createdAt);
            
            // Use full content without truncation
            const fullContent = content;
            
            // Add margin-top for second news item
            const marginClass = index > 0 ? 'mt-3' : '';
            
            newsHTML += `
                <div class="news-block ${marginClass}">
                    <div class="news-block-top">
                        <a href="#" onclick="return false;">
                            <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" loading="lazy" onerror="this.src='images/eventos/montaña2.0EF.jpeg'">
                        </a>

                        <div class="news-category-block">
                            <a href="#" class="category-block-link" onclick="return false;">
                                <i class="bi-geo-alt me-1"></i>${location}
                            </a>
                        </div>
                    </div>

                    <div class="news-block-info">
                        <div class="d-flex mt-2">
                            <div class="news-block-date">
                                <p>
                                    <i class="bi-calendar4 custom-icon me-1"></i>
                                    ${formattedDate}
                                </p>
                            </div>

                            <div class="news-block-author mx-5">
                                <p>
                                    <i class="bi-person custom-icon me-1"></i>
                                    By ${author || 'Admin'}
                                </p>
                            </div>
                        </div>

                        <div class="news-block-title mb-2">
                            <h4><a href="#" class="news-block-title-link" onclick="return false;">${title}</a></h4>
                        </div>

                        <div class="news-block-body">
                            <p>${fullContent}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        // Generate dynamic categories and tags HTML
        const categoriesHTML = this.generateCategoriesHTML(Array.from(categoriesSet));
        const tagsHTML = this.generateTagsHTML(Array.from(tagsSet));

        // Keep the existing sidebar structure
        const sidebarHTML = `
            <div class="col-lg-4 col-12 mx-auto">
                <form class="custom-form search-form" action="#" method="get" role="form">
                    <input name="search" type="search" class="form-control" id="search" placeholder="Buscar" aria-label="Search">
                    <button type="submit" class="form-control">
                        <i class="bi-search"></i>
                    </button>
                </form>

                <h5 class="mt-5 mb-3">Eventos Recientes</h5>
                
                <div id="recent-events-container">
                    <!-- Recent events will be loaded here -->
                    <div class="text-center">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Cargando eventos...</span>
                        </div>
                        <p class="mt-2 small">Cargando eventos...</p>
                    </div>
                </div>

                ${categoriesHTML}

                ${tagsHTML}
            </div>
        `;

        this.newsContainer.innerHTML = `
            <div class="col-lg-12 col-12 mb-5">
                <h2>Últimas Noticias</h2>
            </div>
            <div class="col-lg-7 col-12">
                ${newsHTML}
            </div>
            ${sidebarHTML}
        `;

        // Trigger events integration for the recent events section
        console.log('🔄 Attempting to trigger events integration...');
        
        // Use a more robust approach with multiple retries
        const triggerEventsIntegration = (retryCount = 0) => {
            if (window.eventsIntegration) {
                console.log('✅ Events integration found, loading events...');
                window.eventsIntegration.loadRecentEvents();
            } else if (retryCount < 5) {
                console.log(`⚠️ Events integration not found, retry ${retryCount + 1}/5...`);
                setTimeout(() => triggerEventsIntegration(retryCount + 1), 500);
            } else {
                console.log('❌ Events integration not found after 5 retries');
            }
        };
        
        // Try immediately and with small delay
        triggerEventsIntegration();
        setTimeout(() => triggerEventsIntegration(), 100);
        
        // Set up search functionality after sidebar is created
        setTimeout(() => this.setupSearchFunctionality(), 200);
    }

    setupSearchFunctionality() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.getElementById('search');
        
        console.log('🔍 Setting up search in news integration...');
        console.log('🔍 Search form found:', !!searchForm);
        console.log('🔍 Search input found:', !!searchInput);
        
        if (!searchForm || !searchInput) {
            console.log('⚠️ Search elements not found, retrying...');
            setTimeout(() => this.setupSearchFunctionality(), 500);
            return;
        }

        // Remove form attributes to prevent navigation
        searchForm.removeAttribute('action');
        searchForm.removeAttribute('method');
        
        // Change submit button to regular button
        const submitButton = searchForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.type = 'button';
        }

        // Prevent form submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔍 Form submission prevented');
            this.performEventSearch();
            return false;
        });

        // Handle button click
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Search button clicked');
                this.performEventSearch();
                return false;
            });
        }

        // Real-time search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('🔍 Input changed:', query);
            if (query.length >= 2) {
                this.performEventSearch();
            } else if (query.length === 0) {
                this.resetEventSearch();
            }
        });

        // Handle Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Enter key pressed');
                this.performEventSearch();
                return false;
            } else if (e.key === 'Escape') {
                searchInput.value = '';
                this.resetEventSearch();
            }
        });

        console.log('✅ Search functionality set up successfully');
    }

    async performEventSearch() {
        const searchInput = document.getElementById('search');
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query || query.length < 2) {
            this.resetEventSearch();
            return;
        }

        console.log('🔍 Performing search for:', query);

        try {
            // Load all events for search
            const events = await EFAPI.events.getEvents({
                limit: 50,
                lang: this.currentLanguage,
                published: true
            });
            
            let eventsList = [];
            if (Array.isArray(events)) {
                eventsList = events;
            } else if (events && events.events) {
                eventsList = events.events;
            } else if (events && events.data) {
                eventsList = events.data;
            } else {
                eventsList = [];
            }

            // Filter events
            const filteredEvents = eventsList.filter(event => {
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

            console.log('✅ Search results:', filteredEvents.length);
            
            this.displaySearchResults(filteredEvents, query);

        } catch (error) {
            console.error('❌ Search error:', error);
        }
    }

    displaySearchResults(events, query) {
        const recentEventsContainer = document.getElementById('recent-events-container');
        
        if (!recentEventsContainer) return;

        if (events.length === 0) {
            recentEventsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-message" style="
                        background: var(--section-bg-color);
                        border: 1px solid var(--secondary-color);
                        border-radius: var(--border-radius-small);
                        padding: 20px;
                        text-align: center;
                        margin: 10px 0;
                    ">
                        <h6 style="color: var(--primary-color); margin-bottom: 8px;">No se encontraron eventos</h6>
                        <p class="small mb-3" style="color: var(--secondary-color); margin: 0;">No hay eventos que coincidan con "${query}"</p>
                        <button class="btn btn-sm" onclick="newsIntegration.resetEventSearch()" style="
                            background: var(--secondary-color);
                            color: var(--white-color);
                            border: none;
                            border-radius: var(--border-radius-small);
                            padding: 6px 12px;
                            font-size: 12px;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='var(--primary-color)'" onmouseout="this.style.background='var(--secondary-color)'">
                            <i class="bi-arrow-left me-1"></i>Ver los más recientes
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Show search results (limit to 2 for Eventos Recientes section)
        const displayEvents = events.slice(0, 2);
        let eventsHTML = '';
        
        displayEvents.forEach((event, index) => {
            const title = this.currentLanguage === 'en' ? event.title_en || event.title_es : event.title_es;
            const location = event.location_city && event.location_country 
                ? `${event.location_city}, ${event.location_country}` 
                : (event.location_city || event.location_country || 'Ubicación');
            const imageUrl = event.coverImageUrl || 'images/eventos/ejemplo_evento.jpg';
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
                        
                        <div class="news-block-location">
                            <p class="small text-muted">
                                <i class="bi-geo-alt custom-icon me-1"></i>
                                ${location}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

        // Add search results header and clear button
        const resultsHeader = events.length > 2 ? 
            `<p class="small text-muted mb-3">Mostrando ${displayEvents.length} de ${events.length} resultados para "${query}"</p>` :
            `<p class="small text-muted mb-3">${events.length} resultado${events.length !== 1 ? 's' : ''} para "${query}"</p>`;

        const clearButton = `
            <div class="text-center mt-3 mb-3">
                <button class="btn btn-sm btn-outline-secondary" onclick="newsIntegration.resetEventSearch()">
                    <i class="bi-x-circle me-1"></i>Limpiar búsqueda
                </button>
            </div>
        `;

        recentEventsContainer.innerHTML = resultsHeader + eventsHTML + clearButton;
    }

    resetEventSearch() {
        console.log('🔍 Resetting event search...');
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reload original events
        if (window.eventsIntegration) {
            window.eventsIntegration.loadRecentEvents();
        }
    }

    generateCategoriesHTML(categories) {
        if (!categories || categories.length === 0) {
            return `
                <div class="category-block">
                    <h5>Categorías</h5>
                    <p class="text-muted small">No hay categorías disponibles</p>
                </div>
            `;
        }

        const categoriesLinks = categories.map(category => {
            return `
                <a href="#" class="category-block-link" onclick="return false;">
                    ${category}
                </a>
            `;
        }).join('');

        return `
            <div class="category-block">
                <h5>Categorías</h5>
                <div class="category-links-container">
                    ${categoriesLinks}
                </div>
            </div>
        `;
    }

    generateTagsHTML(tags) {
        if (!tags || tags.length === 0) {
            return `
                <div class="tags-block">
                    <h5 class="mb-3">Etiquetas</h5>
                    <p class="text-muted small">No hay etiquetas disponibles</p>
                </div>
            `;
        }

        const tagsLinks = tags.map(tag => {
            return `<a href="#" class="tags-block-link" onclick="return false;">${tag}</a>`;
        }).join('');

        return `
            <div class="tags-block">
                <h5 class="mb-3">Etiquetas</h5>
                ${tagsLinks}
            </div>
        `;
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
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `
                <div class="col-lg-12 col-12 mb-5">
                    <h2>Últimas Noticias</h2>
                </div>
                <div class="col-lg-7 col-12">
                    <div class="error-state">
                        <div class="alert alert-warning" role="alert">
                            <h4 class="alert-heading">${EFAPI.language.getUIText('error_loading')}</h4>
                            <p>${error.message || 'Error desconocido'}</p>
                            <hr>
                            <button class="btn btn-primary" onclick="newsIntegration.loadNews()">
                                ${EFAPI.language.getUIText('try_again')}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    hideSection() {
        console.log('🚫 No news data available, hiding news section');
        const newsSection = document.querySelector('.news-section');
        if (newsSection) {
            newsSection.style.display = 'none';
            console.log('✅ News section hidden successfully');
        }
    }

    showEmptyState() {
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `
                <div class="col-lg-12 col-12 mb-5">
                    <h2>Últimas Noticias</h2>
                </div>
                <div class="col-lg-7 col-12">
                    <div class="empty-state">
                        <div class="alert alert-info" role="alert">
                            <h4 class="alert-heading">${EFAPI.language.getUIText('no_news_available')}</h4>
                            <p>${EFAPI.language.getUIText('please_try_later')}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.newsIntegration = new NewsIntegration();
});

// Export for use in other scripts
window.NewsIntegration = NewsIntegration;
