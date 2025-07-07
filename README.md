# Real Estate JavaScript Frontend

A JavaScript frontend application that consumes the Django REST API for the real estate project.

## Features

- **Property Listings**: Browse properties with filtering and pagination
- **Property Details**: View detailed information about each property
- **Statistics Dashboard**: Real-time statistics from the API
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Filtering**: Filter by status, type, and price range

## Setup Instructions

1. **Start the Django Server**:
   ```bash
   cd ../real_estate_django/real_estate_project
   pipenv run python manage.py runserver
   ```

2. **Open the Frontend**:
   - Open `index.html` in your browser
   - Or use a local server:
     ```bash
     python -m http.server 8080
     ```
   - Then visit: http://localhost:8080

## API Endpoints Used

- `GET /api/properties/` - List properties with filtering
- `GET /api/properties/{id}/` - Get property details
- `GET /api/stats/` - Get property statistics

## Project Structure

```
real_estate_js/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── styles.css          # Custom styles
└── README.md           # This file
```

## Technologies Used

- **Vanilla JavaScript** - Core functionality
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons
- **Fetch API** - HTTP requests to Django REST API

## Features

### Home Page
- Property statistics dashboard
- Navigation to property listings

### Property Listings
- Grid view of properties
- Filtering by:
  - Status (For Sale, For Rent, etc.)
  - Property Type (House, Apartment, etc.)
  - Price range (Min/Max)
- Pagination support
- Responsive cards with property details

### Property Details
- Modal popup with detailed information
- Property images (if available)
- Complete property specifications
- Contact information

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge

## Development Notes

- The frontend assumes the Django API is running on `http://127.0.0.1:8000`
- CORS is configured in Django to allow requests from common frontend ports
- All API calls include error handling
- Loading states are provided for better UX