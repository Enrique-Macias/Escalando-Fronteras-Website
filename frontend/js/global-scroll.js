/**
 * Global Scroll Handler for Escalando Fronteras Website
 * Handles all scroll-to-section functionality across all pages
 */

(function() {
    'use strict';

    // Global scroll state
    let isScrolling = false;
    let scrollTimeout = null;

    /**
     * Smooth scroll to a target element with proper offset
     * @param {string|HTMLElement} target - Target element ID or element
     * @param {number} offset - Additional offset (default: 20)
     */
    function scrollToElement(target, offset = 20) {
        if (isScrolling) {
            console.log('🚫 Scroll already in progress, ignoring request');
            return;
        }

        const element = typeof target === 'string' ? document.getElementById(target) : target;
        if (!element) {
            console.error('❌ Target element not found:', target);
            return;
        }

        isScrolling = true;
        console.log('🎯 Global scroll to:', element.id || target);

        // Get navbar height for offset
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;

        // Calculate target position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop;
        const finalPosition = targetTop - navbarHeight - offset;

        console.log('📍 Scroll details:', {
            element: element.id,
            navbarHeight,
            targetTop,
            finalPosition
        });

        // Perform smooth scroll
        window.scrollTo({
            top: finalPosition,
            behavior: 'smooth'
        });

        // Reset scroll state after animation
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            console.log('✅ Global scroll completed');
        }, 1000);
    }

    /**
     * Handle cross-page navigation
     * @param {string} sectionId - Section ID to scroll to
     */
    function handleCrossPageScroll(sectionId) {
        console.log('🌐 Cross-page scroll requested:', sectionId);
        
        // Store the section ID for after page load
        sessionStorage.setItem('globalScrollTarget', sectionId);
        
        // Navigate to index.html
        window.location.href = 'index.html';
    }

    /**
     * Check for stored scroll target on page load
     */
    function checkStoredScrollTarget() {
        const storedTarget = sessionStorage.getItem('globalScrollTarget');
        if (storedTarget) {
            console.log('🔄 Found stored scroll target:', storedTarget);
            sessionStorage.removeItem('globalScrollTarget');
            
            // Wait for page to be fully loaded
            setTimeout(() => {
                scrollToElement(storedTarget);
            }, 800);
        }
    }

    /**
     * Initialize global scroll handlers
     */
    function init() {
        console.log('🚀 Initializing Global Scroll Handler');

        // Check for stored scroll target on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkStoredScrollTarget);
        } else {
            checkStoredScrollTarget();
        }

        // Handle click-scroll links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href*="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || !href.includes('#')) return;

            // Extract section ID from href
            const sectionId = href.split('#')[1];
            if (!sectionId) return;

            // Check if it's a cross-page link
            if (href.includes('index.html#')) {
                e.preventDefault();
                handleCrossPageScroll(sectionId);
                return;
            }

            // Check if target exists on current page
            const target = document.getElementById(sectionId);
            if (target) {
                e.preventDefault();
                scrollToElement(sectionId);
            }
        });

        console.log('✅ Global Scroll Handler initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose global functions
    window.GlobalScroll = {
        scrollTo: scrollToElement,
        crossPageScroll: handleCrossPageScroll,
        isScrolling: () => isScrolling
    };

})();
