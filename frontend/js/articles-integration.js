/**
 * Articles Integration Script
 * Handles dynamic loading of articles from CMS
 */

class ArticlesIntegration {
    constructor() {
        this.articlesContainer = null;
        this.loadingElement = null;
        this.currentLanguage = 'es';
        this.allArticles = [];
        this.showingAllArticles = false;
        this.init();
    }

    init() {
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.articlesContainer = document.getElementById('articles-container');
            this.loadingElement = document.getElementById('articles-loading');
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            // Load articles
            this.loadArticles();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadArticles();
            });
        });
    }

    async loadArticles() {
        if (!this.articlesContainer) return;

        try {
            // Show loading state
            this.showLoading();

            // Loading articles

            // Fetch articles from API
            const articles = await EFAPI.articles.getArticles({
                limit: 100, // Get all articles
                lang: this.currentLanguage
            });
            
            // Handle both paginated response format and direct array format
            let articlesList = [];
            if (Array.isArray(articles)) {
                articlesList = articles;
            } else if (articles && articles.data) {
                articlesList = articles.data;
            } else {
                articlesList = [];
            }
            
            // Articles loaded
            
            // Store all articles
            this.allArticles = articlesList;
            this.showingAllArticles = false;
            
            // Display articles (initially show only first 3)
            this.displayArticles(articlesList);

        } catch (error) {
            console.error('❌ Error loading articles:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        this.articlesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="loading-spinner" id="articles-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando artículos...</span>
                    </div>
                    <p class="mt-2">Cargando artículos...</p>
                </div>
            </div>
        `;
    }

    displayArticles(articles) {
        if (!articles || articles.length === 0) {
            this.hideSection();
            return;
        }

        // Determine how many articles to show
        const articlesToShow = this.showingAllArticles ? articles : articles.slice(0, 3);
        
        let html = '';
        let delay = 100;

        articlesToShow.forEach((article, index) => {
            const articleHtml = this.createArticleHTML(article, delay);
            html += articleHtml;
            delay += 100; // Increment delay for AOS animation
        });

        // Add "More Articles" button if there are more than 3 articles and not showing all
        if (articles.length > 3 && !this.showingAllArticles) {
            html += this.createMoreArticlesButton();
        }

        this.articlesContainer.innerHTML = html;

        // Re-initialize AOS animations for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    createArticleHTML(article, delay) {
        const title = this.currentLanguage === 'en' ? article.title_en : article.title;
        const content = this.currentLanguage === 'en' ? article.body_en : article.body_es;
        const imageUrl = article.imageUrl || 'images/blogs/default-article.jpg';
        const author = article.author || 'Autor desconocido';
        const date = this.formatDate(article.date);
        const linkUrl = article.linkUrl || '#';

        // Truncate content for preview
        const previewContent = this.truncateText(content, 200);

        return `
            <div class="card" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="image-section">
                    <img src="${imageUrl}" alt="${title}" loading="lazy">
                </div>
                <div class="article">
                    <h4>${title}</h4>
                    <p>${previewContent}</p>
                </div>
                <div class="blog-view">
                    <a href="${linkUrl}" target="_blank" class="button-blog">Leer más</a>
                </div>
                <div class="posted-date">
                    <p>Por ${author} | ${date}</p>
                </div>
            </div>
        `;
    }

    createMoreArticlesButton() {
        // Get translation from the language switcher if available
        let buttonText = this.currentLanguage === 'en' ? 'More Articles' : 'Más Artículos';
        
        if (window.languageSwitcher && window.languageSwitcher.translations) {
            const translations = window.languageSwitcher.translations;
            const currentLang = this.currentLanguage;
            if (translations[currentLang] && translations[currentLang].masArticulos) {
                buttonText = translations[currentLang].masArticulos;
            }
        }
        
        return `
            <div class="col-12 text-center mt-4" data-aos="fade-up" data-aos-delay="400">
                <button class="btn btn-primary custom-btn" onclick="articlesIntegration.showAllArticles()">
                    ${buttonText}
                </button>
            </div>
        `;
    }

    showAllArticles() {
        // Showing all articles
        this.showingAllArticles = true;
        this.displayArticles(this.allArticles);
    }

    formatDate(dateString) {
        if (!dateString) return 'Fecha no disponible';
        
        try {
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            if (this.currentLanguage === 'en') {
                return date.toLocaleDateString('en-US', options);
            } else {
                return date.toLocaleDateString('es-ES', options);
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Fecha no disponible';
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showError(error) {
        const errorTitle = this.currentLanguage === 'en' ? 'Error loading articles' : 'Error al cargar los artículos';
        const errorMessage = error.message || (this.currentLanguage === 'en' ? 'Network error - please check your connection' : 'Error de red - por favor verifica tu conexión');
        const retryText = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';
        
        this.articlesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="error-modal network-error">
                    <div class="error-modal-icon">
                        <i class="bi-wifi-off"></i>
                    </div>
                    <h3>${errorTitle}</h3>
                    <p>${errorMessage}</p>
                    <button class="btn-retry" onclick="articlesIntegration.loadArticles()">
                        ${retryText}
                    </button>
                </div>
            </div>
        `;
    }

    hideSection() {
        // No articles data available, hiding articles section
        const articlesSection = document.querySelector('.blog-section');
        if (articlesSection) {
            articlesSection.style.display = 'none';
            // Articles section hidden successfully
        }
    }

    showEmptyState() {
        this.articlesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-state">
                    <div class="alert alert-info" role="alert">
                        <h4 class="alert-heading">No hay artículos disponibles</h4>
                        <p>Por favor, inténtalo más tarde.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize articles integration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.articlesIntegration = new ArticlesIntegration();
});

// Export for global access
window.ArticlesIntegration = ArticlesIntegration;
