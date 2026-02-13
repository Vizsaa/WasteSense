/**
 * Waste Submission with TensorFlow.js Image Recognition
 */

let model = null;
let currentImageFile = null;
let predictionData = null;
let mapInstance = null;
let mapMarker = null;

// Initialize TensorFlow.js model
async function loadModel() {
    try {
        console.log('Loading TensorFlow.js MobileNet model...');
        model = await mobilenet.load();
        console.log('Model loaded successfully!');
        return true;
    } catch (error) {
        console.error('Error loading model:', error);
        showAlert('Failed to load AI model. Basic categorization will be used.', 'error');
        return false;
    }
}

// Load model on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = await checkAuthStatus();
    if (!user) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Load TensorFlow model
    await loadModel();

    // Load barangays
    await loadBarangays();

    // Setup image upload
    setupImageUpload();

    // Setup interactive map if Leaflet is available
    initMapIfAvailable();
});

// Setup image upload handlers
function setupImageUpload() {
    const imageInput = document.getElementById('imageInput');
    const uploadSection = document.getElementById('uploadSection');

    // Click to upload
    imageInput.addEventListener('change', handleImageSelect);

    // Drag and drop
    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', () => {
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            imageInput.files = files;
            handleImageSelect({ target: imageInput });
        }
    });
}

// Handle image selection
async function handleImageSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        return;
    }

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
        showAlert('Please select a valid image file.', 'error');
        currentImageFile = null;
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('Image file is too large. Maximum size is 5MB.', 'error');
        currentImageFile = null;
        return;
    }

    currentImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.classList.add('show');
        
        // Analyze image
        analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Analyze image with TensorFlow.js
async function analyzeImage(imageSrc) {
    const analyzingIndicator = document.getElementById('analyzingIndicator');
    const predictionResult = document.getElementById('predictionResult');
    
    analyzingIndicator.style.display = 'block';
    predictionResult.classList.remove('show');

    try {
        // Create image element
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async () => {
            try {
                let predictions = null;
                
                // Use TensorFlow.js if model is loaded
                if (model) {
                    predictions = await model.classify(img);
                    console.log('TensorFlow predictions:', predictions);
                }

                // Process predictions
                const result = processPredictions(predictions);
                predictionData = result;

                // Display results
                displayPrediction(result);
                
                // Auto-fill form
                autoFillForm(result);

            } catch (error) {
                console.error('Analysis error:', error);
                // Fallback to basic prediction
                const fallbackResult = {
                    category: 'mixed',
                    confidence: 0.5,
                    adjective: 'mixed',
                    description: 'Unable to determine waste type'
                };
                displayPrediction(fallbackResult);
                autoFillForm(fallbackResult);
            } finally {
                analyzingIndicator.style.display = 'none';
            }
        };

        img.src = imageSrc;
    } catch (error) {
        console.error('Error analyzing image:', error);
        analyzingIndicator.style.display = 'none';
        showAlert('Error analyzing image. Please try again.', 'error');
    }
}

