// Real Estate JS Frontend - API Consumer

const API_BASE_URL = 'http://127.0.0.1:8000/api';
let currentPage = 1;
let currentFilters = {};
let propertyMap = null;
let mainMap = null;
let mapMarkers = [];

// Bishkek coordinates as default center
const BISHKEK_COORDS = [42.8746, 74.5698];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    showSection('home');
});

// Navigation between sections
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionName).style.display = 'block';
    
    // Load data based on section
    if (sectionName === 'properties') {
        loadProperties();
    } else if (sectionName === 'map') {
        initializeMainMap();
    }
}

// Load property statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/`);
        const data = await response.json();
        
        document.getElementById('total-properties').textContent = data.total_properties;
        document.getElementById('for-sale').textContent = data.for_sale;
        document.getElementById('for-rent').textContent = data.for_rent;
        document.getElementById('featured').textContent = data.featured;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load properties with filters and pagination
async function loadProperties(page = 1) {
    try {
        const propertiesGrid = document.getElementById('properties-grid');
        propertiesGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        
        // Add filters
        const status = document.getElementById('status-filter').value;
        const type = document.getElementById('type-filter').value;
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        
        if (status) params.append('status', status);
        if (type) params.append('property_type', type);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        
        const response = await fetch(`${API_BASE_URL}/properties/?${params}`);
        const data = await response.json();
        
        displayProperties(data.results);
        displayPagination(data);
        
        document.getElementById('property-count').textContent = `${data.count} properties found`;
        
    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('properties-grid').innerHTML = 
            '<div class="col-12 text-center text-danger">Error loading properties. Please make sure the Django server is running.</div>';
    }
}

