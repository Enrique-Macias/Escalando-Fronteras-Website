/**
 * Testimonials Integration Script
 * Handles dynamic loading of testimonials from CMS
 */

class TestimonialsIntegration {
    constructor() {
        this.testimonialsContainer = null;
        this.loadingElement = null;
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.testimonialsContainer = document.getElementById('testimonials-container');
            this.loadingElement = document.getElementById('testimonials-loading');
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            // Load testimonials
            this.loadTestimonials();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadTestimonials();
            });
        });
    }

    async loadTestimonials() {
        if (!this.testimonialsContainer) return;

        try {
            // Show loading state
            this.showLoading();

            console.log('🔄 Loading testimonials...');
            console.log('🌐 API Base URL:', EFAPI.client.baseURL);
            console.log('🌍 Current Language:', this.currentLanguage);

            // Fetch testimonials from API
            const testimonials = await EFAPI.testimonials.getTestimonials({
                limit: 100, // Get all testimonials
                lang: this.currentLanguage
            });
            
            // Handle both paginated response format and direct array format
            let testimonialsList = [];
            if (Array.isArray(testimonials)) {
                testimonialsList = testimonials;
            } else if (testimonials && testimonials.data) {
                testimonialsList = testimonials.data;
            } else {
                testimonialsList = [];
            }
            
            console.log('✅ Testimonials loaded:', testimonialsList);
            
            // Display testimonials
            this.displayTestimonials(testimonialsList);

        } catch (error) {
            console.error('❌ Error loading testimonials:', error);
            this.showError(error);
        }
    }

    showLoading() {
        const testimonialsTitle = this.currentLanguage === 'en' ? 'Testimonials' : 'Testimonios';
        const loadingText = this.currentLanguage === 'en' ? 'Loading testimonials...' : 'Cargando testimonios...';
        
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        this.testimonialsContainer.innerHTML = `
            <div class="col-lg-8 col-12 mx-auto">
                <h2 class="mb-lg-3">${testimonialsTitle}</h2>
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">${loadingText}</span>
                    </div>
                    <p class="mt-2">${loadingText}</p>
                </div>
            </div>
        `;
    }

    displayTestimonials(testimonials) {
        if (!testimonials || testimonials.length === 0) {
            this.hideSection();
            return;
        }

        // Create carousel HTML
        const carouselHTML = this.createCarouselHTML(testimonials);
        this.testimonialsContainer.innerHTML = carouselHTML;

        // Initialize Bootstrap carousel
        this.initializeCarousel();
    }

    createCarouselHTML(testimonials) {
        const carouselItems = testimonials.map((testimonial, index) => {
            const isActive = index === 0 ? 'active' : '';
            const author = testimonial.author || (this.currentLanguage === 'en' ? 'Unknown Author' : 'Autor desconocido');
            const role = this.currentLanguage === 'en' ? testimonial.role_en : testimonial.role;
            const content = this.currentLanguage === 'en' ? testimonial.body_en : testimonial.body_es;
            const imageUrl = testimonial.imageUrl || 'images/avatar/default-avatar.jpg';
            
            // Truncate content if too long to prevent overflow
            const maxLength = 200; // Maximum characters for testimonial
            const truncatedContent = content && content.length > maxLength 
                ? content.substring(0, maxLength) + '...' 
                : content;

            return `
                <div class="carousel-item ${isActive}">
                    <div class="carousel-caption">
                        <h4 class="carousel-title">${truncatedContent}</h4>
                        <small class="carousel-name">
                            <span class="carousel-name-title">${author}</span>, ${role || (this.currentLanguage === 'en' ? 'Member' : 'Miembro')}
                        </small>
                    </div>
                </div>
            `;
        }).join('');

        const carouselIndicators = testimonials.map((testimonial, index) => {
            const isActive = index === 0 ? 'active' : '';
            const imageUrl = testimonial.imageUrl || 'images/avatar/default-avatar.jpg';
            const author = testimonial.author || 'Autor desconocido';

            return `
                <li data-bs-target="#testimonial-carousel" data-bs-slide-to="${index}" class="${isActive}">
                    <img src="${imageUrl}" class="img-fluid rounded-circle avatar-image" alt="${author}">
                </li>
            `;
        }).join('');

        // Get translated title
        const testimonialsTitle = this.currentLanguage === 'en' ? 'Testimonials' : 'Testimonios';
        
        return `
            <div class="col-lg-8 col-12 mx-auto">
                <h2 class="mb-lg-3">${testimonialsTitle}</h2>
                
                <div id="testimonial-carousel" class="carousel carousel-fade slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${carouselItems}
                    </div>
                    
                    <ol class="carousel-indicators">
                        ${carouselIndicators}
                    </ol>
                </div>
            </div>
        `;
    }

    initializeCarousel() {
        // Initialize Bootstrap carousel
        const carouselElement = document.getElementById('testimonial-carousel');
        if (carouselElement && typeof bootstrap !== 'undefined') {
            const carousel = new bootstrap.Carousel(carouselElement, {
                interval: 5000, // Auto-advance every 5 seconds
                wrap: true,
                keyboard: true
            });
        }
    }

    showError(error) {
        const testimonialsTitle = this.currentLanguage === 'en' ? 'Testimonials' : 'Testimonios';
        const errorHeading = this.currentLanguage === 'en' ? 'Error loading testimonials' : 'Error al cargar los testimonios';
        const errorUnknown = this.currentLanguage === 'en' ? 'Unknown error' : 'Error desconocido';
        const retryButton = this.currentLanguage === 'en' ? 'Try again' : 'Intentar de nuevo';
        
        this.testimonialsContainer.innerHTML = `
            <div class="col-lg-8 col-12 mx-auto">
                <h2 class="mb-lg-3">${testimonialsTitle}</h2>
                <div class="text-center">
                    <div class="alert alert-warning" role="alert">
                        <h4 class="alert-heading">${errorHeading}</h4>
                        <p>${error.message || errorUnknown}</p>
                        <hr>
                        <button class="btn btn-primary" onclick="testimonialsIntegration.loadTestimonials()">
                            ${retryButton}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    hideSection() {
        console.log('🚫 No testimonials data available, hiding testimonials section');
        const testimonialsSection = document.querySelector('.testimonial-section');
        if (testimonialsSection) {
            testimonialsSection.style.display = 'none';
            console.log('✅ Testimonials section hidden successfully');
        }
    }

    showEmptyState() {
        this.testimonialsContainer.innerHTML = `
            <div class="col-lg-8 col-12 mx-auto">
                <h2 class="mb-lg-3">Testimonios</h2>
                <div class="text-center">
                    <div class="alert alert-info" role="alert">
                        <h4 class="alert-heading">No hay testimonios disponibles</h4>
                        <p>Por favor, inténtalo más tarde.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize testimonials integration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.testimonialsIntegration = new TestimonialsIntegration();
});

// Export for global access
window.TestimonialsIntegration = TestimonialsIntegration;