// Process TensorFlow predictions into waste categories
function processPredictions(predictions) {
    if (!predictions || predictions.length === 0) {
        return {
            category: 'mixed',
            confidence: 0.5,
            adjective: 'mixed',
            description: 'Unable to determine waste type'
        };
    }

    // Enhanced mapping of common objects to waste categories with more specific terms
    const categoryMapping = {
        // Biodegradable - Food items
        'banana': 'biodegradable',
        'apple': 'biodegradable',
        'orange': 'biodegradable',
        'lemon': 'biodegradable',
        'fig': 'biodegradable',
        'grape': 'biodegradable',
        'strawberry': 'biodegradable',
        'mango': 'biodegradable',
        'pineapple': 'biodegradable',
        'peach': 'biodegradable',
        'pear': 'biodegradable',
        'cherry': 'biodegradable',
        'coconut': 'biodegradable',
        'watermelon': 'biodegradable',
        'avocado': 'biodegradable',
        'kiwi': 'biodegradable',
        'tomato': 'biodegradable',
        'carrot': 'biodegradable',
        'broccoli': 'biodegradable',
        'lettuce': 'biodegradable',
        'onion': 'biodegradable',
        'potato': 'biodegradable',
        'corn': 'biodegradable',
        'cucumber': 'biodegradable',
        'celery': 'biodegradable',
        'garlic': 'biodegradable',
        'ginger': 'biodegradable',
        'pepper': 'biodegradable',
        'egg': 'biodegradable',
        'cheese': 'biodegradable',
        'bread': 'biodegradable',
        'cake': 'biodegradable',
        'cookie': 'biodegradable',
        'meat': 'biodegradable',
        'beef': 'biodegradable',
        'chicken': 'biodegradable',
        'fish': 'biodegradable',
        'seafood': 'biodegradable',
        'rice': 'biodegradable',
        'pasta': 'biodegradable',
        'cereal': 'biodegradable',
        'yogurt': 'biodegradable',
        'ice cream': 'biodegradable',
        'coffee': 'biodegradable',
        'tea': 'biodegradable',
        'wine': 'biodegradable',
        'beer': 'biodegradable',
        'juice': 'biodegradable',
        'soup': 'biodegradable',
        'salad': 'biodegradable',
        'sandwich': 'biodegradable',
        'pizza': 'biodegradable',
        'hamburger': 'biodegradable',
        'hot dog': 'biodegradable',
        'taco': 'biodegradable',
        'burrito': 'biodegradable',
        'sushi': 'biodegradable',
        'ramen': 'biodegradable',
        'noodles': 'biodegradable',
        'food': 'biodegradable',
        'vegetable': 'biodegradable',
        'fruit': 'biodegradable',
        'organic': 'biodegradable',
        'compost': 'biodegradable',
        'leaf': 'biodegradable',
        'plant': 'biodegradable',
        'tree': 'biodegradable',
        'flower': 'biodegradable',
        'grass': 'biodegradable',
        'wood': 'biodegradable',
        'branch': 'biodegradable',
        'bark': 'biodegradable',
        'seed': 'biodegradable',
        'nut': 'biodegradable',
        'peanut': 'biodegradable',
        'walnut': 'biodegradable',
        'almond': 'biodegradable',
        'cashew': 'biodegradable',
        'garbage': 'biodegradable',
        'trash': 'biodegradable',
        'kitchen waste': 'biodegradable',
        'food scraps': 'biodegradable',
        'peel': 'biodegradable',
        'rind': 'biodegradable',
        'core': 'biodegradable',
        'stem': 'biodegradable',
        'root': 'biodegradable',
        'herb': 'biodegradable',
        'spice': 'biodegradable',
        'mushroom': 'biodegradable',
        'eggshell': 'biodegradable',
        'coffee grounds': 'biodegradable',
        'tea leaves': 'biodegradable',
        'wet': 'biodegradable',
        'wet waste': 'biodegradable',
        'organic waste': 'biodegradable',
        'food waste': 'biodegradable',
        'compostable': 'biodegradable',

        // Recyclable - Plastics and materials
        'bottle': 'recyclable',
        'plastic': 'recyclable',
        'container': 'recyclable',
        'cup': 'recyclable',
        'jar': 'recyclable',
        'jug': 'recyclable',
        'bucket': 'recyclable',
        'tub': 'recyclable',
        'box': 'recyclable',
        'carton': 'recyclable',
        'packaging': 'recyclable',
        'film': 'recyclable',
        'wrap': 'recyclable',
        'bag': 'recyclable',
        'bowl': 'recyclable',
        'plate': 'recyclable',
        'tray': 'recyclable',
        'lid': 'recyclable',
        'cap': 'recyclable',
        'stopper': 'recyclable',
        'tube': 'recyclable',
        'pipe': 'recyclable',
        'straw': 'recyclable',
        'fork': 'recyclable',
        'spoon': 'recyclable',
        'knife': 'recyclable',
        'utensil': 'recyclable',
        'toy': 'recyclable',
        'tool': 'recyclable',
        'part': 'recyclable',
        'gear': 'recyclable',
        'wheel': 'recyclable',
        'handle': 'recyclable',
        'frame': 'recyclable',
        'panel': 'recyclable',
        'sheet': 'recyclable',
        'rod': 'recyclable',
        'bar': 'recyclable',
        'wire': 'recyclable',
        'cable': 'recyclable',
        'cord': 'recyclable',
        'rope': 'recyclable',
        'chain': 'recyclable',
        'belt': 'recyclable',
        'hose': 'recyclable',
        'tire': 'recyclable',
        'seal': 'recyclable',
        'gasket': 'recyclable',
        'washer': 'recyclable',
        'bearing': 'recyclable',
        'spring': 'recyclable',
        'valve': 'recyclable',
        'pump': 'recyclable',
        'compressor': 'recyclable',
        'motor': 'recyclable',
        'generator': 'recyclable',
        'transformer': 'recyclable',
        'switch': 'recyclable',
        'relay': 'recyclable',
        'fuse': 'recyclable',
        'breaker': 'recyclable',
        'socket': 'recyclable',
        'plug': 'recyclable',
        'adapter': 'recyclable',
        'charger': 'recyclable',
        'circuit': 'recyclable',
        'board': 'recyclable',
        'chip': 'recyclable',
        'processor': 'recyclable',
        'memory': 'recyclable',
        'disk': 'recyclable',
        'drive': 'recyclable',
        'printer': 'recyclable',
        'scanner': 'recyclable',
        'copier': 'recyclable',
        'fax': 'recyclable',
        'phone': 'recyclable',
        'cellular': 'recyclable',
        'mobile': 'recyclable',
        'smartphone': 'recyclable',
        'tablet': 'recyclable',
        'laptop': 'recyclable',
        'computer': 'recyclable',
        'keyboard': 'recyclable',
        'mouse': 'recyclable',
        'monitor': 'recyclable',
        'television': 'recyclable',
        'tv': 'recyclable',
        'screen': 'recyclable',
        'display': 'recyclable',
        'camera': 'recyclable',
        'lens': 'recyclable',
        'paper': 'recyclable',
        'newspaper': 'recyclable',
        'magazine': 'recyclable',
        'book': 'recyclable',
        'notebook': 'recyclable',
        'journal': 'recyclable',
        'cardboard': 'recyclable',
        'card': 'recyclable',
        'envelope': 'recyclable',
        'folder': 'recyclable',
        'metal': 'recyclable',
        'aluminum': 'recyclable',
        'steel': 'recyclable',
        'iron': 'recyclable',
        'copper': 'recyclable',
        'glass': 'recyclable',
        'ceramic': 'recyclable',
        'clean': 'recyclable',
        'dry': 'recyclable',
        'reusable': 'recyclable',
        'recyclable': 'recyclable',

        // Non-biodegradable
        'bag': 'non-biodegradable',  // Plastic bags
        'wrapper': 'non-biodegradable',
        'styrofoam': 'non-biodegradable',
        'foam': 'non-biodegradable',
        'plastic bag': 'non-biodegradable',
        'plastic wrap': 'non-biodegradable',
        'synthetic': 'non-biodegradable',
        'dry': 'non-biodegradable',
        'plastic': 'non-biodegradable',

        // Special/Hazardous
        'battery': 'special',
        'electronic': 'special',
        'computer': 'special',
        'phone': 'special',
        'chemical': 'hazardous',
        'medicine': 'special',
        'oil': 'hazardous',
        'hazardous': 'hazardous',
        'toxic': 'hazardous',
        'medical': 'special',
        'electrical': 'special',
        'electronics': 'special'
    };

    // Score categories based on predictions with improved confidence calculation
    const categoryScores = {
        'biodegradable': 0,
        'non-biodegradable': 0,
        'recyclable': 0,
        'special': 0,
        'hazardous': 0
    };

    // Process top predictions with confidence weighting
    const topPredictions = predictions.slice(0, 5);
    let totalScore = 0;

    for (const pred of topPredictions) {
        const label = pred.className.toLowerCase();
        const score = pred.probability;

        // Check each word in the label
        const words = label.split(/[\s,]+/);
        for (const word of words) {
            // Remove common suffixes that might affect matching
            const cleanWord = word.replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '');

            for (const [object, category] of Object.entries(categoryMapping)) {
                // Check for exact match or substring match
                if (cleanWord.includes(object) || object.includes(cleanWord)) {
                    // Apply score with weight based on prediction rank (top predictions get higher weight)
                    const rankWeight = 1.0 - (topPredictions.indexOf(pred) * 0.1); // Reduce weight for lower-ranked predictions
                    categoryScores[category] += score * rankWeight;
                    totalScore += score * rankWeight;
                    break;
                }
            }
        }
    }

    // Find category with highest score
    let maxScore = 0;
    let predictedCategory = 'mixed';

    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > maxScore) {
            maxScore = score;
            predictedCategory = category;
        }
    }

    // Calculate confidence percentage with improved formula
    let confidence = 0;
    if (totalScore > 0) {
        // Confidence is based on the proportion of the winning category's score to total score
        confidence = Math.min(Math.max((maxScore / totalScore) * 100, 0), 100);

        // Apply additional confidence boost if the winning category significantly outperforms others
        const secondBest = Object.values(categoryScores).sort((a, b) => b - a)[1] || 0;
        if (secondBest > 0 && maxScore > secondBest * 2) {
            confidence = Math.min(confidence * 1.2, 100); // Boost confidence if winner is much stronger
        }
    }

    // If no matches, default to mixed with low confidence
    if (maxScore === 0) {
        predictedCategory = 'mixed';
        confidence = 30; // Low confidence for mixed
    }

    // Get appropriate adjective based on category and confidence
    const adjectives = {
        'biodegradable': ['wet', 'organic', 'food waste', 'compostable'],
        'non-biodegradable': ['dry', 'plastic', 'synthetic'],
        'recyclable': ['clean', 'dry', 'reusable'],
        'special': ['electronic', 'hazardous', 'medical'],
        'hazardous': ['toxic', 'chemical', 'dangerous'],
        'mixed': ['mixed', 'uncertain', 'unknown']
    };

    const categoryAdjectives = adjectives[predictedCategory] || ['mixed'];

    // Select adjective based on confidence level
    let adjective;
    if (confidence >= 70) {
        adjective = categoryAdjectives[0]; // High confidence gets primary adjective
    } else if (confidence >= 50) {
        adjective = categoryAdjectives[1] || categoryAdjectives[0]; // Medium confidence gets secondary
    } else {
        adjective = categoryAdjectives[2] || categoryAdjectives[0]; // Low confidence gets tertiary or primary
    }

    return {
        category: predictedCategory,
        confidence: Math.round(confidence),
        adjective: adjective,
        description: `Detected as ${predictedCategory} waste with ${Math.round(confidence)}% confidence`
    };
}

