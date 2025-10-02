/**
 * Language Switcher
 * Handles language dropdown functionality and content switching
 */

class EF_LanguageSwitcher {
    constructor() {
        this.currentLanguage = 'es';
        this.supportedLanguages = ['es', 'en'];
        this.init();
    }

    init() {
        // Get current language from localStorage or default to Spanish
        this.getCurrentLanguage();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateLanguageDisplay();
        this.updateLanguageContent();
    }

    getCurrentLanguage() {
        try {
            const storedLang = localStorage.getItem('ef-language');
            if (storedLang && this.supportedLanguages.includes(storedLang)) {
                this.currentLanguage = storedLang;
            }
        } catch (error) {
            console.warn('Could not access localStorage:', error);
        }
    }

    setCurrentLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        this.currentLanguage = lang;
        
        try {
            localStorage.setItem('ef-language', lang);
        } catch (error) {
            console.warn('Could not store language preference:', error);
        }

        this.updateLanguageDisplay();
        this.updateLanguageContent();
        this.triggerLanguageChange();
    }

    setupEventListeners() {
        // Handle language dropdown clicks
        const languageOptions = document.querySelectorAll('.language-option');
        
        if (languageOptions.length === 0) {
            console.warn('No language options found in dropdown');
            return;
        }
        
        // Force show all dropdown items (in case CSS is hiding them)
        languageOptions.forEach((option) => {
            option.style.display = '';
            option.style.visibility = 'visible';
            option.style.opacity = '1';
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.setCurrentLanguage(lang);
            });
        });
    }

    updateLanguageDisplay() {
        // Update current language display
        const currentLangElement = document.getElementById('current-language');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLanguage.toUpperCase();
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    updateLanguageContent() {
        // Update all elements with data-lang attributes
        const elements = document.querySelectorAll('[data-lang]');
        
        elements.forEach(element => {
            const elementLang = element.getAttribute('data-lang');
            
            if (elementLang === this.currentLanguage) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }

    triggerLanguageChange() {
        // Trigger custom event for other components
        const event = new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize when DOM is ready - prevent multiple initializations
if (!window.efLanguageSwitcher) {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.efLanguageSwitcher) {
            window.efLanguageSwitcher = new EF_LanguageSwitcher();
            window.languageSwitcher = window.efLanguageSwitcher; // Keep compatibility
        }
    });

    // Also initialize if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.efLanguageSwitcher) {
                window.efLanguageSwitcher = new EF_LanguageSwitcher();
                window.languageSwitcher = window.efLanguageSwitcher; // Keep compatibility
            }
        });
    } else {
        if (!window.efLanguageSwitcher) {
            window.efLanguageSwitcher = new EF_LanguageSwitcher();
            window.languageSwitcher = window.efLanguageSwitcher; // Keep compatibility
        }
    }
}
