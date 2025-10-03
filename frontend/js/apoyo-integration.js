/**
 * Apoyo Integration
 * Handles dynamic loading of GoFundMe widgets from the CMS API
 */

class ApoyoIntegration {
    constructor() {
        this.apoyoContainer = null;
        this.currentLanguage = 'es';
    }

    init() {
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.apoyoContainer = document.querySelector('#support-section .row');
            if (this.apoyoContainer) {
                this.loadApoyo();
            }
        });

        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.loadApoyo();
        });
    }

    async loadApoyo() {
        if (!this.apoyoContainer) return;

        try {
            // Show loading state
            this.showLoading();

            // Loading apoyo widgets

            // Fetch apoyo items from API
            const apoyoItems = await EFAPI.apoyo.getActiveApoyo();
            
            // Apoyo items loaded
            
            // Store items for layout decisions
            this.apoyoItems = apoyoItems;
            
            // Display apoyo widgets
            this.displayApoyo(apoyoItems);

        } catch (error) {
            console.error('❌ Error loading apoyo:', error);
            // Hide the section when there's an error fetching data
            const section = document.querySelector('#support-section');
            if (section) {
                section.style.display = 'none';
            }
        }
    }

    showLoading() {
        if (this.apoyoContainer) {
            // Keep the title but replace the content
            const titleElement = this.apoyoContainer.querySelector('.col-lg-12');
            if (titleElement) {
                this.apoyoContainer.innerHTML = '';
                this.apoyoContainer.appendChild(titleElement);
            }
            
            // Add loading content
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'col-12 text-center';
            loadingDiv.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Cargando widget de apoyo...</p>
            `;
            this.apoyoContainer.appendChild(loadingDiv);
        }
    }

    showError(error) {
        if (!this.apoyoContainer) return;

        let errorMessage = 'Error al cargar el widget de apoyo';
        
        if (error.message.includes('Network error')) {
            errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Por favor, intenta de nuevo.';
        } else if (error.message.includes('HTTP 404')) {
            errorMessage = 'No se encontró el widget de apoyo.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }

        // Keep the title but replace the content
        const titleElement = this.apoyoContainer.querySelector('.col-lg-12');
        if (titleElement) {
            this.apoyoContainer.innerHTML = '';
            this.apoyoContainer.appendChild(titleElement);
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'col-12 text-center';
        errorDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${errorMessage}
            </div>
            <button class="btn btn-outline-primary btn-sm" onclick="window.apoyoIntegration.loadApoyo()">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Reintentar
            </button>
        `;
        this.apoyoContainer.appendChild(errorDiv);
    }

    displayApoyo(apoyoItems) {
        if (!this.apoyoContainer || !Array.isArray(apoyoItems)) {
            console.warn('No apoyo container or invalid apoyo data');
            return;
        }

        if (apoyoItems.length === 0) {
            // Hide the entire section when there's no data
            const section = document.querySelector('#support-section');
            if (section) {
                section.style.display = 'none';
                // Apoyo section hidden - no data available
            }
            return;
        }

        // Show the section if it was previously hidden
        const section = document.querySelector('#support-section');
        if (section) {
            section.style.display = 'block';
        }

        // Keep the title but replace the content
        const titleElement = this.apoyoContainer.querySelector('.col-lg-12');
        if (titleElement) {
            this.apoyoContainer.innerHTML = '';
            this.apoyoContainer.appendChild(titleElement);
        }

        // Create a container for the widgets to ensure proper grid layout
        const widgetsContainer = document.createElement('div');
        widgetsContainer.className = 'row';
        widgetsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin: 0;
        `;

        // Create widget elements
        // Creating widget elements
        apoyoItems.forEach((apoyoItem, index) => {
            const widgetElement = this.createWidgetElement(apoyoItem, index);
            widgetsContainer.appendChild(widgetElement);
        });

        this.apoyoContainer.appendChild(widgetsContainer);
        // Added widgets container
    }

    createWidgetElement(apoyoItem, index) {
        const div = document.createElement('div');
        
        // Create responsive column layout (up to 3 columns on desktop)
        let columnClass = 'col-lg-4 col-md-6 col-12'; // 3 columns on desktop, 2 on tablet, 1 on mobile
        
        // Debug: log the number of items
        // Creating widget
        
        if (this.apoyoItems && this.apoyoItems.length === 1) {
            // If only one item, center it
            columnClass = 'col-lg-6 col-md-8 col-12';
        } else if (this.apoyoItems && this.apoyoItems.length === 2) {
            // If two items, use 2 columns
            columnClass = 'col-lg-6 col-md-6 col-12';
        } else if (this.apoyoItems && this.apoyoItems.length >= 3) {
            // If 3 or more items, use 3 columns
            columnClass = 'col-lg-4 col-md-6 col-12';
        }
        
        div.className = `${columnClass} text-center mb-4`;
        div.style.cssText = `
            width: 100%;
            overflow: visible;
            padding: 0 15px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
        `;
        
        // Create a container for the widget
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'apoyo-widget-container';
        widgetContainer.style.cssText = `
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            padding: 5px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: visible;
            height: auto;
            min-height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;

        // Skip title display - only show the widget
        // Skip description display - only show the widget

        // Create widget content container
        const widgetContent = document.createElement('div');
        widgetContent.className = 'widget-content';
        widgetContent.style.cssText = `
            width: 100%;
            overflow: visible;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        
        // Insert the widget code
        widgetContent.innerHTML = apoyoItem.widgetCode;
        // Widget code inserted

        // Append widget content
        widgetContainer.appendChild(widgetContent);
        div.appendChild(widgetContainer);

        // Execute any script tags that came with the widget code
        const scripts = widgetContent.querySelectorAll('script');
        scripts.forEach((script, index) => {
            // Executing script
            
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${script.src}"]`);
            if (!existingScript && script.src) {
                // Create new script element to execute
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.defer = script.defer;
                newScript.async = true;
                
                // Add to document head
                document.head.appendChild(newScript);
                // Script added to document
            } else if (existingScript) {
                // Script already exists, skipping
            }
        });

        // Re-execute GoFundMe scripts after DOM insertion
        setTimeout(() => {
            this.reinitializeGoFundMeWidgets();
            // Adjust container height after widget loads
            this.adjustContainerHeight(widgetContainer);
        }, 1000); // Increased timeout to ensure scripts are loaded

        return div;
    }

    /**
     * Reinitialize GoFundMe widgets after dynamic insertion
     */
    reinitializeGoFundMeWidgets() {
        // Reinitializing GoFundMe widgets
        
        // Check if GoFundMe script is already loaded
        const existingScript = document.querySelector('script[src*="gofundme.com/static/js/embed.js"]');
        
        if (!existingScript) {
            // Loading GoFundMe embed script
            const script = document.createElement('script');
            script.src = 'https://www.gofundme.com/static/js/embed.js';
            script.defer = true;
            script.onload = () => {
                // GoFundMe script loaded, initializing widgets
                this.initializeWidgets();
            };
            script.onerror = () => {
                console.error('❌ Failed to load GoFundMe script');
            };
            document.head.appendChild(script);
        } else {
            // GoFundMe script already loaded, initializing widgets
            this.initializeWidgets();
        }
    }

    /**
     * Initialize GoFundMe widgets
     */
    initializeWidgets() {
        // Look for gfm-embed elements
        const embedElements = document.querySelectorAll('.gfm-embed');
        // Found GoFundMe embed elements
        
        if (embedElements.length > 0) {
            // Wait a bit more for the script to be fully loaded
            setTimeout(() => {
                this.tryInitializeWidgets(embedElements);
            }, 500);
        }
    }

    /**
     * Try to initialize widgets with multiple methods
     */
    tryInitializeWidgets(embedElements) {
        let initialized = false;
        
        // Method 1: Try gfmEmbed.init()
        if (window.gfmEmbed && typeof window.gfmEmbed.init === 'function') {
            // Method 1: Using gfmEmbed.init()
            try {
                window.gfmEmbed.init();
                initialized = true;
                // Widget initialized with gfmEmbed.init()
            } catch (error) {
                console.error('❌ Error with gfmEmbed.init():', error);
            }
        }
        
        // Method 2: Try gfmEmbed() directly
        if (!initialized && window.gfmEmbed && typeof window.gfmEmbed === 'function') {
            // Method 2: Using gfmEmbed() directly
            try {
                window.gfmEmbed();
                initialized = true;
                // Widget initialized with gfmEmbed()
            } catch (error) {
                console.error('❌ Error with gfmEmbed():', error);
            }
        }
        
        // Method 3: Try to trigger DOM events
        if (!initialized) {
            // Method 3: Triggering DOM events
            try {
                embedElements.forEach((element) => {
                    // Trigger various events that GoFundMe might listen for
                    const events = ['load', 'DOMContentLoaded', 'gfm-embed-ready'];
                    events.forEach(eventType => {
                        const event = new Event(eventType, { bubbles: true });
                        element.dispatchEvent(event);
                    });
                });
                
                // Check if widgets loaded after events
                setTimeout(() => {
                    const loadedWidgets = document.querySelectorAll('.gfm-embed iframe');
                    if (loadedWidgets.length > 0) {
                        // Widgets loaded via DOM events
                        initialized = true;
                    }
                }, 1000);
            } catch (error) {
                console.error('❌ Error with DOM events:', error);
            }
        }
        
        // Method 4: Fallback to iframe
        if (!initialized) {
            // Method 4: Using iframe fallback
            embedElements.forEach((element, index) => {
                // Processing embed element
                
                // Check if element has data-url attribute
                const dataUrl = element.getAttribute('data-url');
                if (dataUrl) {
                    // Widget URL found
                    
                    // Try to create an iframe manually as fallback
                    this.createFallbackWidget(element, dataUrl);
                }
            });
        }
    }

    /**
     * Create fallback widget if GoFundMe script fails
     */
    createFallbackWidget(element, dataUrl) {
        // Creating fallback widget
        
        // Create iframe as fallback - keep the large widget size
        const iframe = document.createElement('iframe');
        iframe.src = dataUrl; // Keep original URL with large widget
        iframe.width = '100%';
        iframe.height = '520'; // Optimized height for complete widget display
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.style.cssText = `
            border: none;
            border-radius: 8px;
            width: 100%;
            min-width: 300px;
            max-width: 100%;
            height: 520px;
            min-height: 520px;
            overflow: visible;
        `;
        
        // Find the correct container to insert the iframe
        let targetContainer = null;
        
        if (element && element.parentNode) {
            // Normal case: element has a parent
            targetContainer = element.parentNode;
            try {
                element.parentNode.replaceChild(iframe, element);
                // Replaced element with iframe
            } catch (error) {
                console.warn('❌ Error replacing element:', error);
                targetContainer = null;
            }
        }
        
        if (!targetContainer) {
            // Fallback: find the widget container
            const widgetContainer = element?.closest('.apoyo-widget-container') || 
                                  document.querySelector('.apoyo-widget-container');
            if (widgetContainer) {
                // Clear the container and add iframe
                widgetContainer.innerHTML = '';
                widgetContainer.appendChild(iframe);
                // Appended iframe to widget container
            } else {
                console.warn('❌ No widget container found, appending to body');
                document.body.appendChild(iframe);
            }
        }
        
        // Try to adjust height after iframe loads
        iframe.onload = () => {
            setTimeout(() => {
                // Find the widget container for this iframe
                const widgetContainer = iframe.closest('.apoyo-widget-container');
                if (widgetContainer) {
                    this.adjustContainerHeight(widgetContainer);
                } else {
                    // No widget container found for height adjustment
                }
            }, 1000);
        };
        
        // Fallback widget created with large size
    }

    /**
     * Force refresh apoyo data
     */
    forceRefresh() {
        // Force refreshing apoyo
        this.loadApoyo();
    }

    /**
     * Try to force proper GoFundMe widget initialization
     */
    forceGoFundMeInitialization() {
        // Force initializing GoFundMe widgets
        
        // Remove any existing iframe fallbacks
        const iframes = document.querySelectorAll('.apoyo-widget-container iframe');
        iframes.forEach(iframe => {
            // Removing iframe fallback
            iframe.remove();
        });
        
        // Find embed elements and try to initialize them properly
        const embedElements = document.querySelectorAll('.gfm-embed');
        if (embedElements.length > 0) {
            // Found embed elements, trying proper initialization
            
            // Wait for GoFundMe script to be ready
            const checkScript = setInterval(() => {
                if (window.gfmEmbed) {
                    clearInterval(checkScript);
                    // GoFundMe script ready, initializing
                    
                    try {
                        if (typeof window.gfmEmbed.init === 'function') {
                            window.gfmEmbed.init();
                        } else if (typeof window.gfmEmbed === 'function') {
                            window.gfmEmbed();
                        }
                        
                        // Check if widgets loaded properly
                        setTimeout(() => {
                            const loadedWidgets = document.querySelectorAll('.gfm-embed iframe');
                            if (loadedWidgets.length > 0) {
                                // GoFundMe widgets loaded properly
                            } else {
                                // GoFundMe widgets still not loaded, keeping fallback
                            }
                        }, 2000);
                        
                    } catch (error) {
                        console.error('❌ Error initializing GoFundMe:', error);
                    }
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkScript);
                // GoFundMe initialization timeout
            }, 10000);
        }
    }

    /**
     * Adjust container height to fit content
     * Note: Cross-origin restrictions prevent dynamic height adjustment for GoFundMe iframes
     */
    adjustContainerHeight(container) {
        setTimeout(() => {
            const iframe = container.querySelector('iframe');
            
            if (iframe) {
                // Iframe loaded successfully
                // Cross-origin restrictions prevent height adjustment for GoFundMe widgets
                // Using optimized default heights instead
                // Using optimized default height due to cross-origin restrictions
            } else {
                // No iframe found in container
            }
        }, 1000); // Reduced timeout since we're not doing dynamic adjustment
    }
}

// Create global instance
window.apoyoIntegration = new ApoyoIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.apoyoIntegration.init();
    });
} else {
    window.apoyoIntegration.init();
}
