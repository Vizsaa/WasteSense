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

// ── Reset ALL form state for a clean slate ───────────────────────
function resetForm() {
    // Uncheck ALL waste type checkboxes
    document.querySelectorAll('input[name="waste_types"]').forEach(cb => { cb.checked = false; });
    // Uncheck ALL waste adjective checkboxes
    document.querySelectorAll('input[name="waste_adjectives"]').forEach(cb => { cb.checked = false; });
    // Clear description
    const desc = document.getElementById('wasteDescription');
    if (desc) desc.value = '';
    // Hide and reset prediction display
    const predResult = document.getElementById('predictionResult');
    if (predResult) predResult.classList.remove('show');
    document.getElementById('predictedCategory').textContent = '-';
    document.getElementById('predictionConfidence').textContent = '-';
    document.getElementById('predictedAdjective').textContent = '-';
    // Clear previous prediction data
    predictionData = null;
    // Clear alert messages
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) alertContainer.innerHTML = '';
}

// Handle image selection
async function handleImageSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        return;
    }

    const uploadSection = document.getElementById('uploadSection');
    const uploadContent = document.getElementById('uploadContent');
    const analyzingIndicator = document.getElementById('analyzingIndicator');
    const analyzeText = analyzingIndicator ? analyzingIndicator.querySelector('p') : null;

    // Stage 1: Validating image
    analyzingIndicator.style.display = 'block';
    if (analyzeText) analyzeText.textContent = 'Validating image...';
    uploadSection.style.pointerEvents = 'none';
    uploadSection.style.opacity = '0.7';

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
        showAlert('Please select a valid image file (JPEG, PNG, GIF, or WebP).', 'error');
        currentImageFile = null;
        analyzingIndicator.style.display = 'none';
        uploadSection.style.pointerEvents = '';
        uploadSection.style.opacity = '';
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showAlert(`Image file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`, 'error');
        currentImageFile = null;
        analyzingIndicator.style.display = 'none';
        uploadSection.style.pointerEvents = '';
        uploadSection.style.opacity = '';
        return;
    }

    // CRITICAL: Reset form completely before processing new image
    resetForm();

    currentImageFile = file;
    if (analyzeText) analyzeText.textContent = 'Processing image...';

    // Show preview — keep upload area disabled until analysis finishes
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.classList.add('show');
        
        // Analyze image (upload area stays disabled — analyzeImage re-enables on completion)
        analyzeImage(e.target.result);
    };
    reader.onerror = () => {
        showAlert('Failed to read image file. Please try again.', 'error');
        analyzingIndicator.style.display = 'none';
        uploadSection.style.pointerEvents = '';
        uploadSection.style.opacity = '';
    };
    reader.readAsDataURL(file);
}

// Analyze image with TensorFlow.js
async function analyzeImage(imageSrc) {
    const analyzingIndicator = document.getElementById('analyzingIndicator');
    const predictionResult = document.getElementById('predictionResult');
    const analyzeText = analyzingIndicator.querySelector('p');
    const uploadSection = document.getElementById('uploadSection');

    // Helper to re-enable upload area
    function enableUploadArea() {
        uploadSection.style.pointerEvents = '';
        uploadSection.style.opacity = '';
    }
    
    analyzingIndicator.style.display = 'block';
    predictionResult.classList.remove('show');
    if (analyzeText) analyzeText.textContent = 'Loading AI model...';

    try {
        // Create image element
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async () => {
            try {
                let predictions = null;
                
                // Use TensorFlow.js if model is loaded
                if (model) {
                    if (analyzeText) analyzeText.textContent = 'Analyzing waste image...';
                    // Classify with top-5 for better accuracy
                    predictions = await model.classify(img, 5);
                    console.log('TensorFlow predictions:', predictions);
                }

                if (analyzeText) analyzeText.textContent = 'Processing results...';

                // Process predictions
                const result = processPredictions(predictions);
                predictionData = result;

                // Display results
                displayPrediction(result);
                
                // Auto-fill form
                autoFillForm(result);

                // Show brief success confirmation
                showAlert('Image analyzed successfully! Review the predictions below.', 'success');

            } catch (error) {
                console.error('Analysis error:', error);
                const fallbackResult = {
                    category: 'mixed',
                    confidence: 30,
                    adjective: 'mixed',
                    description: 'Unable to determine waste type — please select manually'
                };
                predictionData = fallbackResult;
                displayPrediction(fallbackResult);
                autoFillForm(fallbackResult);
                showAlert('AI analysis had low confidence. Please select the correct waste type manually.', 'error');
            } finally {
                analyzingIndicator.style.display = 'none';
                enableUploadArea();
            }
        };

        img.onerror = () => {
            analyzingIndicator.style.display = 'none';
            enableUploadArea();
            showAlert('Failed to load image for analysis. Please try a different image.', 'error');
        };

        img.src = imageSrc;
    } catch (error) {
        console.error('Error analyzing image:', error);
        analyzingIndicator.style.display = 'none';
        enableUploadArea();
        showAlert('Error analyzing image. Please try again.', 'error');
    }
}

