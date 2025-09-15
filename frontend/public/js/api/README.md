# EF CMS API Services

This directory contains the API service layer for integrating the static frontend with the EF CMS backend.

## Files Overview

- `config.js` - Configuration settings and API URLs
- `client.js` - Base API client with error handling and timeout
- `language.js` - Language service for bilingual support
- `news.js` - News API service
- `events.js` - Events API service
- `team.js` - Team API service
- `testimonials.js` - Testimonials API service
- `articles.js` - Articles API service
- `index.js` - Main entry point that loads all services
- `examples.js` - Usage examples and patterns

## Quick Start

### 1. Include API Scripts in HTML

Add these script tags to your HTML files (in order):

```html
<!-- Configuration -->
<script src="js/api/config.js"></script>

<!-- Base API Client -->
<script src="js/api/client.js"></script>

<!-- Language Service -->
<script src="js/api/language.js"></script>

<!-- API Services -->
<script src="js/api/news.js"></script>
<script src="js/api/events.js"></script>
<script src="js/api/team.js"></script>
<script src="js/api/testimonials.js"></script>
<script src="js/api/articles.js"></script>

<!-- Main Index -->
<script src="js/api/index.js"></script>
```

### 2. Update Configuration

Edit `config.js` and update the API base URL:

```javascript
apiBaseURL: 'https://your-actual-cms-url.vercel.app/api'
```

### 3. Wait for Services to Load

```javascript
document.addEventListener('apiServicesReady', function(event) {
    console.log('API Services ready!');
    // Your code here
});
```

## Usage Examples

### Get Featured News
```javascript
const news = await EFAPI.news.getFeaturedNews('es');
```

### Get Upcoming Events
```javascript
const events = await EFAPI.events.getUpcomingEvents(5, 'es');
```

### Get Team Members
```javascript
const team = await EFAPI.team.getAllTeamMembers('es');
```

### Search Content
```javascript
const results = await EFAPI.news.searchNews('query', { limit: 10 });
```

### Switch Language
```javascript
EFAPI.language.setLanguage('en');
```

## API Services Available

### News API (`EFAPI.news`)
- `getNews(options)` - Get paginated news list
- `getNewsById(id)` - Get single news article
- `getFeaturedNews(lang)` - Get featured news (3 articles)
- `searchNews(query, options)` - Search news
- `getNewsByCategory(category, options)` - Get news by category
- `getRecentNews(limit, lang)` - Get recent news

### Events API (`EFAPI.events`)
- `getEvents(options)` - Get paginated events list
- `getEventById(id)` - Get single event
- `getUpcomingEvents(limit, lang)` - Get upcoming events
- `getPastEvents(limit, lang)` - Get past events
- `searchEvents(query, options)` - Search events
- `getEventsByCategory(category, options)` - Get events by category

### Team API (`EFAPI.team`)
- `getTeam(options)` - Get paginated team list
- `getTeamMemberById(id)` - Get single team member
- `getAllTeamMembers(lang)` - Get all team members
- `getFeaturedTeam(lang)` - Get featured team (6 members)
- `searchTeam(query, options)` - Search team members
- `getTeamByRole(role, options)` - Get team by role

### Testimonials API (`EFAPI.testimonials`)
- `getTestimonials(options)` - Get paginated testimonials
- `getTestimonialById(id)` - Get single testimonial
- `getFeaturedTestimonials(lang)` - Get featured testimonials
- `getAllTestimonials(lang)` - Get all testimonials
- `searchTestimonials(query, options)` - Search testimonials
- `getRandomTestimonials(count, lang)` - Get random testimonials

### Articles API (`EFAPI.articles`)
- `getArticles(options)` - Get paginated articles
- `getArticleById(id)` - Get single article
- `getFeaturedArticles(lang)` - Get featured articles
- `getRecentArticles(limit, lang)` - Get recent articles
- `searchArticles(query, options)` - Search articles
- `getArticlesByCategory(category, options)` - Get articles by category

### Language Service (`EFAPI.language`)
- `getCurrentLanguage()` - Get current language
- `setLanguage(lang)` - Set language
- `getLocalizedContent(content, field)` - Get localized content
- `getUIText(key)` - Get UI text
- `formatDate(date)` - Format date
- `formatDateTime(date)` - Format date and time

## Error Handling

All API calls include built-in error handling:

```javascript
try {
    const news = await EFAPI.news.getFeaturedNews('es');
    // Handle success
} catch (error) {
    console.error('Error:', error.message);
    // Handle error (show fallback content, etc.)
}
```

## Language Support

The API services support bilingual content (Spanish/English):

```javascript
// Get content in Spanish (default)
const news = await EFAPI.news.getFeaturedNews('es');

// Get content in English
const news = await EFAPI.news.getFeaturedNews('en');

// Switch language globally
EFAPI.language.setLanguage('en');
```

## Configuration

Update `config.js` to customize:

- API base URL
- Default language
- Page size
- Timeout settings
- Feature flags
- Cache settings

## Build Process

The API files are automatically included in the build process and minified into `app.min.js`.
