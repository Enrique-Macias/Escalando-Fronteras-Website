/**
 * Acknowledgments Section Integration
 * Handles language switching for the acknowledgments section
 */

class AcknowledgmentsIntegration {
    constructor() {
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        // Get current language from language service or localStorage
        this.getCurrentLanguage();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.updateLanguageContent();
        });

        // Initial language content update
        this.updateLanguageContent();
    }

    getCurrentLanguage() {
        // Try to get language from language switcher first
        if (window.languageSwitcher && window.languageSwitcher.getCurrentLanguage) {
            this.currentLanguage = window.languageSwitcher.getCurrentLanguage();
        }
        // Try to get language from language service
        else if (window.languageService && window.languageService.getCurrentLanguage) {
            this.currentLanguage = window.languageService.getCurrentLanguage();
        } else {
            // Fallback to localStorage
            try {
                const storedLang = localStorage.getItem('ef-language');
                if (storedLang && ['es', 'en'].includes(storedLang)) {
                    this.currentLanguage = storedLang;
                }
            } catch (error) {
                console.warn('Could not access localStorage for language:', error);
            }
        }
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

        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AcknowledgmentsIntegration();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AcknowledgmentsIntegration();
    });
} else {
    new AcknowledgmentsIntegration();
}