// Display prediction results
function displayPrediction(result) {
    document.getElementById('predictedCategory').textContent = result.category;
    document.getElementById('predictionConfidence').textContent = result.confidence;
    document.getElementById('predictedAdjective').textContent = result.adjective;

    const predictionResult = document.getElementById('predictionResult');
    predictionResult.classList.add('show');
}

// Auto-fill form with predictions
function autoFillForm(result) {
    // Set waste types checkboxes based on predicted category
    const wasteTypeCheckboxes = document.querySelectorAll('input[name="waste_types"]');
    wasteTypeCheckboxes.forEach(checkbox => {
        // Check the predicted category
        if (checkbox.value === result.category) {
            checkbox.checked = true;
        }
        // Also check 'mixed' if confidence is low
        if (result.confidence < 60 && result.category === 'mixed') {
            const mixedCheckbox = document.querySelector('input[name="waste_types"][value="mixed"]');
            if (mixedCheckbox) mixedCheckbox.checked = true;
        }
    });

    // Set waste adjectives checkboxes based on predicted adjective
    const adjectiveCheckboxes = document.querySelectorAll('input[name="waste_adjectives"]');
    adjectiveCheckboxes.forEach(checkbox => {
        if (checkbox.value === result.adjective) {
            checkbox.checked = true;
        }
    });

    // Set description
    const descriptionField = document.getElementById('wasteDescription');
    if (!descriptionField.value) {
        descriptionField.value = result.description;
    }
}