// Display properties in grid
function displayProperties(properties) {
    const propertiesGrid = document.getElementById('properties-grid');
    
    if (properties.length === 0) {
        propertiesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-home fa-4x text-muted mb-3"></i>
                <h3>No properties found</h3>
                <p class="text-muted">Try adjusting your filters.</p>
            </div>
        `;
        return;
    }
    
    propertiesGrid.innerHTML = properties.map(property => `
        <div class="col-md-4 mb-4">
            <div class="card property-card h-100" onclick="showPropertyDetail(${property.id})">
                ${property.image 
                    ? `<img src="${property.image}" class="card-img-top property-image" alt="${property.title}">`
                    : `<div class="property-placeholder"><i class="fas fa-home fa-3x"></i></div>`
                }
                <div class="card-body">
                    <h5 class="card-title">${property.title}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price-tag text-primary">$${Number(property.price).toLocaleString()}</span>
                        <span class="badge bg-secondary">${getStatusDisplay(property.status)}</span>
                    </div>
                    <p class="property-stats">
                        <i class="fas fa-bed"></i> ${property.bedrooms} beds |
                        <i class="fas fa-bath"></i> ${property.bathrooms} baths |
                        <i class="fas fa-ruler-combined"></i> ${property.area} sq ft
                    </p>
                    <p class="text-muted">
                        <i class="fas fa-map-marker-alt"></i> ${property.city}, ${property.state}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Display pagination
function displayPagination(data) {
    const pagination = document.getElementById('pagination');
    
    if (!data.next && !data.previous) {
        pagination.innerHTML = '';
        return;
    }
    
    const totalPages = Math.ceil(data.count / 12); // Assuming 12 items per page
    const currentPage = data.next ? 
        new URL(data.next).searchParams.get('page') - 1 : 
        totalPages;
    
    let paginationHTML = '<nav><ul class="pagination">';
    
    // Previous button
    if (data.previous) {
        const prevPage = currentPage - 1;
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadProperties(${prevPage})">Previous</a></li>`;
    }
    
    // Page numbers (simplified - show current page ± 2)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="loadProperties(${i})">${i}</a></li>`;
    }
    
    // Next button
    if (data.next) {
        const nextPage = currentPage + 1;
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadProperties(${nextPage})">Next</a></li>`;
    }
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
}

// Show property detail in modal
async function showPropertyDetail(propertyId) {
    try {
        const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/`);
        const property = await response.json();
        
        document.getElementById('modalTitle').textContent = property.title;
        document.getElementById('modalBody').innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    ${property.image 
                        ? `<img src="${property.image}" class="img-fluid mb-3" alt="${property.title}">`
                        : `<div class="property-placeholder mb-3"><i class="fas fa-home fa-5x"></i></div>`
                    }
                    <p>${property.description}</p>
                </div>
                <div class="col-md-4">
                    <table class="table table-sm">
                        <tbody>
                            <tr><td><strong>Price:</strong></td><td class="text-primary h5">$${Number(property.price).toLocaleString()}</td></tr>
                            <tr><td><strong>Type:</strong></td><td>${getTypeDisplay(property.property_type)}</td></tr>
                            <tr><td><strong>Status:</strong></td><td><span class="badge bg-secondary">${getStatusDisplay(property.status)}</span></td></tr>
                            <tr><td><strong>Bedrooms:</strong></td><td><i class="fas fa-bed"></i> ${property.bedrooms}</td></tr>
                            <tr><td><strong>Bathrooms:</strong></td><td><i class="fas fa-bath"></i> ${property.bathrooms}</td></tr>
                            <tr><td><strong>Area:</strong></td><td><i class="fas fa-ruler-combined"></i> ${property.area} sq ft</td></tr>
                            <tr><td><strong>Address:</strong></td><td>${property.address}</td></tr>
                            <tr><td><strong>City:</strong></td><td>${property.city}</td></tr>
                            <tr><td><strong>State:</strong></td><td>${property.state}</td></tr>
                            <tr><td><strong>ZIP:</strong></td><td>${property.zip_code}</td></tr>
                        </tbody>
                    </table>
                    <div class="mt-3">
                        <h6>Location</h6>
                        <div id="property-map" style="height: 300px; width: 100%;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('propertyModal'));
        modal.show();
        
        // Initialize map after modal is shown
        setTimeout(() => {
            initializePropertyMap(property);
        }, 100);
        
    } catch (error) {
        console.error('Error loading property detail:', error);
        alert('Error loading property details');
    }
}

// Initialize property map
function initializePropertyMap(property) {
    // Remove existing map if it exists
    if (propertyMap) {
        propertyMap.remove();
    }
    
    // Use property coordinates if available, otherwise use Bishkek center
    const lat = property.latitude ? parseFloat(property.latitude) : BISHKEK_COORDS[0];
    const lng = property.longitude ? parseFloat(property.longitude) : BISHKEK_COORDS[1];
    
    // Initialize map
    propertyMap = L.map('property-map').setView([lat, lng], 15);
    
    // Add OpenStreetMap tiles (HTTP works for local development)
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(propertyMap);
    
    // Add marker for property location
    const marker = L.marker([lat, lng]).addTo(propertyMap);
    
    // Add popup with property info
    marker.bindPopup(`
        <div>
            <strong>${property.title}</strong><br>
            ${property.address}<br>
            ${property.city}, ${property.state}
        </div>
    `).openPopup();
    
    // Invalidate size to ensure proper rendering
    setTimeout(() => {
        propertyMap.invalidateSize();
    }, 100);
}

// Clear all filters
function clearFilters() {
    document.getElementById('status-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    loadProperties(1);
}

// Helper functions
function getStatusDisplay(status) {
    const statusMap = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'sold': 'Sold',
        'rented': 'Rented'
    };
    return statusMap[status] || status;
}

function getTypeDisplay(type) {
    const typeMap = {
        'house': 'House',
        'apartment': 'Apartment',
        'condo': 'Condo',
        'townhouse': 'Townhouse',
        'land': 'Land'
    };
    return typeMap[type] || type;
}

// Debug function to test each step
function debugMapCreation() {
    console.log('=== DEBUG MAP CREATION ===');
    console.log('1. Leaflet available?', typeof L);
    console.log('2. Map container exists?', document.getElementById('main-map'));
    console.log('3. Bishkek coords:', BISHKEK_COORDS);
    
    try {
        const testMap = L.map('main-map').setView(BISHKEK_COORDS, 12);
        console.log('4. Test map created:', testMap);
        window.testMap = testMap;
    } catch (error) {
        console.log('4. Test map creation failed:', error);
    }
}

// Initialize main map
function initializeMainMap() {
    console.log('Initializing main map...');
    
    try {
        if (!mainMap) {
            console.log('Creating new map instance...');
            
            // Wait a bit for the DOM to be ready
            setTimeout(() => {
                const mapContainer = document.getElementById('main-map');
                console.log('Map container:', mapContainer);
                
                if (!mapContainer) {
                    console.error('Map container not found!');
                    return;
                }
                
                // Initialize map centered on Bishkek
                try {
                    mainMap = L.map('main-map').setView(BISHKEK_COORDS, 12);
                    console.log('Map created successfully');
                    
                    // Add tile load/error event listeners
                    mainMap.on('tileload', function() {
                        console.log('✅ Tile loaded successfully!');
                    });
                    
                    mainMap.on('tileerror', function(e) {
                        console.log('❌ Tile failed to load:', e);
                    });
                    
                } catch (error) {
                    console.error('❌ Failed to create map:', error);
                    return;
                }
                
                // Try multiple tile providers
                const tileProviders = [
                    {
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        options: { attribution: '© OpenStreetMap contributors' }
                    },
                    {
                        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        options: { attribution: '© OpenStreetMap contributors' }
                    },
                    {
                        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                        options: { attribution: '© OpenStreetMap contributors © CARTO', subdomains: 'abcd' }
                    }
                ];
                
                // Add OpenStreetMap tiles (HTTP works for local development)
                try {
                    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(mainMap);
                    console.log('Tiles added to map');
                    
                    // Make mainMap globally accessible for debugging
                    window.debugMap = mainMap;
                    console.log('Map available as window.debugMap for testing');
                    
                } catch (error) {
                    console.error('❌ Failed to add tiles:', error);
                }
                
                // Load properties and add markers
                loadMapProperties();
            }, 100);
        } else {
            console.log('Map already exists, just loading properties');
            // Load properties and add markers
            loadMapProperties();
        }
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Load properties for map display
async function loadMapProperties() {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add filters
        const status = document.getElementById('map-status-filter').value;
        const type = document.getElementById('map-type-filter').value;
        
        if (status) params.append('status', status);
        if (type) params.append('property_type', type);
        
        const response = await fetch(`${API_BASE_URL}/properties/?${params}`);
        const data = await response.json();
        
        // Clear existing markers
        mapMarkers.forEach(marker => mainMap.removeLayer(marker));
        mapMarkers = [];
        
        // Add markers for each property
        data.results.forEach(property => {
            const lat = property.latitude ? parseFloat(property.latitude) : BISHKEK_COORDS[0];
            const lng = property.longitude ? parseFloat(property.longitude) : BISHKEK_COORDS[1];
            
            // Create marker with different colors based on status
            const markerColor = getMarkerColor(property.status);
            const marker = L.marker([lat, lng]).addTo(mainMap);
            
            // Add popup with property info
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h6>${property.title}</h6>
                    <p class="mb-1"><strong>$${Number(property.price).toLocaleString()}</strong></p>
                    <p class="mb-1">${getStatusDisplay(property.status)} | ${getTypeDisplay(property.property_type)}</p>
                    <p class="mb-1"><i class="fas fa-bed"></i> ${property.bedrooms} beds | <i class="fas fa-bath"></i> ${property.bathrooms} baths</p>
                    <p class="mb-2"><i class="fas fa-map-marker-alt"></i> ${property.city}, ${property.state}</p>
                    <button class="btn btn-primary btn-sm" onclick="showPropertyDetail(${property.id})">View Details</button>
                </div>
            `);
            
            mapMarkers.push(marker);
        });
        
        // If we have markers, fit map to show all of them
        if (mapMarkers.length > 0) {
            const group = new L.featureGroup(mapMarkers);
            mainMap.fitBounds(group.getBounds().pad(0.1));
        }
        
    } catch (error) {
        console.error('Error loading map properties:', error);
    }
}

// Get marker color based on property status
function getMarkerColor(status) {
    const colorMap = {
        'sale': 'green',
        'rent': 'blue',
        'sold': 'red',
        'rented': 'orange'
    };
    return colorMap[status] || 'gray';
}

// Clear map filters
function clearMapFilters() {
    document.getElementById('map-status-filter').value = '';
    document.getElementById('map-type-filter').value = '';
    loadMapProperties();
}