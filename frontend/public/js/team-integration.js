/**
 * Team Integration Script
 * Handles dynamic loading of team members from CMS
 */

class TeamIntegration {
    constructor() {
        this.teamContainer = null;
        this.loadingElement = null;
        this.currentLanguage = 'es';
        this.init();
    }

    init() {
        // Wait for API services to be ready
        document.addEventListener('apiServicesReady', () => {
            this.teamContainer = document.getElementById('team-container');
            this.loadingElement = document.getElementById('team-loading');
            this.currentLanguage = EFAPI.language.getCurrentLanguage();
            
            // Load team members
            this.loadTeamMembers();
            
            // Listen for language changes
            document.addEventListener('languageChanged', (event) => {
                this.currentLanguage = event.detail.language;
                this.loadTeamMembers();
            });
        });
    }

    async loadTeamMembers() {
        if (!this.teamContainer) return;

        try {
            // Show loading state
            this.showLoading();

            console.log('🔄 Loading team members...');
            console.log('🌐 API Base URL:', EFAPI.client.baseURL);
            console.log('🌍 Current Language:', this.currentLanguage);

            // Fetch team members from API
            const teamMembers = await EFAPI.team.getAllTeamMembers(this.currentLanguage);
            
            console.log('✅ Team members loaded:', teamMembers);
            
            // Display team members
            this.displayTeamMembers(teamMembers);

        } catch (error) {
            console.error('❌ Error loading team members:', error);
            this.showError(error);
        }
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        this.teamContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="loading-spinner" id="team-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">${EFAPI.language.getUIText('loading')}</span>
                    </div>
                    <p class="mt-2">${EFAPI.language.getUIText('loading')}</p>
                </div>
            </div>
        `;
    }

    displayTeamMembers(teamMembers) {
        if (!teamMembers || teamMembers.length === 0) {
            this.showEmptyState();
            return;
        }

        let html = '';
        let delay = 100;

        teamMembers.forEach((member, index) => {
            const memberHtml = this.createMemberHTML(member, delay);
            html += memberHtml;
            delay += 100; // Increment delay for AOS animation
        });

        this.teamContainer.innerHTML = html;

        // Re-initialize AOS animations for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    createMemberHTML(member, delay) {
        const name = member.name || 'Miembro del Equipo';
        const role = this.currentLanguage === 'en' ? member.role_en : member.role;
        const imageUrl = member.imageUrl || 'images/team/default-member.jpg';
        
        // Social media links
        const socialLinks = this.createSocialLinks(member);

        return `
            <div class="col-lg-3 col-md-6 d-flex align-items-stretch">
                <div class="member" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="member-img">
                        <img src="${imageUrl}" class="img-fluid" alt="${name}" loading="lazy">
                        <!-- === Iconos Sociales === -->
                        <div class="social">
                            ${socialLinks}
                        </div>
                    </div>
                    <!-- === Informacion de Equipo === -->
                    <div class="member-info">
                        <h4>${name}</h4>
                        <span>${role || 'Miembro'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createSocialLinks(member) {
        const links = [];
        
        // Facebook link
        if (member.facebook_url) {
            links.push(`<a href="${member.facebook_url}" class="social-icon-link bi-facebook" target="_blank" rel="noopener"></a>`);
        }
        
        // Instagram link
        if (member.instagram_url) {
            links.push(`<a href="${member.instagram_url}" class="social-icon-link bi-instagram" target="_blank" rel="noopener"></a>`);
        }
        
        // X (Twitter) link
        if (member.x_url) {
            links.push(`<a href="${member.x_url}" class="social-icon-link bi-twitter" target="_blank" rel="noopener"></a>`);
        }

        // If no social links, show default organization links
        if (links.length === 0) {
            links.push(`<a href="https://www.facebook.com/EscalandoFronteras/" class="social-icon-link bi-facebook" target="_blank" rel="noopener"></a>`);
            links.push(`<a href="https://www.instagram.com/escalando_fronteras/" class="social-icon-link bi-instagram" target="_blank" rel="noopener"></a>`);
            links.push(`<a href="https://www.x.com" class="social-icon-link bi-twitter" target="_blank" rel="noopener"></a>`);
        }

        return links.join('');
    }

    showError(error) {
        this.teamContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="error-state">
                    <div class="alert alert-warning" role="alert">
                        <h4 class="alert-heading">${EFAPI.language.getUIText('error_loading')}</h4>
                        <p>${error.message || 'Error desconocido'}</p>
                        <hr>
                        <button class="btn btn-primary" onclick="teamIntegration.loadTeamMembers()">
                            ${EFAPI.language.getUIText('try_again')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showEmptyState() {
        this.teamContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-state">
                    <div class="alert alert-info" role="alert">
                        <h4 class="alert-heading">No hay miembros del equipo disponibles</h4>
                        <p>Por favor, inténtalo más tarde.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize team integration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.teamIntegration = new TeamIntegration();
});

// Export for global access
window.TeamIntegration = TeamIntegration;
