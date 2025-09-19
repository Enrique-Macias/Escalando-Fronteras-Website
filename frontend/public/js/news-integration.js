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
            // Use language-specific category
            const category = this.currentLanguage === 'en' ? 
                (newsItem.category_en || newsItem.category) : 
                (newsItem.category_es || newsItem.category);
            
            if (category) {
                categoriesSet.add(category);
            }
            
            // Use language-specific tags
            const tags = this.currentLanguage === 'en' ? 
                (newsItem.tags_en || newsItem.tags) : 
                (newsItem.tags_es || newsItem.tags);
                
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => tagsSet.add(tag));
            }
        });

        let newsHTML = '';
        
        newsList.forEach((newsItem, index) => {
            const title = this.currentLanguage === 'en' ? newsItem.title_en || newsItem.title_es : newsItem.title_es;
            const content = this.currentLanguage === 'en' ? newsItem.body_en || newsItem.body_es : newsItem.body_es;
            const author = this.currentLanguage === 'en' ? newsItem.author_en || newsItem.author : newsItem.author;
            const imageUrl = newsItem.coverImageUrl || 'images/eventos/montaña2.0EF.jpeg';
            
            // Use language-specific category
            const category = this.currentLanguage === 'en' ? 
                (newsItem.category_en || newsItem.category || 'General') : 
                (newsItem.category_es || newsItem.category || 'General');
                
            const location = newsItem.location_city && newsItem.location_country 
                ? `${newsItem.location_city}, ${newsItem.location_country}` 
                : (newsItem.location_city || newsItem.location_country || (this.currentLanguage === 'en' ? 'Location' : 'Ubicación'));
            const createdAt = new Date(newsItem.createdAt);
            const formattedDate = this.formatDate(createdAt);
            
            // Use full content without truncation
            const fullContent = content;
            
            // Add margin-top for second news item
            const marginClass = index > 0 ? 'mt-3' : '';
            
            newsHTML += `
                <div class="news-block ${marginClass} clickable-news-card" style="cursor: pointer;" data-news-id="${newsItem.id}">
                    <div class="news-block-top">
                        <div class="clickable-news-image" style="cursor: pointer;" data-news-id="${newsItem.id}">
                            <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" loading="lazy" onerror="this.src='images/eventos/montaña2.0EF.jpeg'">
                        </div>

                        <div class="news-category-block">
                            <span class="category-block-link">
                                <i class="bi-geo-alt me-1"></i>${location}
                            </span>
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
                            <h4><span class="news-block-title-link clickable-news-title" style="cursor: pointer;" data-news-id="${newsItem.id}">${title}</span></h4>
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

        // Get translated text based on current language
        const searchPlaceholder = this.currentLanguage === 'en' ? 'Search' : 'Buscar';
        const recentEventsTitle = this.currentLanguage === 'en' ? 'Recent Events' : 'Eventos Recientes';
        
        // Keep the existing sidebar structure
        const sidebarHTML = `
            <div class="col-lg-4 col-12 mx-auto">
                <form class="custom-form search-form" action="#" method="get" role="form">
                    <input name="search" type="search" class="form-control" id="search" placeholder="${searchPlaceholder}" aria-label="Search">
                    <button type="submit" class="form-control">
                        <i class="bi-search"></i>
                    </button>
                </form>

                <h5 class="mt-5 mb-3">${recentEventsTitle}</h5>
                
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

        // Get translated section title
        const sectionTitle = this.currentLanguage === 'en' ? 'Latest News' : 'Últimas Noticias';
        
        this.newsContainer.innerHTML = `
            <div class="col-lg-12 col-12 mb-5">
                <h2>${sectionTitle}</h2>
            </div>
            <div class="col-lg-7 col-12">
                ${newsHTML}
            </div>
            ${sidebarHTML}
        `;
        
        // Set up click handlers for news articles
        this.setupNewsClickHandlers();

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

    setupNewsClickHandlers() {
        console.log('🖱️ Setting up news click handlers...');
        
        // Add click handlers to all clickable news elements
        const clickableElements = document.querySelectorAll('.clickable-news-card, .clickable-news-image, .clickable-news-title');
        
        clickableElements.forEach(element => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const newsId = element.getAttribute('data-news-id');
                console.log('🔗 News clicked, ID:', newsId);
                
                if (newsId) {
                    this.navigateToNewsArticle(newsId);
                } else {
                    console.error('❌ No news ID found on clicked element');
                }
            });
        });
        
        console.log('✅ Click handlers set up for', clickableElements.length, 'elements');
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
                        <h6 style="color: var(--primary-color); margin-bottom: 8px;">${this.currentLanguage === 'en' ? 'No events found' : 'No se encontraron eventos'}</h6>
                        <p class="small mb-3" style="color: var(--secondary-color); margin: 0;">${this.currentLanguage === 'en' ? `No events match "${query}"` : `No hay eventos que coincidan con "${query}"`}</p>
                        <button class="btn btn-sm" onclick="newsIntegration.resetEventSearch()" style="
                            background: var(--secondary-color);
                            color: var(--white-color);
                            border: none;
                            border-radius: var(--border-radius-small);
                            padding: 6px 12px;
                            font-size: 12px;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='var(--primary-color)'" onmouseout="this.style.background='var(--secondary-color)'">
                            <i class="bi-arrow-left me-1"></i>${this.currentLanguage === 'en' ? 'View recent events' : 'Ver los más recientes'}
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
            (this.currentLanguage === 'en' ? 
                `<p class="small text-muted mb-3">Showing ${displayEvents.length} of ${events.length} results for "${query}"</p>` :
                `<p class="small text-muted mb-3">Mostrando ${displayEvents.length} de ${events.length} resultados para "${query}"</p>`) :
            (this.currentLanguage === 'en' ? 
                `<p class="small text-muted mb-3">${events.length} result${events.length !== 1 ? 's' : ''} for "${query}"</p>` :
                `<p class="small text-muted mb-3">${events.length} resultado${events.length !== 1 ? 's' : ''} para "${query}"</p>`);

        const clearSearchText = this.currentLanguage === 'en' ? 'Clear search' : 'Limpiar búsqueda';
        
        const clearButton = `
            <div class="text-center mt-3 mb-3">
                <button class="btn btn-sm btn-outline-secondary" onclick="newsIntegration.resetEventSearch()">
                    <i class="bi-x-circle me-1"></i>${clearSearchText}
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
        const categoriesTitle = this.currentLanguage === 'en' ? 'Categories' : 'Categorías';
        const noCategoriesText = this.currentLanguage === 'en' ? 'No categories available' : 'No hay categorías disponibles';
        
        if (!categories || categories.length === 0) {
            return `
                <div class="category-block">
                    <h5>${categoriesTitle}</h5>
                    <p class="text-muted small">${noCategoriesText}</p>
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
                <h5>${categoriesTitle}</h5>
                <div class="category-links-container">
                    ${categoriesLinks}
                </div>
            </div>
        `;
    }

    generateTagsHTML(tags) {
        const tagsTitle = this.currentLanguage === 'en' ? 'Tags' : 'Etiquetas';
        const noTagsText = this.currentLanguage === 'en' ? 'No tags available' : 'No hay etiquetas disponibles';
        
        if (!tags || tags.length === 0) {
            return `
                <div class="tags-block">
                    <h5 class="mb-3">${tagsTitle}</h5>
                    <p class="text-muted small">${noTagsText}</p>
                </div>
            `;
        }

        const tagsLinks = tags.map(tag => {
            return `<a href="#" class="tags-block-link" onclick="return false;">${tag}</a>`;
        }).join('');

        return `
            <div class="tags-block">
                <h5 class="mb-3">${tagsTitle}</h5>
                ${tagsLinks}
            </div>
        `;
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
            // Spanish date format: "Day de Month de Year"
            const months = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        }
    }

    showError(error) {
        if (this.newsContainer) {
            const sectionTitle = this.currentLanguage === 'en' ? 'Latest News' : 'Últimas Noticias';
            const errorUnknown = this.currentLanguage === 'en' ? 'Unknown error' : 'Error desconocido';
            
            this.newsContainer.innerHTML = `
                <div class="col-lg-12 col-12 mb-5">
                    <h2>${sectionTitle}</h2>
                </div>
                <div class="col-lg-7 col-12">
                    <div class="error-state">
                        <div class="alert alert-warning" role="alert">
                            <h4 class="alert-heading">${EFAPI.language.getUIText('error_loading')}</h4>
                            <p>${error.message || errorUnknown}</p>
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

    // Navigate to noticias.html with selected article
    navigateToNewsArticle(articleId) {
        console.log('📰 Navigating to news article:', articleId);
        console.log('📰 Article ID type:', typeof articleId);
        console.log('📰 Current language:', this.currentLanguage);
        
        // Store the selected article ID and language
        sessionStorage.setItem('selectedNewsArticleId', articleId);
        sessionStorage.setItem('selectedLanguage', this.currentLanguage);
        
        // Also ensure language preference is stored in localStorage
        localStorage.setItem('userLanguagePreference', this.currentLanguage);
        
        // Verify storage
        const storedId = sessionStorage.getItem('selectedNewsArticleId');
        const storedLang = sessionStorage.getItem('selectedLanguage');
        console.log('📰 Stored article ID:', storedId);
        console.log('📰 Stored language:', storedLang);
        console.log('💾 Language preference saved for persistence');
        
        // Navigate to noticias.html with language parameter
        window.location.href = `noticias.html?lang=${this.currentLanguage}`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.newsIntegration = new NewsIntegration();
});

// Export for use in other scripts
window.NewsIntegration = NewsIntegration;
