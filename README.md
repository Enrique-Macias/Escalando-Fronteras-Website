# Escalando Fronteras Website

The website for "Escalando Fronteras" is a static informational platform developed for a non-profit organization. It provides users with detailed information about the organization's mission, upcoming events, and opportunities for donations. The website serves as a hub for community engagement and support.

## Features

- Informational pages about the organization and its mission
- Event pages showcasing upcoming and past events
- Donation page for supporting the organization
- FAQ section to address common queries
- Contact forms with external API integration
- Responsive design using Bootstrap framework
- Static website with no backend dependencies

## Project Structure

```
Escalando-Fronteras-Website/
├── frontend/                 # Static website files
│   ├── css/                 # Bootstrap and custom styles
│   ├── js/                  # JavaScript functionality
│   ├── images/              # Images and assets
│   ├── fonts/               # Custom fonts
│   ├── index.html           # Main homepage
│   ├── donate.html          # Donation page
│   ├── eventos2023.html     # 2023 events page
│   ├── eventos2024.html     # 2024 events page
│   └── faq.html             # FAQ page
├── LICENSE
└── README.md
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Enrique-Macias/Escalando-Fronteras-Website.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd Escalando-Fronteras-Website
   ```

3. **Start the development server**:
   ```bash
   # From root directory
   npm run dev
   
   # OR from frontend directory
   cd frontend
   npm run dev
   ```
   This will start a live development server at `http://localhost:3000` with auto-reload functionality.

   **Alternative**: Simply open `frontend/index.html` in your web browser (without live reload)

## Development

The project uses `live-server` for development, which provides:
- **Auto-reload**: Automatically refreshes the browser when files change
- **Live reload**: Real-time updates without manual refresh
- **CORS support**: Handles cross-origin requests properly
- **Simple setup**: Just run `npm run dev` to start

### Available Scripts

- `npm run dev` - Start development server with live reload
- `npm start` - Same as dev (alias)
- `npm run serve` - Same as dev (alias)
- `npm run build` - Build production-ready files to `dist/` folder
- `npm run preview` - Preview the built files on `http://localhost:3001`

### Build Process

The build process creates optimized production files in the `dist/` folder:

- **File copying**: Copies all HTML, CSS, images, fonts, and JavaScript files
- **CSS minification**: Creates `style.min.css` for faster loading
- **JavaScript minification**: Combines and minifies custom JS files into `app.min.js`
- **Production ready**: The `dist/` folder contains everything needed for deployment

To build for production:
```bash
# From root directory
npm run build

# OR from frontend directory
cd frontend
npm run build
```

To preview the built version:
```bash
# From root directory
npm run preview

# OR from frontend directory
cd frontend
npm run preview
```

## Usage

- The website is designed to be navigated easily using the main menu
- Users can view information, browse events, donate, or contact the organization through the respective pages
- Contact forms use external API (web3forms.com) for form submissions
- No backend server or database required - it's a completely static website

## License

MIT License

Copyright (c) [2024] [Enrique Macías López]