// Process TensorFlow predictions into waste categories
function processPredictions(predictions) {
    if (!predictions || predictions.length === 0) {
        return {
            category: 'mixed',
            confidence: 30,
            adjective: 'mixed',
            description: 'Unable to determine waste type — please select manually'
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

        // Non-biodegradable (specific items only — generic 'bag'/'plastic'/'dry' stay recyclable above)
        'wrapper': 'non-biodegradable',
        'styrofoam': 'non-biodegradable',
        'foam': 'non-biodegradable',
        'plastic bag': 'non-biodegradable',
        'plastic wrap': 'non-biodegradable',
        'synthetic': 'non-biodegradable',
        'diaper': 'non-biodegradable',
        'sanitary': 'non-biodegradable',
        'rubber': 'non-biodegradable',
        'nylon': 'non-biodegradable',
        'polystyrene': 'non-biodegradable',
        'polyester': 'non-biodegradable',
        'vinyl': 'non-biodegradable',
        'acrylic': 'non-biodegradable',
        'fiberglass': 'non-biodegradable',

        // Special / E-waste (overrides recyclable for electronics)
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
        'electronics': 'special',
        'fluorescent': 'hazardous',
        'pesticide': 'hazardous',
        'paint': 'hazardous',
        'solvent': 'hazardous',
        'aerosol': 'hazardous',
        'syringe': 'special',
        'needle': 'special',
        'thermometer': 'special'
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
            if (cleanWord.length < 3) continue; // Skip very short words to avoid false matches

            for (const [object, category] of Object.entries(categoryMapping)) {
                // Require exact match for short keys (<=4 chars), substring for longer
                let matched = false;
                if (object.length <= 4 || cleanWord.length <= 4) {
                    matched = cleanWord === object;
                } else {
                    matched = cleanWord.includes(object) || object.includes(cleanWord);
                }

                if (matched) {
                    // Apply score with weight based on prediction rank
                    const rankWeight = 1.0 - (topPredictions.indexOf(pred) * 0.1);
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

// Display prediction results with confidence color coding
function displayPrediction(result) {
    const categoryEl = document.getElementById('predictedCategory');
    const confidenceEl = document.getElementById('predictionConfidence');
    const adjectiveEl = document.getElementById('predictedAdjective');

    categoryEl.textContent = result.category;
    confidenceEl.textContent = result.confidence;
    adjectiveEl.textContent = result.adjective;

    // Color-code confidence badge
    if (result.confidence >= 75) {
        categoryEl.style.background = '#28a745';
        confidenceEl.style.color = '#28a745';
    } else if (result.confidence >= 50) {
        categoryEl.style.background = '#ffc107';
        categoryEl.style.color = '#333';
        confidenceEl.style.color = '#856404';
    } else {
        categoryEl.style.background = '#dc3545';
        confidenceEl.style.color = '#dc3545';
    }

    const predictionResult = document.getElementById('predictionResult');
    predictionResult.classList.add('show');
}

// Auto-fill form with NEW predictions (form is already reset by handleImageSelect)
function autoFillForm(result) {
    // Check ONLY the predicted waste type
    document.querySelectorAll('input[name="waste_types"]').forEach(cb => {
        cb.checked = (cb.value === result.category);
    });
    // Also check 'mixed' if confidence is very low
    if (result.confidence < 50) {
        const mixedCb = document.querySelector('input[name="waste_types"][value="mixed"]');
        if (mixedCb) mixedCb.checked = true;
    }

    // Check ONLY the predicted adjective
    document.querySelectorAll('input[name="waste_adjectives"]').forEach(cb => {
        cb.checked = (cb.value === result.adjective);
    });

    // Always set description from new prediction (form was already cleared)
    const descriptionField = document.getElementById('wasteDescription');
    if (descriptionField) {
        descriptionField.value = result.description || '';
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

// ── Client-side image compression ──────────────────────────────────
// Resizes and compresses to JPEG on a canvas to cut upload size while
// keeping enough quality for MobileNet recognition.
function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = Math.round(h * maxWidth / w);
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
                        console.log(`Compressed: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB`);
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file); // fallback to original on error
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

// ── Geocode text address via OpenStreetMap Nominatim ───────────────
async function geocodeAddress() {
    const addressField = document.getElementById('addressDescription');
    const barangaySelect = document.getElementById('barangaySelect');
    const btn = document.getElementById('geocodeBtn');
    const status = document.getElementById('geocodeStatus');

    // Build query from address + selected barangay
    const selectedOption = barangaySelect.options[barangaySelect.selectedIndex];
    const barangayText = selectedOption && selectedOption.value ? selectedOption.textContent : '';
    const rawAddress = (addressField.value.trim() + ', ' + barangayText).replace(/,\s*$/, '');

    if (!rawAddress || rawAddress.length < 5) {
        status.textContent = 'Please enter an address or landmark first.';
        status.style.color = '#dc3545';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Looking up...';
    status.textContent = '';

    try {
        const q = encodeURIComponent(rawAddress + ', Philippines');
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
            headers: { 'Accept-Language': 'en' }
        });
        const results = await resp.json();

        if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);
            updateMapFromLatLng(lat, lng);
            status.textContent = 'Coordinates set from address.';
            status.style.color = '#28a745';
        } else {
            status.textContent = 'Address not found. Try a more specific address or use GPS.';
            status.style.color = '#dc3545';
        }
    } catch (err) {
        console.error('Geocoding error:', err);
        status.textContent = 'Geocoding failed. Please try again or use GPS.';
        status.style.color = '#dc3545';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Lookup Coordinates from Address';
    }
}

// ── Upload overlay helpers ─────────────────────────────────────────
function showOverlay(statusText, percent, subText) {
    const overlay = document.getElementById('uploadOverlay');
    const spinner = document.getElementById('overlaySpinner');
    const checkmark = document.getElementById('overlayCheckmark');
    overlay.classList.add('active');
    spinner.style.display = 'block';
    checkmark.style.display = 'none';
    document.getElementById('overlayStatus').textContent = statusText || 'Processing...';
    document.getElementById('overlayProgressBar').style.width = (percent || 0) + '%';
    document.getElementById('overlaySubstatus').textContent = subText || '';
}
function hideOverlay() {
    document.getElementById('uploadOverlay').classList.remove('active');
}
function showOverlaySuccess(msg) {
    const spinner = document.getElementById('overlaySpinner');
    const checkmark = document.getElementById('overlayCheckmark');
    spinner.style.display = 'none';
    checkmark.style.display = 'block';
    checkmark.textContent = '✓';
    document.getElementById('overlayStatus').textContent = msg || 'Done!';
    document.getElementById('overlayProgressBar').style.width = '100%';
    document.getElementById('overlaySubstatus').textContent = '';
}

// ── Handle form submission with compression + staged overlay ──────
document.getElementById('wasteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentImageFile) {
        showAlert('Please upload an image of your waste.', 'error');
        return;
    }

    // Validate selections before confirming
    const selectedWasteTypes = Array.from(document.querySelectorAll('input[name="waste_types"]:checked')).map(cb => cb.value);
    if (selectedWasteTypes.length === 0) {
        showAlert('Please select at least one waste type.', 'error');
        return;
    }
    const selectedWasteAdjectives = Array.from(document.querySelectorAll('input[name="waste_adjectives"]:checked')).map(cb => cb.value);
    if (selectedWasteAdjectives.length === 0) {
        showAlert('Please select at least one waste adjective.', 'error');
        return;
    }

    const confirmed = window.confirm('Submit this waste collection request now?');
    if (!confirmed) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Stage 1: Compress image
        showOverlay('Compressing image...', 10, 'Optimizing file size for faster upload');
        const compressedFile = await compressImage(currentImageFile);
        const savedPct = currentImageFile.size > 0
            ? Math.round((1 - compressedFile.size / currentImageFile.size) * 100) : 0;

        // Stage 2: Build form data
        showOverlay('Preparing submission...', 30, savedPct > 5 ? `Image compressed by ${savedPct}%` : 'Image ready');
        const formData = new FormData();
        formData.append('image', compressedFile);
        formData.append('predicted_category', predictionData?.category || '');
        formData.append('confidence_score', predictionData?.confidence || '');
        formData.append('waste_types', JSON.stringify(selectedWasteTypes));
        formData.append('waste_adjectives', JSON.stringify(selectedWasteAdjectives));
        formData.append('waste_description', document.getElementById('wasteDescription').value);
        formData.append('barangay_id', document.getElementById('barangaySelect').value);
        formData.append('address_description', document.getElementById('addressDescription').value);
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        if (lat) formData.append('latitude', lat);
        if (lng) formData.append('longitude', lng);

        // Stage 3: Upload via XHR for progress tracking
        showOverlay('Uploading...', 40, 'Sending data to server');
        const result = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/waste/submit', true);
            xhr.withCredentials = true;

            xhr.upload.addEventListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    const pct = Math.round(40 + (evt.loaded / evt.total) * 50); // 40-90%
                    showOverlay('Uploading...', pct, `${Math.round(evt.loaded/1024)}KB / ${Math.round(evt.total/1024)}KB`);
                }
            });

            xhr.onload = () => {
                try {
                    resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) });
                } catch { resolve({ status: xhr.status, data: { status: 'error', message: 'Invalid server response' } }); }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
        });

        // Stage 4: Processing complete
        showOverlay('Processing...', 95, 'Finalizing submission');

        if (result.status >= 200 && result.status < 300 && result.data.status === 'success') {
            showOverlaySuccess('Submission created successfully!');
            setTimeout(() => {
                hideOverlay();
                window.location.href = 'my-submissions.html';
            }, 1500);
        } else {
            hideOverlay();
            showAlert(result.data.message || 'Failed to submit waste. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Waste Collection Request';
        }
    } catch (error) {
        console.error('Submit error:', error);
        hideOverlay();
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
