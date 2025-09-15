/**
 * EF CMS Frontend Configuration
 * Reads configuration from environment variables and provides fallbacks
 */

// Helper function to get environment variable with fallback
function getEnvVar(key, fallback) {
    // In browser environment, we'll use a global variable set during build
    if (typeof window !== 'undefined' && window.EF_ENV_VARS) {
        return window.EF_ENV_VARS[key] || fallback;
    }
    return fallback;
}

// Helper function to parse boolean from string
function parseBoolean(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return fallback;
}

// Helper function to parse number from string
function parseNumber(value, fallback = 0) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
}

window.EFCMS_CONFIG = {
    // CMS API Base URL - from environment variable
    apiBaseURL: getEnvVar('EF_CMS_API_URL', 'https://your-cms-domain.vercel.app/api'),
    
    // Alternative URLs for different environments
    apiUrls: {
        development: getEnvVar('EF_CMS_API_URL_DEV', 'http://localhost:3000/api'),
        staging: getEnvVar('EF_CMS_API_URL_STAGING', 'https://ef-cms-staging.vercel.app/api'),
        production: getEnvVar('EF_CMS_API_URL_PROD', 'https://ef-cms.vercel.app/api')
    },
    
    // Default settings
    defaults: {
        language: getEnvVar('EF_CMS_DEFAULT_LANG', 'es'),
        pageSize: parseNumber(getEnvVar('EF_CMS_ITEMS_PER_PAGE', '10'), 10),
        timeout: parseNumber(getEnvVar('EF_CMS_TIMEOUT', '10000'), 10000),
        retryAttempts: 3
    },
    
    // Feature flags
    features: {
        enableSearch: parseBoolean(getEnvVar('EF_CMS_ENABLE_SEARCH', 'true'), true),
        enablePagination: parseBoolean(getEnvVar('EF_CMS_ENABLE_PAGINATION', 'true'), true),
        enableLanguageSwitching: parseBoolean(getEnvVar('EF_CMS_ENABLE_LANGUAGE_SWITCHING', 'true'), true),
        enableErrorRetry: parseBoolean(getEnvVar('EF_CMS_ENABLE_ERROR_RETRY', 'true'), true),
        enableOfflineMode: parseBoolean(getEnvVar('EF_CMS_ENABLE_OFFLINE_MODE', 'false'), false)
    },
    
    // UI Settings
    ui: {
        showLoadingSpinners: parseBoolean(getEnvVar('EF_CMS_SHOW_LOADING_SPINNERS', 'true'), true),
        showErrorMessages: parseBoolean(getEnvVar('EF_CMS_SHOW_ERROR_MESSAGES', 'true'), true),
        enableInfiniteScroll: parseBoolean(getEnvVar('EF_CMS_ENABLE_INFINITE_SCROLL', 'false'), false),
        itemsPerPage: parseNumber(getEnvVar('EF_CMS_ITEMS_PER_PAGE', '10'), 10)
    },
    
    // Cache settings
    cache: {
        enabled: parseBoolean(getEnvVar('EF_CMS_CACHE_ENABLED', 'true'), true),
        ttl: parseNumber(getEnvVar('EF_CMS_CACHE_TTL', '300000'), 300000),
        maxSize: parseNumber(getEnvVar('EF_CMS_CACHE_MAX_SIZE', '50'), 50)
    }
};

// Helper function to get current API URL
window.getAPIBaseURL = function() {
    // First try to get from environment variables
    if (typeof window !== 'undefined' && window.EF_ENV_VARS) {
        const envURL = window.EF_ENV_VARS.EF_CMS_API_URL;
        if (envURL) {
            return envURL;
        }
    }
    
    // Fallback to config
    const env = window.location.hostname === 'localhost' ? 'development' : 'production';
    return window.EFCMS_CONFIG.apiUrls[env] || window.EFCMS_CONFIG.apiBaseURL;
};

// Helper function to update API base URL
window.updateAPIBaseURL = function(newURL) {
    window.EFCMS_CONFIG.apiBaseURL = newURL;
    if (window.apiClient) {
        window.apiClient.baseURL = newURL;
    }
};

console.log('⚙️ EF CMS Configuration loaded');
console.log('📡 API Base URL:', window.getAPIBaseURL());
