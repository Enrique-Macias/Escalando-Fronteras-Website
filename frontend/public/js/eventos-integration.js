/**
 * Eventos Integration - Dynamic content loading for eventos.html
 * Handles events from database with bilingual support and responsive pagination
 */

class EventosIntegration {
    constructor() {
        this.currentLanguage = 'es'; // Default language
        this.allEvents = [];
        this.displayedEvents = [];
        this.currentPage = 1;
        this.eventsPerPage = this.getEventsPerPage();
        this.selectedEventId = null;
        this.isLoading = false;
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
        
        // Update events per page on window resize
        window.addEventListener('resize', () => {
            this.eventsPerPage = this.getEventsPerPage();
            this.updatePaginationSettings();
        });
    }
    
    async init() {
        // EventosIntegration initializing
        
        // Wait for API to be ready
        await this.waitForAPI();
        
        // Check if specific event was selected
        this.selectedEventId = sessionStorage.getItem('selectedEventId');
        // Selected event ID
        
        // Load events
        await this.loadEvents();
        
        // Setup search functionality
        this.setupSearch();
        
        // Setup show more button
        this.setupShowMoreButton();
        
        // Setup language listener
        this.setupLanguageListener();
    }
    
    setupLanguageListener() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            // Eventos language changed
            this.currentLanguage = event.detail.language;
            this.loadEvents(); // Reload events with new language
        });
        
        // Also listen for manual language updates from eventos.html
        document.addEventListener('DOMContentLoaded', () => {
            // Check if language was updated from the eventos.html language switcher
            setTimeout(() => {
                if (window.eventosLanguageSwitcher && window.eventosLanguageSwitcher.currentLanguage) {
                    this.currentLanguage = window.eventosLanguageSwitcher.currentLanguage;
                }
            }, 1000);
        });
    }
    
    async waitForAPI() {
        return new Promise((resolve) => {
            const checkAPI = () => {
                if (typeof window.EFAPI !== 'undefined' && window.EFAPI.events) {
                    // API ready
                    
                    // Get current language from API service
                    if (window.EFAPI.language) {
                        this.currentLanguage = window.EFAPI.language.getCurrentLanguage();
                        // Language from API service
                    }
                    
                    resolve();
                } else {
                    // Waiting for API
                    setTimeout(checkAPI, 100);
                }
            };
            checkAPI();
        });
    }
    
    getEventsPerPage() {
        // Mobile: 3 events, Desktop: 6 events
        return window.innerWidth <= 768 ? 3 : 6;
    }
    
    updatePaginationSettings() {
        // Recalculate pagination when screen size changes
        if (this.displayedEvents.length > 0) {
            this.displayAllEventsGrid();
        }
    }
    
    async loadEvents() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            // Loading events
            
            // Load events from API
            const response = await window.EFAPI.events.getEvents(100); // Get more events for better selection
            // Events API response
            
            // Handle different response formats
            let events;
            if (response && response.success && Array.isArray(response.events)) {
                // New API format: { success: true, events: [...] }
                events = response.events;
            } else if (Array.isArray(response)) {
                // Old API format: direct array
                events = response;
            } else {
                throw new Error('Invalid events data received');
            }
            
            if (!Array.isArray(events)) {
                throw new Error('Events data is not an array');
            }
            
            this.allEvents = events;
            // Total events loaded
            
            // Load main event (selected or latest)
            await this.loadMainEvent();
            
            // Load sidebar content
            await this.loadSidebarContent();
            
            // Update sidebar titles with current language
            this.translateSidebarContent();
            
            // Load all events grid
            this.displayAllEventsGrid();
            
        } catch (error) {
            this.showError('Error loading events');
        } finally {
            this.isLoading = false;
        }
    }
    
    async loadMainEvent() {
        let mainEvent = null;
        
        if (this.selectedEventId) {
            // Looking for selected event
            
            // Try to find the event in loaded events first
            mainEvent = this.allEvents.find(event => 
                event.id == this.selectedEventId || parseInt(event.id) === parseInt(this.selectedEventId)
            );
            
            // If not found in loaded events, try to get it directly from API
            if (!mainEvent) {
                try {
                    // Event not found in list, fetching directly
                    mainEvent = await window.EFAPI.events.getEventById(this.selectedEventId);
                } catch (error) {
                    // Could not fetch selected event
                }
            }
        }
        
        // If no selected event or not found, use the latest event
        if (!mainEvent && this.allEvents.length > 0) {
            mainEvent = this.allEvents[0]; // Assuming events are ordered by date
            // Using latest event as main event
        }
        
        if (mainEvent) {
            this.displayMainEvent(mainEvent);
        } else {
            this.showError('No events available');
        }
    }
    
    displayMainEvent(event) {
        // Displaying main event
        
        // Clear the selected event ID from sessionStorage after displaying it
        if (this.selectedEventId) {
            sessionStorage.removeItem('selectedEventId');
            // Cleared selectedEventId from sessionStorage
        }
        
        const container = document.getElementById('main-event-content');
        if (!container) return;
        
        // Get event details with language support
        const title = this.getLocalizedField(event, 'title') || 'Sin título';
        const description = this.getLocalizedField(event, 'description') || 'Sin descripción';
        const category = this.getLocalizedField(event, 'category') || 'General';
        const tags = this.getLocalizedField(event, 'tags') || [];
        const location = this.getEventLocation(event);
        const date = this.formatDate(event.date || event.createdAt || event.created_at);
        const author = event.author || 'Escalando Fronteras';
        const mainImage = event.coverImageUrl || event.image || event.imageUrl || 'images/introEF.jpeg';
        
        // Get quote/phrase with language support
        const quote = this.getLocalizedField(event, 'quote') || this.getLocalizedField(event, 'phrase') || '';
        
        // Get credits with language support
        const credits = this.getLocalizedField(event, 'credits') || '';
        
        // Generate additional images
        const additionalImages = this.formatAdditionalImages(event.eventImages || event.images || []);
        
        // Generate tags HTML
        const tagsHtml = Array.isArray(tags) ? 
            tags.map(tag => `<a href="#" class="tags-block-link">${tag}</a>`).join('') :
            `<a href="#" class="tags-block-link">${tags}</a>`;
        
        
        const eventHtml = `
            <div class="news-block">
                <div class="news-block-top">
                    <img src="${mainImage}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">

                    <div class="news-category-block">
                        ${location ? `
                            <a href="#" class="category-block-link">
                                <i class="bi-geo-alt me-1"></i>
                                ${location}
                            </a>
                        ` : ''}
                    </div>
                </div>

                <div class="news-block-info">
                    <div class="d-flex mt-2">
                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${date}
                            </p>
                        </div>

                        <div class="news-block-author mx-5">
                            <p>
                                <i class="bi-person custom-icon me-1"></i>
                                ${this.currentLanguage === 'en' ? 'By' : 'Por'} ${author}
                            </p>
                        </div>
                    </div>

                    <div class="news-block-title mb-2">
                        <h4>${title}</h4>
                    </div>

                    <div class="news-block-body">
                        ${this.formatDescription(description)}
                        
                        ${quote ? `
                            <!-- ======================= QUOTE SECTION ================== -->
                            <blockquote>${quote}</blockquote>
                        ` : ''}
                    </div>
                    
                    ${additionalImages}
                    
                    ${credits ? `
                        <p class="mt-3 text-muted">${credits}</p>
                    ` : ''}

                    <div class="social-share border-top mt-5 py-4 d-flex flex-wrap align-items-center">
                        <div class="tags-block me-auto">
                            ${tagsHtml}
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
        
        container.innerHTML = eventHtml;
        
        // Setup image modal if there are additional images
        if (event.eventImages && event.eventImages.length > 0) {
            this.setupImageModal();
        }
    }
    
    formatAdditionalImages(images) {
        if (!images || images.length === 0) {
            return '';
        }
        
        // Formatting additional images
        
        let imagesHtml = '';
        const leftColumnImages = [];
        const rightColumnImages = [];
        
        // Distribute images alternately between columns
        images.forEach((image, index) => {
            if (index % 2 === 0) {
                leftColumnImages.push(image);
            } else {
                rightColumnImages.push(image);
            }
        });
        
        // Generate HTML for left column
        const leftColumnHtml = leftColumnImages.map((image, index) => {
            const imageUrl = image?.imageUrl || image?.url || image;
            const imageAlt = image?.alt || image?.title || 'Imagen del evento';
            const globalIndex = index * 2; // Calculate global index for modal
            
            return `
                <div class="mb-3">
                    <img src="${imageUrl}" 
                         class="news-detail-image img-fluid clickable-image" 
                         alt="${imageAlt}"
                         data-image-index="${globalIndex}"
                         style="border-radius: 8px; cursor: pointer;"
                         onerror="this.style.display='none'">
                </div>
            `;
        }).join('');
        
        // Generate HTML for right column
        const rightColumnHtml = rightColumnImages.map((image, index) => {
            const imageUrl = image?.imageUrl || image?.url || image;
            const imageAlt = image?.alt || image?.title || 'Imagen del evento';
            const globalIndex = (index * 2) + 1; // Calculate global index for modal
            
            return `
                <div class="mb-3">
                    <img src="${imageUrl}" 
                         class="news-detail-image img-fluid clickable-image" 
                         alt="${imageAlt}"
                         data-image-index="${globalIndex}"
                         style="border-radius: 8px; cursor: pointer;"
                         onerror="this.style.display='none'">
                </div>
            `;
        }).join('');
        
        imagesHtml = `
            <div class="row mt-5 mb-4" style="row-gap: 5px;">
                <div class="col-lg-6 col-12" style="align-items: flex-start;">
                    ${leftColumnHtml}
                </div>
                <div class="col-lg-6 col-12" style="align-items: flex-start;">
                    ${rightColumnHtml}
                </div>
            </div>
        `;
        
        return imagesHtml;
    }
    
    setupImageModal() {
        // Add modal HTML to body if not exists
        if (!document.getElementById('imageModal')) {
            const modalHtml = `
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
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
        
        // Setup click handlers for images
        document.querySelectorAll('.clickable-image').forEach(img => {
            img.addEventListener('click', (e) => {
                const imageIndex = parseInt(e.target.getAttribute('data-image-index'));
                this.openImageModal(imageIndex);
            });
        });
        
        // Setup keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('imageModal');
            if (modal && modal.style.display === 'flex') {
                switch(e.key) {
                    case 'Escape':
                        this.closeImageModal();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
        
        // Setup overlay click to close
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('imageModal');
            const overlay = document.querySelector('.modal-overlay');
            if (modal && modal.style.display === 'flex' && e.target === overlay) {
                this.closeImageModal();
            }
        });
    }
    
    openImageModal(startIndex = 0) {
        this.currentImageIndex = startIndex;
        this.modalImages = Array.from(document.querySelectorAll('.clickable-image'));
        this.updateModalImage();
        
        document.getElementById('imageModal').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    updateModalImage() {
        const modalImage = document.getElementById('modalImage');
        const currentIndexSpan = document.getElementById('currentImageIndex');
        const totalImagesSpan = document.getElementById('totalImages');
        
        if (this.modalImages && this.modalImages[this.currentImageIndex]) {
            modalImage.src = this.modalImages[this.currentImageIndex].src;
            modalImage.alt = this.modalImages[this.currentImageIndex].alt;
            currentIndexSpan.textContent = this.currentImageIndex + 1;
            totalImagesSpan.textContent = this.modalImages.length;
        }
    }
    
    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else {
            this.currentImageIndex = this.modalImages.length - 1;
        }
        this.updateModalImage();
    }
    
    nextImage() {
        if (this.currentImageIndex < this.modalImages.length - 1) {
            this.currentImageIndex++;
        } else {
            this.currentImageIndex = 0;
        }
        this.updateModalImage();
    }
    
    closeImageModal() {
        document.getElementById('imageModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore background scrolling
    }
    
    async loadSidebarContent() {
        // Load recent events
        this.displayRecentEvents();
        
        // Load categories
        this.displayCategories();
    }
    
    displayRecentEvents() {
        const container = document.getElementById('recent-events-container');
        if (!container || this.allEvents.length === 0) return;
        
        // Determine which event is currently displayed as main event
        let mainEventId = null;
        if (this.selectedEventId) {
            mainEventId = this.selectedEventId;
        } else if (this.allEvents.length > 0) {
            // If no selected event, the main event is the first one (latest)
            mainEventId = this.allEvents[0].id;
        }
        
        // Filter out the main event from sidebar and get next 3 events
        const sidebarEvents = this.allEvents.filter(event => {
            return event.id != mainEventId && parseInt(event.id) !== parseInt(mainEventId);
        }).slice(0, 3);
        
        // Main event ID, total events, and sidebar events
        
        // If no events to show in sidebar, display a message
        if (sidebarEvents.length === 0) {
            const noEventsMessage = this.currentLanguage === 'en' 
                ? 'No other events available' 
                : 'No hay otros eventos disponibles';
            container.innerHTML = `
                <div class="text-center py-3">
                    <p class="text-muted small">${noEventsMessage}</p>
                </div>
            `;
            return;
        }
        
        const eventsHtml = sidebarEvents.map(event => {
            const title = this.getLocalizedField(event, 'title') || 'Sin título';
            const date = this.formatDate(event.date || event.createdAt || event.created_at);
            const image = event.coverImageUrl || event.image || event.imageUrl || 'images/introEF.jpeg';
            
            return `
                <div class="news-block news-block-two-col d-flex mt-4">
                    <div class="news-block-two-col-image-wrap">
                        <a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;">
                            <img src="${image}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                        </a>
                    </div>

                    <div class="news-block-two-col-info">
                        <div class="news-block-title mb-2">
                            <h6><a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;" class="news-block-title-link">${title}</a></h6>
                        </div>

                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${date}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = eventsHtml;
    }
    
    displayCategories() {
        const container = document.getElementById('categories-container');
        if (!container || this.allEvents.length === 0) return;
        
        // Extract unique categories
        const categoriesMap = new Map();
        
        this.allEvents.forEach(event => {
            const category = this.getLocalizedField(event, 'category') || 'General';
            categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
        });
        
        // Convert to array and sort by count
        const categories = Array.from(categoriesMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Limit to 8 categories
        
        if (categories.length === 0) {
            container.innerHTML = `<p class="text-muted">${this.currentLanguage === 'en' ? 'No categories available' : 'No hay categorías disponibles'}</p>`;
            return;
        }
        
        const categoriesHtml = categories.map(([category, count]) => `
            <a href="#" class="category-block-link">
                ${category}
            </a>
        `).join('');
        
        container.innerHTML = categoriesHtml;
    }
    
    
    displayAllEventsGrid() {
        const container = document.getElementById('all-events-grid');
        const showMoreBtn = document.getElementById('show-more-btn');
        
        if (!container || this.allEvents.length === 0) return;
        
        // Calculate events to show
        const eventsToShow = this.currentPage * this.eventsPerPage;
        const eventsToDisplay = this.allEvents.slice(0, eventsToShow);
        
        // Displaying events
        
        const eventsHtml = eventsToDisplay.map(event => {
            const title = this.getLocalizedField(event, 'title') || 'Sin título';
            const description = this.getLocalizedField(event, 'description') || 'Sin descripción';
            const category = this.getLocalizedField(event, 'category') || 'General';
            const location = this.getEventLocation(event);
            const date = this.formatDate(event.date || event.createdAt || event.created_at);
            const author = event.author || 'Escalando Fronteras';
            const image = event.coverImageUrl || event.image || event.imageUrl || 'images/introEF.jpeg';
            
            // Truncate description
            const truncatedDescription = description.length > 150 ? 
                description.substring(0, 150) + '...' : description;
            
            return `
                <div class="col-lg-6 col-12 mb-4">
                    <div class="news-block">
                        <div class="news-block-top">
                            <a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;">
                                <img src="${image}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                            </a>

                            <div class="news-category-block">
                                ${location ? `
                                    <a href="#" class="category-block-link">
                                        <i class="bi-geo-alt me-1"></i>
                                        ${location}
                                    </a>
                                ` : ''}
                            </div>
                        </div>

                        <div class="news-block-info">
                            <div class="d-flex mt-2">
                                <div class="news-block-date">
                                    <p>
                                        <i class="bi-calendar4 custom-icon me-1"></i>
                                        ${date}
                                    </p>
                                </div>

                                <div class="news-block-author mx-5">
                                    <p>
                                        <i class="bi-person custom-icon me-1"></i>
                                        ${this.currentLanguage === 'en' ? 'By' : 'Por'} ${author}
                                    </p>
                                </div>
                            </div>

                            <div class="news-block-title mb-2">
                                <h4><a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;" class="news-block-title-link">${title}</a></h4>
                            </div>

                            <div class="news-block-body">
                                <p>${truncatedDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = eventsHtml;
        
        // Show/hide "Show more" button
        if (eventsToShow < this.allEvents.length) {
            showMoreBtn.style.display = 'inline-block';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }
    
    setupShowMoreButton() {
        const showMoreBtn = document.getElementById('show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.displayAllEventsGrid();
                
                // Scroll to new content
                setTimeout(() => {
                    const newEvents = document.querySelectorAll('#all-events-grid .col-lg-6');
                    if (newEvents.length > 0) {
                        const targetEvent = newEvents[Math.max(0, newEvents.length - this.eventsPerPage)];
                        targetEvent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            });
        }
    }
    
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchForm = document.querySelector('.search-form');
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSidebarSearch();
            });
        }
        
        if (searchInput) {
            // Real-time search with debounce for sidebar
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSidebarSearch();
                }, 300);
            });
        }
    }
    
    performSidebarSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput?.value.toLowerCase().trim() || '';
        
        // Sidebar search query
        
        if (!query) {
            // Reset to show recent events (first 3)
            this.displayRecentEvents();
            this.updateSearchTitle(false);
            return;
        }
        
        // Filter events based on search query
        const filteredEvents = this.allEvents.filter(event => {
            const title = this.getLocalizedField(event, 'title') || '';
            const description = this.getLocalizedField(event, 'description') || '';
            const category = this.getLocalizedField(event, 'category') || '';
            const tags = this.getLocalizedField(event, 'tags') || [];
            const author = event.author || '';
            const location = this.getEventLocation(event);
            
            const searchableText = [
                title,
                description,
                category,
                author,
                location,
                Array.isArray(tags) ? tags.join(' ') : tags
            ].join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
        
        // Found events
        
        // Display up to 3 search results
        this.displaySearchResults(filteredEvents.slice(0, 3), query);
        this.updateSearchTitle(true, filteredEvents.length, query);
    }
    
    displaySearchResults(events, query) {
        // Displaying events search results in sidebar
        
        const container = document.getElementById('recent-events-container');
        if (!container) {
            return;
        }
        
        if (events.length === 0) {
            this.displayNoEventsSearchResults(query);
            return;
        }
        
        // Display search results (same format as recent events, limit to 3 like noticias limits to 2)
        const eventsHtml = events.map(event => {
            const title = this.getLocalizedField(event, 'title') || 'Sin título';
            const date = this.formatDate(event.date || event.createdAt || event.created_at);
            const image = event.coverImageUrl || event.image || event.imageUrl || 'images/introEF.jpeg';
            
            return `
                <div class="news-block news-block-two-col d-flex mt-4">
                    <div class="news-block-two-col-image-wrap">
                        <a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;">
                            <img src="${image}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                        </a>
                    </div>

                    <div class="news-block-two-col-info">
                        <div class="news-block-title mb-2">
                            <h6><a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;" class="news-block-title-link">${title}</a></h6>
                        </div>

                        <div class="news-block-date">
                            <p>
                                <i class="bi-calendar4 custom-icon me-1"></i>
                                ${date}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add clear search option with consistent noticias styling
        const clearSearchButton = `
            <div class="text-center mt-3">
                <button class="btn btn-sm" onclick="eventosIntegration.clearSidebarSearch()" style="
                    background-color: var(--secondary-color);
                    border-color: var(--secondary-color);
                    color: var(--white-color);
                ">
                    ← ${this.currentLanguage === 'en' ? 'View recent events' : 'Ver eventos recientes'}
                </button>
            </div>
        `;
        
        container.innerHTML = eventsHtml + clearSearchButton;
        
        // Events search results displayed successfully
    }
    
    displayNoEventsSearchResults(query) {
        // No events search results found
        
        const container = document.getElementById('recent-events-container');
        if (!container) return;

        const noEventsTitle = this.currentLanguage === 'en' ? 'No events found' : 'No se encontraron eventos';
        const noEventsText = this.currentLanguage === 'en' ? 
            `No events match "${query}"` : 
            `No hay eventos que coincidan con "${query}"`;
        const backButtonText = this.currentLanguage === 'en' ? '← View recent events' : '← Ver eventos recientes';

        container.innerHTML = `
            <div class="no-results-message" style="
                background: var(--section-bg-color);
                border: 1px solid var(--secondary-color);
                border-radius: var(--border-radius-small);
                padding: 20px;
                text-align: center;
                margin: 10px 0;
            ">
                <h5 style="color: var(--secondary-color); margin-bottom: 1rem;">${noEventsTitle}</h5>
                <p style="color: var(--primary-color); margin-bottom: 1rem;">${noEventsText}</p>
                <button class="btn" onclick="document.getElementById('search-input').value=''; eventosIntegration.clearSidebarSearch();" style="
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
        const titleElement = document.getElementById('recent-events-title');
        if (!titleElement) return;
        
        if (isSearching) {
            // Match noticias pattern: show results count in parentheses
            const searchResultsText = this.currentLanguage === 'en' ? 
                `Search Results (${totalResults})` : 
                `Resultados de Búsqueda (${totalResults})`;
            titleElement.textContent = searchResultsText;
            titleElement.style.color = 'var(--primary-color)';
        } else {
            // Reset to default title
            const recentEventsText = this.currentLanguage === 'en' ? 
                'Recent Events' : 
                'Eventos Recientes';
            titleElement.textContent = recentEventsText;
            titleElement.style.color = '';
        }
    }
    
    clearSidebarSearch() {
        // Clearing events sidebar search
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset to show recent events
        this.displayRecentEvents();
        this.updateSearchTitle(false);
        
        // Events sidebar search cleared
    }
    
    resetEventsSearch() {
        // Method to match noticias pattern
        this.clearSidebarSearch();
    }
    
    translateSidebarContent() {
        // Translating events sidebar content
        
        // Translate "Eventos Recientes" title
        const recentEventsTitle = document.getElementById('recent-events-title');
        if (recentEventsTitle) {
            const title = this.currentLanguage === 'en' ? 'Recent Events' : 'Eventos Recientes';
            recentEventsTitle.textContent = title;
        }
        
        // Translate "Categorías" title
        const categoriesTitle = document.getElementById('categories-title');
        if (categoriesTitle) {
            const title = this.currentLanguage === 'en' ? 'Categories' : 'Categorías';
            categoriesTitle.textContent = title;
        }
        
        
        // Translate search placeholder
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const placeholder = this.currentLanguage === 'en' ? 'Search events' : 'Buscar eventos';
            searchInput.placeholder = placeholder;
        }
        
        // Events sidebar content translated
    }
    
    performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput?.value.toLowerCase().trim() || '';
        
        if (!query) {
            // Reset to show all events
            this.displayedEvents = [...this.allEvents];
            this.currentPage = 1;
            this.displayAllEventsGrid();
            return;
        }
        
        // Filter events based on search query
        this.displayedEvents = this.allEvents.filter(event => {
            const title = this.getLocalizedField(event, 'title') || '';
            const description = this.getLocalizedField(event, 'description') || '';
            const category = this.getLocalizedField(event, 'category') || '';
            const tags = this.getLocalizedField(event, 'tags') || [];
            
            const searchableText = [
                title,
                description,
                category,
                Array.isArray(tags) ? tags.join(' ') : tags
            ].join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
        
        // Update display with filtered events
        this.currentPage = 1;
        this.displayFilteredEvents();
    }
    
    displayFilteredEvents() {
        const container = document.getElementById('all-events-grid');
        const showMoreBtn = document.getElementById('show-more-btn');
        
        if (!container) return;
        
        if (this.displayedEvents.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">${this.currentLanguage === 'en' ? 'No events found' : 'No se encontraron eventos'}</p>
                </div>
            `;
            showMoreBtn.style.display = 'none';
            return;
        }
        
        // Use the same display logic as displayAllEventsGrid but with filtered events
        const eventsToShow = this.currentPage * this.eventsPerPage;
        const eventsToDisplay = this.displayedEvents.slice(0, eventsToShow);
        
        const eventsHtml = eventsToDisplay.map(event => {
            const title = this.getLocalizedField(event, 'title') || 'Sin título';
            const description = this.getLocalizedField(event, 'description') || 'Sin descripción';
            const category = this.getLocalizedField(event, 'category') || 'General';
            const location = this.getEventLocation(event);
            const date = this.formatDate(event.date || event.createdAt || event.created_at);
            const author = event.author || 'Escalando Fronteras';
            const image = event.coverImageUrl || event.image || event.imageUrl || 'images/introEF.jpeg';
            
            const truncatedDescription = description.length > 150 ? 
                description.substring(0, 150) + '...' : description;
            
            return `
                <div class="col-lg-6 col-12 mb-4">
                    <div class="news-block">
                        <div class="news-block-top">
                            <a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;">
                                <img src="${image}" class="news-image img-fluid" alt="${title}" onerror="this.src='images/introEF.jpeg'">
                            </a>

                            <div class="news-category-block">
                                ${location ? `
                                    <a href="#" class="category-block-link">
                                        <i class="bi-geo-alt me-1"></i>
                                        ${location}
                                    </a>
                                ` : ''}
                            </div>
                        </div>

                        <div class="news-block-info">
                            <div class="d-flex mt-2">
                                <div class="news-block-date">
                                    <p>
                                        <i class="bi-calendar4 custom-icon me-1"></i>
                                        ${date}
                                    </p>
                                </div>

                                <div class="news-block-author mx-5">
                                    <p>
                                        <i class="bi-person custom-icon me-1"></i>
                                        ${this.currentLanguage === 'en' ? 'By' : 'Por'} ${author}
                                    </p>
                                </div>
                            </div>

                            <div class="news-block-title mb-2">
                                <h4><a href="#" onclick="eventosIntegration.selectEvent('${event.id}'); return false;" class="news-block-title-link">${title}</a></h4>
                            </div>

                            <div class="news-block-body">
                                <p>${truncatedDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = eventsHtml;
        
        // Show/hide "Show more" button
        if (eventsToShow < this.displayedEvents.length) {
            showMoreBtn.style.display = 'inline-block';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }
    
    selectEvent(eventId) {
        // Event selected
        
        // Store selected event
        this.selectedEventId = eventId;
        sessionStorage.setItem('selectedEventId', eventId);
        
        // Find and display the selected event
        const selectedEvent = this.allEvents.find(event => 
            event.id == eventId || parseInt(event.id) === parseInt(eventId)
        );
        
        if (selectedEvent) {
            this.displayMainEvent(selectedEvent);
            
            // Refresh sidebar to exclude the newly selected main event
            this.displayRecentEvents();
            
            // Scroll to the main event section instead of top of page
            this.scrollToMainEventSection();
        } else {
            // Selected event not found
        }
    }
    
    scrollToMainEventSection() {
        // Find the main event section
        const mainEventSection = document.querySelector('.news-section.section-padding');
        
        if (mainEventSection) {
            // Calculate offset to account for fixed header/navigation
            const headerOffset = 100; // Adjust this value based on your header height
            const elementPosition = mainEventSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Scrolling to main event section
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // Utility methods
    getLocalizedField(item, field) {
        if (!item) return null;
        
        
        // Handle different field mappings
        const fieldMappings = {
            'title': this.currentLanguage === 'en' ? 'title_en' : 'title_es',
            'description': this.currentLanguage === 'en' ? 'body_en' : 'body_es',
            'category': this.currentLanguage === 'en' ? 'category_en' : 'category',
            'tags': this.currentLanguage === 'en' ? 'tags_en' : 'tags',
            'quote': this.currentLanguage === 'en' ? 'quote_en' : 'quote',
            'phrase': this.currentLanguage === 'en' ? 'phrase_en' : 'phrase',
            'credits': this.currentLanguage === 'en' ? 'credits_en' : 'credits'
        };
        
        // Get the mapped field name
        const mappedField = fieldMappings[field];
        
        if (mappedField && item[mappedField]) {
            return item[mappedField];
        }
        
        // Try language-specific field first, then fallback to default
        let result = null;
        if (this.currentLanguage === 'en') {
            // For English: try _en suffix, then base field, then _es suffix
            result = item[`${field}_en`] || item[field] || item[`${field}_es`];
        } else {
            // For Spanish: try base field (no suffix), then _en suffix, then _es suffix
            result = item[field] || item[`${field}_en`] || item[`${field}_es`];
        }
        
        return result;
    }
    
    getEventLocation(event) {
        if (!event) return '';
        
        const city = event.location_city || event.city;
        const country = event.location_country || event.country;
        
        if (city && country) {
            return `${city}, ${country}`;
        } else if (city || country) {
            return city || country;
        } else {
            return this.currentLanguage === 'en' ? 'Location' : 'Ubicación';
        }
    }
    
    formatDate(dateString) {
        if (!dateString) {
            return this.currentLanguage === 'en' ? 'Date not available' : 'Fecha no disponible';
        }
        
        try {
            const date = new Date(dateString);
            
            if (this.currentLanguage === 'en') {
                // English format: "Month Day, Year"
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
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
    
    formatDescription(description) {
        if (!description) return '';
        
        // Split description into paragraphs
        const paragraphs = description.split('\n').filter(p => p.trim());
        
        // Format as HTML paragraphs
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }
    
    showError(message) {
        const container = document.getElementById('main-event-content');
        if (container) {
            const errorTitle = this.currentLanguage === 'en' ? 
                'Error loading events' : 
                'Error al cargar eventos';
            const errorMessage = this.currentLanguage === 'en' ? 
                'Network error - please check your connection' : 
                'Error de red - por favor verifica tu conexión';
            const retryText = this.currentLanguage === 'en' ? 
                'Try again' : 
                'Intentar de nuevo';
                
            container.innerHTML = `
                <div class="error-modal network-error">
                    <div class="error-modal-icon">
                        <i class="bi-wifi-off"></i>
                    </div>
                    <h3>${errorTitle}</h3>
                    <p>${errorMessage}</p>
                    <button class="btn-retry" onclick="eventosIntegration.loadEvents()">
                        ${retryText}
                    </button>
                </div>
            `;
        }
    }
}

// Initialize EventosIntegration
window.eventosIntegration = new EventosIntegration();

// Global functions for modal (to be called from onclick handlers)
window.openImageModal = function(startIndex = 0) {
    if (window.eventosIntegration) {
        window.eventosIntegration.openImageModal(startIndex);
    }
};

window.closeImageModal = function() {
    if (window.eventosIntegration) {
        window.eventosIntegration.closeImageModal();
    }
};

window.previousImage = function() {
    if (window.eventosIntegration) {
        window.eventosIntegration.previousImage();
    }
};

window.nextImage = function() {
    if (window.eventosIntegration) {
        window.eventosIntegration.nextImage();
    }
};

// EventosIntegration script loaded
