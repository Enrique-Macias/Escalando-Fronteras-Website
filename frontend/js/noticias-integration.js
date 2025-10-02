/**
 * Noticias Integration Script
 * Handles dynamic loading and display of news content for noticias.html
 */

class NoticiasIntegration {
    constructor() {
        this.currentLanguage = 'es'; // Default to Spanish, will be updated when language system loads
        this.allNews = [];
        this.filteredNews = [];
        this.displayedArticlesCount = this.getInitialArticleCount(); // Responsive initial count
        this.articlesPerPage = this.getArticlesPerPage(); // Responsive articles per page
        
        this.init();
    }

    // Get initial article count based on screen size
    getInitialArticleCount() {
        return window.innerWidth <= 768 ? 3 : 6; // 3 for mobile, 6 for desktop
    }

    // Get articles per page based on screen size
    getArticlesPerPage() {
        return window.innerWidth <= 768 ? 3 : 6; // Load 3 more on mobile, 6 on desktop
    }

    // Update pagination settings on window resize
    updatePaginationSettings() {
        const newInitialCount = this.getInitialArticleCount();
        const newArticlesPerPage = this.getArticlesPerPage();
        
        // Only update if values have changed (to avoid unnecessary re-renders)
        if (this.articlesPerPage !== newArticlesPerPage) {
            this.articlesPerPage = newArticlesPerPage;
            // Updated articles per page
        }
    }

    async init() {
        // Initializing Noticias Integration
        
        // Wait for API services to be ready
        if (typeof window.EFAPI === 'undefined') {
            // Waiting for API services
            document.addEventListener('apiServicesReady', () => {
                this.setupLanguageListener();
                this.loadContent();
            });
        } else {
            this.setupLanguageListener();
            this.loadContent();
        }
    }