// Load barangays from API
async function loadBarangays() {
    try {
        const response = await fetch('/api/locations', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const select = document.getElementById('barangaySelect');
            
            select.innerHTML = '<option value="">Select barangay/village</option>';
            
            if (data.data && data.data.length > 0) {
                data.data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.location_id;
                    option.textContent = `${location.barangay_name}, ${location.municipality}`;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">No barangays available. Please contact admin.</option>';
            }
        } else {
            console.error('Failed to load barangays');
            document.getElementById('barangaySelect').innerHTML = '<option value="">Error loading barangays</option>';
        }
    } catch (error) {
        console.error('Error loading barangays:', error);
        document.getElementById('barangaySelect').innerHTML = '<option value="">Error loading barangays</option>';
    }
}

// Initialize Leaflet map, if library is loaded
function initMapIfAvailable() {
    const container = document.getElementById('mapContainer');
    if (!container || typeof L === 'undefined') {
        // Fallback text if Leaflet is not available
        if (container) {
            container.textContent = 'Map preview will appear here when coordinates are set.';
        }
        return;
    }

    mapInstance = L.map('mapContainer').setView([14.5995, 120.9842], 12); // Default: Manila-ish
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
}

function updateMapFromLatLng(lat, lng) {
    if (!mapInstance || typeof L === 'undefined') {
        // Simple text fallback
        const container = document.getElementById('mapContainer');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p>📍 Location captured!</p>
                    <p style="font-size: 12px;">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
                </div>
            `;
        }
        return;
    }

    const position = [lat, lng];
    if (!mapMarker) {
        mapMarker = L.marker(position).addTo(mapInstance);
    } else {
        mapMarker.setLatLng(position);
    }
    mapInstance.setView(position, 16);
}

// Get current GPS location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showAlert('Geolocation is not supported by your browser.', 'error');
        return;
    }

    const btn = document.getElementById('currentLocationBtn');
    btn.disabled = true;
    btn.textContent = '📍 Getting location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);

            updateMapFromLatLng(lat, lng);
            
            btn.disabled = false;
            btn.textContent = 'Use My Current Location';
            showAlert('Location captured successfully!', 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            showAlert('Failed to get your location. Please enter coordinates manually.', 'error');
            btn.disabled = false;
            btn.textContent = 'Use My Current Location';
        }
    );
}

// Handle form submission
document.getElementById('wasteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentImageFile) {
        showAlert('Please upload an image of your waste.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');

    // Ask for confirmation before actually submitting
    const confirmed = window.confirm('Submit this waste collection request now?');
    if (!confirmed) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('image', currentImageFile);
        formData.append('predicted_category', predictionData?.category || '');
        
        // Get selected waste types (checkboxes)
        const selectedWasteTypes = Array.from(document.querySelectorAll('input[name="waste_types"]:checked'))
            .map(cb => cb.value);
        
        if (selectedWasteTypes.length === 0) {
            showAlert('Please select at least one waste type.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Waste Collection Request';
            return;
        }
        
        // Get selected waste adjectives (checkboxes)
        const selectedWasteAdjectives = Array.from(document.querySelectorAll('input[name="waste_adjectives"]:checked'))
            .map(cb => cb.value);
        
        if (selectedWasteAdjectives.length === 0) {
            showAlert('Please select at least one waste type/adjective.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Waste Collection Request';
            return;
        }
        
        formData.append('waste_types', JSON.stringify(selectedWasteTypes));
        formData.append('waste_adjectives', JSON.stringify(selectedWasteAdjectives));
        formData.append('waste_description', document.getElementById('wasteDescription').value);
        formData.append('barangay_id', document.getElementById('barangaySelect').value);
        formData.append('address_description', document.getElementById('addressDescription').value);
        
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        if (lat) formData.append('latitude', lat);
        if (lng) formData.append('longitude', lng);

        // Submit to server
        const response = await fetch('/api/waste/submit', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showAlert('Waste submission created successfully!', 'success');
            
            // Reset form after 2 seconds
            setTimeout(() => {
                window.location.href = 'my-submissions.html';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to submit waste. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Waste Collection Request';
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('An error occurred. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Waste Collection Request';
    }
});

// Show alert message
function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}
