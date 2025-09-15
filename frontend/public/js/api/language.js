/**
 * Language Utility Service
 * Handles language switching and content localization
 */

class LanguageService {
    constructor() {
        this.currentLang = this.getStoredLanguage() || 'es';
        this.supportedLanguages = ['es', 'en'];
        this.defaultLanguage = 'es';
    }

    /**
     * Get stored language preference from localStorage
     * @returns {string|null} - Stored language or null
     */
    getStoredLanguage() {
        try {
            return localStorage.getItem('ef-language');
        } catch (error) {
            console.warn('Could not access localStorage:', error);
            return null;
        }
    }

    /**
     * Store language preference in localStorage
     * @param {string} lang - Language code
     */
    setStoredLanguage(lang) {
        try {
            localStorage.setItem('ef-language', lang);
        } catch (error) {
            console.warn('Could not store language preference:', error);
        }
    }

    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Set current language
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}. Using default: ${this.defaultLanguage}`);
            lang = this.defaultLanguage;
        }

        this.currentLang = lang;
        this.setStoredLanguage(lang);
        this.updatePageLanguage();
        this.triggerLanguageChange();
    }

    /**
     * Update HTML lang attribute
     */
    updatePageLanguage() {
        document.documentElement.lang = this.currentLang;
    }

    /**
     * Trigger language change event
     */
    triggerLanguageChange() {
        const event = new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get localized content from an object
     * @param {Object} content - Content object with language variants
     * @param {string} field - Field name (e.g., 'title', 'content')
     * @returns {string} - Localized content
     */
    getLocalizedContent(content, field) {
        if (!content || !field) return '';

        // Try to get the localized version first
        const localizedField = `${field}_${this.currentLang}`;
        if (content[localizedField]) {
            return content[localizedField];
        }

        // Fallback to default field
        if (content[field]) {
            return content[field];
        }

        // Fallback to default language if current language is not default
        if (this.currentLang !== this.defaultLanguage) {
            const defaultField = `${field}_${this.defaultLanguage}`;
            if (content[defaultField]) {
                return content[defaultField];
            }
        }

        return '';
    }

    /**
     * Get localized text for common UI elements
     * @param {string} key - Text key
     * @returns {string} - Localized text
     */
    getUIText(key) {
        const texts = {
            es: {
                'read_more': 'Leer más',
                'read_less': 'Leer menos',
                'load_more': 'Cargar más',
                'search': 'Buscar',
                'search_placeholder': 'Buscar...',
                'no_results': 'No se encontraron resultados',
                'loading': 'Cargando...',
                'error_loading': 'Error al cargar los datos',
                'try_again': 'Intentar de nuevo',
                'published_on': 'Publicado el',
                'by': 'por',
                'in': 'en',
                'category': 'Categoría',
                'tags': 'Etiquetas',
                'share': 'Compartir',
                'upcoming_events': 'Próximos eventos',
                'past_events': 'Eventos pasados',
                'team_members': 'Miembros del equipo',
                'testimonials': 'Testimonios',
                'recent_news': 'Noticias recientes',
                'featured_articles': 'Artículos destacados'
            },
            en: {
                'read_more': 'Read more',
                'read_less': 'Read less',
                'load_more': 'Load more',
                'search': 'Search',
                'search_placeholder': 'Search...',
                'no_results': 'No results found',
                'loading': 'Loading...',
                'error_loading': 'Error loading data',
                'try_again': 'Try again',
                'published_on': 'Published on',
                'by': 'by',
                'in': 'in',
                'category': 'Category',
                'tags': 'Tags',
                'share': 'Share',
                'upcoming_events': 'Upcoming events',
                'past_events': 'Past events',
                'team_members': 'Team members',
                'testimonials': 'Testimonials',
                'recent_news': 'Recent news',
                'featured_articles': 'Featured articles'
            }
        };

        return texts[this.currentLang]?.[key] || texts[this.defaultLanguage]?.[key] || key;
    }

    /**
     * Format date according to current language
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date
     */
    formatDate(date) {
        const dateObj = new Date(date);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return dateObj.toLocaleDateString(this.currentLang === 'es' ? 'es-ES' : 'en-US', options);
    }

    /**
     * Format date and time according to current language
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date and time
     */
    formatDateTime(date) {
        const dateObj = new Date(date);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return dateObj.toLocaleDateString(this.currentLang === 'es' ? 'es-ES' : 'en-US', options);
    }
}

// Create singleton instance
const languageService = new LanguageService();

// Export for use in other modules
window.LanguageService = LanguageService;
window.languageService = languageService;