    setupLanguageListener() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            // Language changed
            this.currentLanguage = event.detail.language;
            this.loadContent(); // Reload content with new language
        });
    }

    async loadContent() {
        // Loading news content
        
        try {
            // First, load all news to populate this.allNews array
            await this.loadAllNewsGrid();
            
            // Then load other content in parallel (now that allNews is populated)
            await Promise.all([
                this.loadMainNews(),
                this.loadRecentNewsSidebar(),
                this.loadSidebarData()
            ]);

            // Setup search functionality AFTER data is loaded
            // Setting up search with loaded news articles
            this.setupSearchFunctionality();
            this.setupWindowResize(); // Add window resize listener
            
            // Translate static sidebar content
            this.translateSidebarContent();
            
        } catch (error) {
            // Error loading news content
        }
    }

    translateSidebarContent() {
        // Translating sidebar content
        
        // Translate "Noticias Recientes" title
        const recentNewsTitle = document.querySelector('h5.mt-5.mb-3');
        if (recentNewsTitle) {
            // Only update if not currently showing search results
            if (!recentNewsTitle.textContent.includes('Search Results') && !recentNewsTitle.textContent.includes('Resultados de Búsqueda')) {
                const title = this.currentLanguage === 'en' ? 'Recent News' : 'Noticias Recientes';
                recentNewsTitle.textContent = title;
                // Updated recent news title
            }
        }
        
        // Translate "Categorías" title
        const categoriesTitle = document.querySelector('.category-block h5');
        if (categoriesTitle) {
            const title = this.currentLanguage === 'en' ? 'Categories' : 'Categorías';
            categoriesTitle.textContent = title;
            // Updated categories title
        }
        
        // Translate search placeholder
        const searchInput = document.getElementById('news-search');
        if (searchInput) {
            const placeholder = this.currentLanguage === 'en' ? 'Search news' : 'Buscar noticias';
            searchInput.placeholder = placeholder;
            // Updated search placeholder
        }
        
        // Translate main news grid title
        const mainGridTitle = document.querySelector('.news-section.section-bg h2');
        if (mainGridTitle) {
            const title = this.currentLanguage === 'en' ? 'News' : 'Noticias';
            mainGridTitle.textContent = title;
            // Updated main grid title
        }
    }

    // Setup window resize listener for responsive pagination
    setupWindowResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updatePaginationSettings();
            }, 250); // Debounce resize events
        });
    }

    async loadMainNews() {
        // Loading main news article
        
        // Check if there's a selected article ID from sessionStorage
        const selectedArticleId = sessionStorage.getItem('selectedNewsArticleId');
        
        try {
            let response;
            
            if (selectedArticleId) {
                // Loading specific news article
                
                // First, try to find the article in the full news list
                const allNewsResponse = await window.EFAPI.news.getNews({ 
                    limit: 100, // Get more articles to find the specific one
                    lang: this.currentLanguage 
                });
                
                let allNewsList = [];
                if (Array.isArray(allNewsResponse)) {
                    allNewsList = allNewsResponse;
                } else if (allNewsResponse && allNewsResponse.news) {
                    allNewsList = allNewsResponse.news;
                } else if (allNewsResponse && allNewsResponse.data) {
                    allNewsList = allNewsResponse.data;
                }
                
                // Find the specific article by ID
                const selectedArticle = allNewsList.find(article => 
                    article.id == selectedArticleId || 
                    article.id === parseInt(selectedArticleId)
                );
                
                // Clear the sessionStorage after using it
                sessionStorage.removeItem('selectedNewsArticleId');
                
                if (selectedArticle) {
                    // Selected news article found
                    this.displayMainNews(selectedArticle);
                    this.displayMainNewsCategories(selectedArticle);
                    return;
                } else {
                    // Selected article not found in news list, trying direct API call
                    
                    // Fallback: try direct API call
                    try {
                        response = await window.EFAPI.news.getNewsById(selectedArticleId);
                        if (response) {
                            // Selected news article loaded via direct call
                            this.displayMainNews(response);
                            this.displayMainNewsCategories(response);
                            return;
                        }
                    } catch (error) {
                        // Error loading specific article
                    }
                }
            }
            
            // Fallback to latest news if no specific article or if loading specific article failed
            // Loading latest news article
            response = await window.EFAPI.news.getNews({ 
                limit: 1, 
                lang: this.currentLanguage 
            });
            
            let newsList = [];
            if (Array.isArray(response)) {
                newsList = response;
            } else if (response && response.news) {
                newsList = response.news;
            } else if (response && response.data) {
                newsList = response.data;
            }

            // Main news response

            if (newsList && newsList.length > 0) {
                this.displayMainNews(newsList[0]);
                // Update categories based on main news article
                this.displayMainNewsCategories(newsList[0]);
            } else {
                this.showMainNewsError();
            }
        } catch (error) {
            // Error loading main news
            this.showMainNewsError();
        }
    }

    displayMainNews(news) {
        // Displaying main news
        
        const container = document.getElementById('main-news-container');
        if (!container) return;

        // Get content based on current language
        const title = news[`title_${this.currentLanguage}`] || news.title || 'Sin título';
        const body = news[`body_${this.currentLanguage}`] || news.body || news.content || 'Sin contenido disponible';
        const category = news[`category_${this.currentLanguage}`] || news.category || 'General';
        const imageUrl = news.coverImageUrl || news.imageUrl || 'images/introEF.jpeg';
        const location = this.formatLocation(news);
        const formattedDate = this.formatDate(news.createdAt || news.publishDate);
        const author = news.author || 'Escalando Fronteras';

        const newsHtml = `
            <div class="news-block">
                <div class="news-block-top">
                    <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">

                    <div class="news-category-block">
                        ${location ? `<a href="#" class="category-block-link"><i class="bi-geo-alt me-1"></i>${location}</a>` : ''}
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
                                By ${author}
                            </p>
                        </div>
                    </div>

                    <div class="news-block-title mb-2">
                        <h4>${title}</h4>
                    </div>

                    <div class="news-block-body">
                        ${this.formatNewsBody(body)}
                    </div>

                    ${this.formatAdditionalImages(news)}

                    <div class="social-share border-top mt-5 py-4 d-flex flex-wrap align-items-center">
                        <div class="tags-block me-auto">
                            ${this.formatTags(news, category)}
                        </div>

                        <div class="d-flex">
                            <a href="https://www.facebook.com/EscalandoFronteras/" class="social-icon-link bi-facebook" target="_blank" title="Síguenos en Facebook"></a>
                            <a href="https://www.instagram.com/escalando_fronteras/" class="social-icon-link bi-instagram" target="_blank" title="Síguenos en Instagram"></a>
                            <a href="#" class="social-icon-link bi-whatsapp" title="WhatsApp"></a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = newsHtml;
    }

    displayMainNewsCategories(news) {
        // Displaying categories for main news article
        
        const container = document.getElementById('categories-sidebar-container');
        if (!container) {
            // Categories container not found
            return;
        }

        // Extract only categories from the main news article (not tags)
        const categories = [];
        
        // Check for language-specific category field only
        const category = this.currentLanguage === 'en' ? 
            (news.category_en || news.category) : 
            (news.category_es || news.category);
        
        if (category) {
            categories.push(category);
        }

        // Found categories for main article

        if (categories.length > 0) {
            const categoriesHtml = `
                <div class="category-links-container d-flex flex-wrap" style="gap: 8px;">
                    ${categories.map(category => `
                        <a href="#" class="category-block-link">${category}</a>
                    `).join('')}
                </div>
            `;
            container.innerHTML = categoriesHtml;
        } else {
            const noCategoriesText = this.currentLanguage === 'en' ? 'No categories available.' : 'No hay categorías disponibles.';
            container.innerHTML = `<p style="color: var(--primary-color); font-size: 14px; margin: 0;">${noCategoriesText}</p>`;
        }
    }

    showMainNewsError() {
        const container = document.getElementById('main-news-container');
        if (!container) return;

        const errorTitle = this.currentLanguage === 'en' ? 'No news available' : 'No hay noticias disponibles';
        const errorMessage = this.currentLanguage === 'en' ? 'Network error - please check your connection' : 'Error de red - por favor verifica tu conexión';
        const retryText = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';

        container.innerHTML = `
            <div class="error-modal network-error">
                <div class="error-modal-icon">
                    <i class="bi-wifi-off"></i>
                </div>
                <h3>${errorTitle}</h3>
                <p>${errorMessage}</p>
                <button class="btn-retry" onclick="window.noticiasIntegration.loadContent()">
                    ${retryText}
                </button>
            </div>
        `;
    }

    async loadRecentNewsSidebar() {
        // Loading recent news for sidebar
        
        try {
            // Use already loaded allNews array (populated by loadAllNewsGrid)
            if (this.allNews && this.allNews.length > 0) {
                // Using already loaded news for sidebar
                
                // Skip the first one (it's the main news) and take next 2
                const recentNews = this.allNews.slice(1, 3);
                
                if (recentNews && recentNews.length > 0) {
                    // Displaying recent news sidebar
                    this.displayRecentNewsSidebar(recentNews);
                } else {
                    // No recent news available after skipping main article
                    this.showRecentNewsError();
                }
            } else {
                // allNews array is empty, cannot load recent news sidebar
                this.showRecentNewsError();
            }
        } catch (error) {
            // Error loading recent news
            this.showRecentNewsError();
        }
    }

    displayRecentNewsSidebar(newsList) {
        // Displaying recent news sidebar
        
        const container = document.getElementById('recent-news-sidebar-container');
        if (!container) return;

        const newsHtml = newsList.map((news, index) => {
            const title = news[`title_${this.currentLanguage}`] || news.title || 'Sin título';
            const imageUrl = news.coverImageUrl || news.imageUrl || 'images/introEF.jpeg';
            const formattedDate = this.formatDate(news.createdAt || news.publishDate);
            
            // Processing recent news article
            
            // Find the index in allNews array using ID comparison (more reliable than object reference)
            let articleIndex = this.allNews.findIndex(article => 
                article.id === news.id || 
                article.id == news.id || 
                (article.id && news.id && String(article.id) === String(news.id))
            );

            // ID comparison result

            // Fallback: if ID comparison fails, try object reference comparison
            if (articleIndex === -1) {
                // ID comparison failed, trying object reference
                articleIndex = this.allNews.findIndex(article => article === news);
                // Object reference result
            }

            // Additional fallback: try finding by title if both above fail
            if (articleIndex === -1) {
                // Object reference failed, trying title comparison
                const newsTitle = news[`title_${this.currentLanguage}`] || news.title;
                articleIndex = this.allNews.findIndex(article => {
                    const articleTitle = article[`title_${this.currentLanguage}`] || article.title;
                    return articleTitle === newsTitle;
                });
                // Title comparison result
            }

            // Recent news sidebar article processing

            // If we still can't find the article, use the sidebar index + 1 as fallback
            // (since recent news shows articles 1 and 2 from allNews, and we skip index 0)
            if (articleIndex === -1) {
                // Could not find article in allNews, using fallback index
                articleIndex = index + 1; // Recent news shows articles at indices 1 and 2
            }

            return `
                <div class="news-block news-block-two-col d-flex mt-4" style="cursor: pointer;" onclick="window.noticiasIntegration.displaySelectedArticle(${articleIndex})">
                    <div class="news-block-two-col-image-wrap">
                        <div>
                            <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                        </div>
                    </div>

                    <div class="news-block-two-col-info">
                        <div class="news-block-title mb-2">
                            <h6 class="news-block-title-link">${title}</h6>
                        </div>

                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${formattedDate}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = newsHtml;
    }

    showRecentNewsError() {
        const container = document.getElementById('recent-news-sidebar-container');
        if (!container) return;

        const errorTitle = this.currentLanguage === 'en' ? 'No recent news' : 'No hay noticias recientes';
        const errorMessage = this.currentLanguage === 'en' ? 'Network error - please check your connection' : 'Error de red - por favor verifica tu conexión';
        const retryText = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';

        container.innerHTML = `
            <div class="error-state network-error">
                <div class="error-icon">
                    <i class="bi-wifi-off"></i>
                </div>
                <h6>${errorTitle}</h6>
                <p class="small">${errorMessage}</p>
                <button class="btn-retry-sm" onclick="window.noticiasIntegration.loadRecentNewsSidebar()">
                    ${retryText}
                </button>
            </div>
        `;
    }

    async loadAllNewsGrid() {
        // Loading all news for grid
        
        try {
            const response = await window.EFAPI.news.getNews({ 
                limit: 100, 
                lang: this.currentLanguage 
            });
            
            let newsList = [];
            if (Array.isArray(response)) {
                newsList = response;
            } else if (response && response.news) {
                newsList = response.news;
            } else if (response && response.data) {
                newsList = response.data;
            }

            // All news response

            this.allNews = newsList || [];
            this.filteredNews = [...this.allNews];

            if (this.allNews.length > 0) {
                this.displayAllNewsGrid(this.allNews);
            } else {
                this.showAllNewsError();
            }
        } catch (error) {
            // Error loading all news
            this.showAllNewsError();
        }
    }

    displayAllNewsGrid(newsList, append = false) {
        // Displaying news grid
        
        const container = document.getElementById('all-news-grid-container');
        if (!container) {
            // Container not found
            return;
        }
        
        // Container found

        // Reset displayed count if not appending
        if (!append) {
            this.displayedArticlesCount = this.articlesPerPage;
        }

        // Get articles to display (either first batch or next batch)
        const articlesToShow = append ? 
            newsList.slice(this.displayedArticlesCount - this.articlesPerPage, this.displayedArticlesCount) :
            newsList.slice(0, this.displayedArticlesCount);

        // Showing articles

        const newsColumns = articlesToShow.map((news, index) => {
            const title = news[`title_${this.currentLanguage}`] || news.title || 'Sin título';
            const imageUrl = news.coverImageUrl || news.imageUrl || 'images/introEF.jpeg';
            const location = this.formatLocation(news);
            const formattedDate = this.formatDate(news.createdAt || news.publishDate);
            const author = news.author || 'Escalando Fronteras';

            return `
                <div class="col-lg-4 col-md-6 col-12">
                    <div class="news-block" style="cursor: pointer;" onclick="window.noticiasIntegration.displaySelectedArticle(${append ? this.displayedArticlesCount - this.articlesPerPage + index : index})">
                        <div class="news-block-top">
                            <div>
                                <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                            </div>

                            <div class="news-category-block">
                                ${location ? `<a href="#" class="category-block-link" onclick="event.stopPropagation();"><i class="bi-geo-alt me-1"></i>${location}</a>` : ''}
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
                                        By ${author}
                                    </p>
                                </div>
                            </div>

                            <div class="news-block-title mb-2">
                                <h4 class="news-block-title-link">${title}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Wrap columns in a proper Bootstrap row
        const newsHtml = `<div class="row" id="news-grid-row">${newsColumns}</div>`;

        // Add "Mostrar más" button if there are more articles
        const showMoreButton = (this.displayedArticlesCount < newsList.length) ? `
            <div class="row mt-4">
                <div class="col-12 text-center">
                    <button class="btn btn-outline-primary btn-lg px-4 py-2" onclick="window.noticiasIntegration.loadMoreArticles()" style="
                        background-color: transparent;
                        border: 2px solid var(--secondary-color);
                        color: var(--secondary-color);
                        font-weight: 600;
                        border-radius: var(--border-radius-small);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.backgroundColor='var(--secondary-color)'; this.style.color='var(--white-color)';" 
                       onmouseout="this.style.backgroundColor='transparent'; this.style.color='var(--secondary-color)';">
                        <i class="bi-plus-circle me-2"></i>${this.currentLanguage === 'en' ? 'Show more' : 'Mostrar más'}
                    </button>
                </div>
            </div>
        ` : '';

        const fullHtml = newsHtml + showMoreButton;

        // Generated HTML for articles
        
        if (append) {
            // Append new articles to existing grid
            const existingRow = container.querySelector('#news-grid-row');
            if (existingRow) {
                existingRow.innerHTML += newsColumns;
            }
            // Update the button
            const buttonContainer = container.querySelector('.mt-4');
            if (buttonContainer) {
                buttonContainer.remove();
            }
            if (showMoreButton) {
                container.insertAdjacentHTML('beforeend', showMoreButton);
            }
        } else {
            // Replace entire content
            container.innerHTML = fullHtml;
        }
        
        // HTML inserted into main grid container
    }

    showAllNewsError() {
        const container = document.getElementById('all-news-grid-container');
        if (!container) return;

        const errorTitle = this.currentLanguage === 'en' ? 'No news available' : 'No hay noticias disponibles';
        const errorMessage = this.currentLanguage === 'en' ? 'Network error - please check your connection' : 'Error de red - por favor verifica tu conexión';
        const retryText = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';

        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="error-modal network-error">
                        <div class="error-modal-icon">
                            <i class="bi-wifi-off"></i>
                        </div>
                        <h3>${errorTitle}</h3>
                        <p>${errorMessage}</p>
                        <button class="btn-retry" onclick="window.noticiasIntegration.loadAllNewsGrid()">
                            ${retryText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadSidebarData() {
        // Loading sidebar data
        
        try {
            // Categories are now handled by displayMainNewsCategories()
            // Tags section has been removed as requested
            // Sidebar data loading completed
        } catch (error) {
            // Error loading sidebar data
        }
    }


    setupSearchFunctionality() {
        // Setting up search functionality
        
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.getElementById('news-search');

        if (!searchForm || !searchInput) {
            // Search form or input not found, retrying
            setTimeout(() => {
                this.setupSearchFunctionality();
            }, 500);
            return;
        }

        // Search form and input found, setting up listeners

        // Remove form action to prevent page navigation
        searchForm.removeAttribute('action');
        searchForm.removeAttribute('method');
        
        // Change submit button type
        const submitButton = searchForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.type = 'button';
        }

        // Add event listeners
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Form submission prevented
            this.performNewsSearch();
            return false;
        });

        // Real-time search - immediate like events search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            // Input changed
            
            if (query.length >= 2) {
                this.performNewsSearch();
            } else if (query.length === 0) {
                this.clearSidebarSearch();
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                // Enter key pressed
                
                // Clear timeout and search immediately
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                this.performNewsSearch();
                return false;
            } else if (e.key === 'Escape') {
                searchInput.value = '';
                this.clearSidebarSearch();
            }
        });

        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                // Search button clicked
                this.performNewsSearch();
                return false;
            });
        }

        // Search functionality setup complete
    }

    performNewsSearch() {
        const searchInput = document.getElementById('news-search');
        if (!searchInput) {
            // Search input not found
            return;
        }
        
        const query = searchInput.value.trim().toLowerCase();
        // Performing news search

        // Check if news data is loaded
        if (!this.allNews || this.allNews.length === 0) {
            // No news data available for search, waiting for data to load
            // Try to trigger a reload of news data
            this.loadAllNewsGrid().then(() => {
                // News data reloaded, retrying search
                this.performNewsSearch();
            });
            return;
        }

        if (!query || query.length < 2) {
            // Show recent news if search is empty
            // Empty query, showing recent news
            this.clearSidebarSearch();
            return;
        }

        // Filter news based on search query
        this.filteredNews = this.allNews.filter(news => {
            const title = (news[`title_${this.currentLanguage}`] || news.title || '').toLowerCase();
            const body = (news[`body_${this.currentLanguage}`] || news.body || news.content || '').toLowerCase();
            const category = (news[`category_${this.currentLanguage}`] || news.category || '').toLowerCase();
            const location = this.formatLocation(news).toLowerCase();

            return title.includes(query) || 
                   body.includes(query) || 
                   category.includes(query) || 
                   location.includes(query);
        });

        // Found matching news articles

        if (this.filteredNews.length > 0) {
            this.displayNewsSearchResults(this.filteredNews, query);
            this.updateSearchTitle(true, this.filteredNews.length, query);
        } else {
            this.displayNoNewsSearchResults(query);
            this.updateSearchTitle(true, 0, query);
        }
    }


    displayNewsSearchResults(newsList, query) {
        const container = document.getElementById('recent-news-sidebar-container');
        if (!container) {
            return;
        }

        // Limit to 2 results like events search
        const limitedResults = newsList.slice(0, 2);

        const newsHtml = limitedResults.map((news, index) => {
            const title = news[`title_${this.currentLanguage}`] || news.title || 'Sin título';
            const imageUrl = news.coverImageUrl || news.imageUrl || 'images/introEF.jpeg';
            const formattedDate = this.formatDate(news.createdAt || news.publishDate);
            
            // Find the index in allNews array using ID comparison (more reliable than object reference)
            let articleIndex = this.allNews.findIndex(article => 
                article.id === news.id || 
                article.id == news.id || 
                (article.id && news.id && String(article.id) === String(news.id))
            );

            // Fallback: if ID comparison fails, try object reference comparison
            if (articleIndex === -1) {
                articleIndex = this.allNews.findIndex(article => article === news);
            }

            // Additional fallback: try finding by title if both above fail
            if (articleIndex === -1) {
                // Object reference failed, trying title comparison
                const newsTitle = news[`title_${this.currentLanguage}`] || news.title;
                articleIndex = this.allNews.findIndex(article => {
                    const articleTitle = article[`title_${this.currentLanguage}`] || article.title;
                    return articleTitle === newsTitle;
                });
            }

            return `
                <div class="news-block news-block-two-col d-flex mt-4" style="cursor: pointer;" onclick="window.noticiasIntegration.displaySelectedArticle(${articleIndex})">
                    <div class="news-block-two-col-image-wrap">
                        <div>
                            <img src="${imageUrl}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                        </div>
                    </div>

                    <div class="news-block-two-col-info">
                        <div class="news-block-title mb-2">
                            <h6 class="news-block-title-link">${title}</h6>
                        </div>

                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${formattedDate}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add clear search option with consistent styling (matching eventos)
        const clearSearchButton = `
            <div class="text-center mt-3">
                <button class="btn btn-sm" onclick="window.noticiasIntegration.clearSidebarSearch()" style="
                    background-color: var(--secondary-color);
                    border-color: var(--secondary-color);
                    color: var(--white-color);
                ">
                    ← ${this.currentLanguage === 'en' ? 'View recent news' : 'Ver noticias recientes'}
                </button>
            </div>
        `;

        container.innerHTML = newsHtml + clearSearchButton;
    }

    displayNoNewsSearchResults(query) {
        const container = document.getElementById('recent-news-sidebar-container');
        if (!container) return;

        const noNewsTitle = this.currentLanguage === 'en' ? 'No news found' : 'No se encontraron noticias';
        const noNewsText = this.currentLanguage === 'en' ? 
            `No news match "${query}"` : 
            `No hay noticias que coincidan con "${query}"`;
        const backButtonText = this.currentLanguage === 'en' ? '← View recent news' : '← Ver noticias recientes';

        container.innerHTML = `
            <div class="no-results-message" style="
                background: var(--section-bg-color);
                border: 1px solid var(--secondary-color);
                border-radius: var(--border-radius-small);
                padding: 20px;
                text-align: center;
                margin: 10px 0;
            ">
                <h5 style="color: var(--secondary-color); margin-bottom: 1rem;">${noNewsTitle}</h5>
                <p style="color: var(--primary-color); margin-bottom: 1rem;">${noNewsText}</p>
                <button class="btn" onclick="document.getElementById('news-search').value=''; window.noticiasIntegration.clearSidebarSearch();" style="
                    background-color: var(--secondary-color);
                    border-color: var(--secondary-color);
                    color: var(--white-color);
                ">
                    ${backButtonText}
                </button>
            </div>
        `;
    }

    updateSearchTitle(isSearching, totalResults = 0, query = '') {
        const titleElement = document.querySelector('h5.mt-5.mb-3');
        if (!titleElement) return;
        
        if (isSearching) {
            // Match eventos pattern: show results count in parentheses
            const searchResultsText = this.currentLanguage === 'en' ? 
                `Search Results (${totalResults})` : 
                `Resultados de Búsqueda (${totalResults})`;
            titleElement.textContent = searchResultsText;
            titleElement.style.color = 'var(--primary-color)';
        } else {
            // Reset to default title
            const recentNewsText = this.currentLanguage === 'en' ? 
                'Recent News' : 
                'Noticias Recientes';
            titleElement.textContent = recentNewsText;
            titleElement.style.color = '';
        }
    }

    clearSidebarSearch() {
        // Clearing news sidebar search
        
        const searchInput = document.getElementById('news-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset to show recent news
        this.loadRecentNewsSidebar();
        this.updateSearchTitle(false);
        
    }

    resetNewsSearch() {
        // Method to match eventos pattern
        this.clearSidebarSearch();
    }

    displaySelectedArticle(articleIndex) {
        // Displaying selected article at index
        
        if (articleIndex < 0 || articleIndex >= this.allNews.length) {
            // Invalid article index
            return;
        }
        
        const selectedArticle = this.allNews[articleIndex];
        // Selected article
        
        // Display the selected article in the main news section
        this.displayMainNews(selectedArticle);
        
        // Update categories based on selected article
        this.displayMainNewsCategories(selectedArticle);
        
        // Refresh the sidebar to show recent news (excluding the now-selected main article)
        this.refreshSidebarAfterSelection(articleIndex);
        
        // Scroll to the beginning of the news section
        const newsSection = document.querySelector('.news-section.section-padding');
        if (newsSection) {
            // Add some offset to account for the header
            const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            const sectionTop = newsSection.offsetTop - headerHeight - 20; // Extra 20px padding
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }
    
    refreshSidebarAfterSelection(selectedIndex) {
        // Refreshing sidebar after article selection, selected index
        
        // Get all articles except the selected one
        const otherArticles = this.allNews.filter((article, index) => index !== selectedIndex);
        
        // Take the first 2 articles for the sidebar
        const sidebarArticles = otherArticles.slice(0, 2);
        
        if (sidebarArticles.length > 0) {
            this.displayRecentNewsSidebar(sidebarArticles);
        }
    }

    loadMoreArticles() {
        // Loading more articles
        
        // Update articles per page in case screen size changed
        this.articlesPerPage = this.getArticlesPerPage();
        
        // Increase the displayed count
        this.displayedArticlesCount += this.articlesPerPage;
        // Loading more articles. Total displayed
        
        // Display all news with append mode
        this.displayAllNewsGrid(this.allNews, true);
    }


    formatTags(news, category) {
        // Get language-specific tags
        const tags = this.currentLanguage === 'en' ? 
            (news.tags_en || news.tags) : 
            (news.tags_es || news.tags);
        
        if (tags && Array.isArray(tags) && tags.length > 0) {
            return tags.map(tag => `
                <a href="#" class="tags-block-link">${tag}</a>
            `).join('');
        } else {
            // Fallback to category if no tags
            return `<a href="#" class="tags-block-link">${category}</a>`;
        }
    }

    // Utility methods
    formatLocation(news) {
        if (news.location_city && news.location_country) {
            return `${news.location_city}, ${news.location_country}`;
        } else if (news.location_city) {
            return news.location_city;
        } else if (news.location) {
            return news.location;
        }
        return '';
    }

    formatDate(dateString) {
        if (!dateString) {
            return this.currentLanguage === 'en' ? 'Date not available' : 'Fecha no disponible';
        }
        
        try {
            const date = new Date(dateString);
            
            if (this.currentLanguage === 'en') {
                // English format: "Month Day, Year"
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                return formattedDate; // Already in "Month Day, Year" format
            } else {
                // Spanish format: "Month Day, Year" (capitalized)
                const formattedDate = date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).replace(/(\d+) de (\w+) de (\d+)/, '$2 $1, $3');
                
                // Capitalize the first letter of the month
                return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            }
        } catch (error) {
            return this.currentLanguage === 'en' ? 'Date not available' : 'Fecha no disponible';
        }
    }

    formatNewsBody(body) {
        if (!body) return '<p>Contenido no disponible.</p>';
        
        // Split into paragraphs and wrap each in <p> tags
        const paragraphs = body.split('\n').filter(p => p.trim());
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    formatAdditionalImages(news) {
        // Checking for additional images in news
        // Available fields
        
        // Check if news has additional images
        const additionalImages = news.newsImages || news.images || news.additionalImages || news.gallery || [];
        
        // newsImages field
        // images field
        // additionalImages field
        // gallery field
        // Final additionalImages
        
        if (!additionalImages || additionalImages.length === 0) {
            // No additional images found
            return ''; // No additional images
        }

        // Found additional images
        // Additional images data
        // First image structure

        // Create image grid similar to eventos2024.html
        let imagesHtml = '';
        
        if (additionalImages.length > 0) {
            // Separate images into two columns
            const column1Images = [];
            const column2Images = [];
            
            // Distribute images alternately between columns
            for (let i = 0; i < additionalImages.length; i++) {
                if (i % 2 === 0) {
                    column1Images.push(additionalImages[i]);
                } else {
                    column2Images.push(additionalImages[i]);
                }
            }

            imagesHtml = `
                <!-- ======================= MORE PHOTOS SECTION ================== -->
                <div class="row mt-4 mb-2">
                    <!-- Column 1 -->
                    <div class="col-lg-6 col-12">
            `;

            // Add images to column 1
            column1Images.forEach((image, index) => {
                const imageUrl = image?.imageUrl || image?.url || image;
                const imageAlt = image?.alt || image?.title || 'Imagen adicional';
                const originalIndex = index * 2; // Original position in the full array
                
                imagesHtml += `
                    <div class="mb-3">
                        <img src="${imageUrl}" class="news-detail-image img-fluid" alt="${imageAlt}" onerror="this.src='images/introEF.jpeg'" style="border-radius: 8px; width: 100%; cursor: pointer;" onclick="openImageModal(${originalIndex})">
                    </div>
                `;
            });

            imagesHtml += `
                    </div>
                    <!-- Column 2 -->
                    <div class="col-lg-6 col-12">
            `;

            // Add images to column 2
            column2Images.forEach((image, index) => {
                const imageUrl = image?.imageUrl || image?.url || image;
                const imageAlt = image?.alt || image?.title || 'Imagen adicional';
                const originalIndex = (index * 2) + 1; // Original position in the full array
                
                imagesHtml += `
                    <div class="mb-3">
                        <img src="${imageUrl}" class="news-detail-image img-fluid" alt="${imageAlt}" onerror="this.src='images/introEF.jpeg'" style="border-radius: 8px; width: 100%; cursor: pointer;" onclick="openImageModal(${originalIndex})">
                    </div>
                `;
            });

            imagesHtml += `
                    </div>
                </div>
                
                <!-- ======================= IMAGE MODAL ================== -->
                <div id="imageModal" class="image-modal" style="display: none;">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <button class="modal-close" onclick="closeImageModal()">&times;</button>
                        <button class="modal-nav modal-prev" onclick="previousImage()">&#8249;</button>
                        <img id="modalImage" src="" alt="" class="modal-image">
                        <button class="modal-nav modal-next" onclick="nextImage()">&#8250;</button>
                        <div class="modal-counter">
                            <span id="currentImageIndex">1</span> / <span id="totalImages">1</span>
                        </div>
                    </div>
                </div>
                
                <style>
                    .image-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 9999;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .modal-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        cursor: pointer;
                    }
                    
                    .modal-content {
                        position: relative;
                        max-width: 90%;
                        max-height: 90%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .modal-image {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 8px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    }
                    
                    .modal-close {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.7);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        font-size: 28px;
                        cursor: pointer;
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.3s ease;
                        z-index: 10001;
                    }
                    
                    .modal-close:hover {
                        background: rgba(255, 255, 255, 0.2);
                        border-color: rgba(255, 255, 255, 0.6);
                        transform: scale(1.1);
                    }
                    
                    .modal-nav {
                        position: fixed;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(0, 0, 0, 0.7);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.3s ease;
                        font-weight: bold;
                        z-index: 10001;
                    }
                    
                    .modal-nav:hover {
                        background: rgba(255, 255, 255, 0.2);
                        border-color: rgba(255, 255, 255, 0.6);
                        transform: translateY(-50%) scale(1.1);
                    }
                    
                    .modal-prev {
                        left: 30px;
                    }
                    
                    .modal-next {
                        right: 30px;
                    }
                    
                    .modal-counter {
                        position: fixed;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        color: white;
                        font-size: 16px;
                        font-weight: bold;
                        background: rgba(0, 0, 0, 0.8);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        padding: 10px 20px;
                        border-radius: 25px;
                        z-index: 10001;
                    }
                    
                    /* Tablet responsiveness */
                    @media (max-width: 992px) {
                        .modal-nav {
                            width: 55px;
                            height: 55px;
                            font-size: 22px;
                        }
                        
                        .modal-prev {
                            left: 20px;
                        }
                        
                        .modal-next {
                            right: 20px;
                        }
                        
                        .modal-close {
                            top: 15px;
                            right: 15px;
                            width: 45px;
                            height: 45px;
                            font-size: 24px;
                        }
                        
                        .modal-counter {
                            bottom: 25px;
                            font-size: 15px;
                            padding: 8px 16px;
                        }
                    }
                    
                    /* Mobile responsiveness */
                    @media (max-width: 768px) {
                        .modal-nav {
                            width: 50px;
                            height: 50px;
                            font-size: 20px;
                        }
                        
                        .modal-prev {
                            left: 15px;
                        }
                        
                        .modal-next {
                            right: 15px;
                        }
                        
                        .modal-close {
                            top: 15px;
                            right: 15px;
                            font-size: 22px;
                            width: 42px;
                            height: 42px;
                        }
                        
                        .modal-counter {
                            bottom: 20px;
                            font-size: 14px;
                            padding: 8px 14px;
                        }
                    }
                    
                    /* Small mobile responsiveness */
                    @media (max-width: 480px) {
                        .modal-nav {
                            width: 45px;
                            height: 45px;
                            font-size: 18px;
                        }
                        
                        .modal-prev {
                            left: 10px;
                        }
                        
                        .modal-next {
                            right: 10px;
                        }
                        
                        .modal-close {
                            top: 10px;
                            right: 10px;
                            font-size: 20px;
                            width: 38px;
                            height: 38px;
                        }
                        
                        .modal-counter {
                            bottom: 15px;
                            font-size: 13px;
                            padding: 6px 12px;
                        }
                    }
                </style>
            `;

            // Add photo credit if available
            const photoCredit = news.photoCredit || news.photographer;
            if (photoCredit) {
                imagesHtml += `<p>Fotos tomadas por ${photoCredit}📸</p>`;
            }

            // Setup modal after images are rendered
            setTimeout(() => {
                this.setupImageModal(additionalImages);
            }, 100);
        }

        return imagesHtml;
    }

    // Modal functionality for image gallery
    setupImageModal(images) {
        // Store images globally for modal navigation
        window.modalImages = images;
        window.currentModalIndex = 0;

        // Modal functions
        window.openImageModal = (index) => {
            window.currentModalIndex = index;
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const currentIndex = document.getElementById('currentImageIndex');
            const totalImages = document.getElementById('totalImages');

            if (modal && modalImage && images[index]) {
                const image = images[index];
                const imageUrl = image?.imageUrl || image?.url || image;
                const imageAlt = image?.alt || image?.title || 'Imagen adicional';

                modalImage.src = imageUrl;
                modalImage.alt = imageAlt;
                currentIndex.textContent = index + 1;
                totalImages.textContent = images.length;
                modal.style.display = 'flex';

                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
            }
        };

        window.closeImageModal = () => {
            const modal = document.getElementById('imageModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };

        window.nextImage = () => {
            if (window.modalImages && window.modalImages.length > 0) {
                window.currentModalIndex = (window.currentModalIndex + 1) % window.modalImages.length;
                window.openImageModal(window.currentModalIndex);
            }
        };

        window.previousImage = () => {
            if (window.modalImages && window.modalImages.length > 0) {
                window.currentModalIndex = (window.currentModalIndex - 1 + window.modalImages.length) % window.modalImages.length;
                window.openImageModal(window.currentModalIndex);
            }
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('imageModal');
            if (modal && modal.style.display === 'flex') {
                switch(e.key) {
                    case 'Escape':
                        window.closeImageModal();
                        break;
                    case 'ArrowRight':
                        window.nextImage();
                        break;
                    case 'ArrowLeft':
                        window.previousImage();
                        break;
                }
            }
        });

        // Close modal when clicking overlay
        const modal = document.getElementById('imageModal');
        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', window.closeImageModal);
            }
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.noticiasIntegration = new NoticiasIntegration();
});
