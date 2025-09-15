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

3. **Open the website**:
   - **Option 1**: Simply open `frontend/index.html` in your web browser
   - **Option 2**: Use a local server (recommended for development):
     ```bash
     cd frontend
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

## Usage

- The website is designed to be navigated easily using the main menu
- Users can view information, browse events, donate, or contact the organization through the respective pages
- Contact forms use external API (web3forms.com) for form submissions
- No backend server or database required - it's a completely static website

## License

MIT License

Copyright (c) [2024] [Enrique Macías López]

