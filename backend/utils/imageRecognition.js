/**
 * Image Recognition Utility
 * This provides a mapping of common objects to waste categories
 * In a production system, this would use TensorFlow.js or a cloud API
 */

// Mapping of common object labels to waste categories
const objectToCategory = {
  // Biodegradable
  'banana': 'biodegradable',
  'apple': 'biodegradable',
  'food': 'biodegradable',
  'vegetable': 'biodegradable',
  'fruit': 'biodegradable',
  'organic': 'biodegradable',
  'compost': 'biodegradable',
  'leaf': 'biodegradable',
  'plant': 'biodegradable',
  
  // Recyclable
  'bottle': 'recyclable',
  'can': 'recyclable',
  'plastic': 'recyclable',
  'paper': 'recyclable',
  'cardboard': 'recyclable',
  'metal': 'recyclable',
  'glass': 'recyclable',
  'newspaper': 'recyclable',
  'magazine': 'recyclable',
  
  // Non-biodegradable
  'bag': 'non-biodegradable',
  'container': 'non-biodegradable',
  'wrapper': 'non-biodegradable',
  'styrofoam': 'non-biodegradable',
  'foam': 'non-biodegradable',
  
  // Special/Hazardous
  'battery': 'special',
  'electronic': 'special',
  'chemical': 'hazardous',
  'medicine': 'special',
  'oil': 'hazardous'
};

// Adjectives based on category
const categoryAdjectives = {
  'biodegradable': ['wet', 'organic', 'food waste', 'compostable'],
  'non-biodegradable': ['dry', 'plastic', 'synthetic'],
  'recyclable': ['clean', 'dry', 'reusable'],
  'special': ['electronic', 'hazardous', 'medical'],
  'hazardous': ['toxic', 'chemical', 'dangerous']
};

/**
 * Predict waste category from image labels
 * @param {Array} labels - Array of detected object labels
 * @returns {Object} Prediction result with category and confidence
 */
function predictCategory(labels) {
  if (!labels || labels.length === 0) {
    return {
      category: 'mixed',
      confidence: 0.5,
      adjective: 'mixed',
      description: 'Unable to determine waste type'
    };
  }

  // Convert labels to lowercase for matching
  const lowerLabels = labels.map(l => l.toLowerCase());
  
  // Count matches for each category
  const categoryScores = {
    'biodegradable': 0,
    'non-biodegradable': 0,
    'recyclable': 0,
    'special': 0,
    'hazardous': 0
  };

  // Score each label
  for (const label of lowerLabels) {
    for (const [object, category] of Object.entries(objectToCategory)) {
      if (label.includes(object) || object.includes(label)) {
        categoryScores[category]++;
        break;
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

  // If no matches, default to mixed
  if (maxScore === 0) {
    predictedCategory = 'mixed';
  }

  // Calculate confidence (simple heuristic)
  const totalLabels = labels.length;
  const confidence = totalLabels > 0 ? Math.min(maxScore / totalLabels, 0.95) : 0.5;

  // Get appropriate adjective
  const adjectives = categoryAdjectives[predictedCategory] || ['mixed'];
  const adjective = adjectives[0];

  return {
    category: predictedCategory,
    confidence: confidence,
    adjective: adjective,
    description: `Detected as ${predictedCategory} waste based on image analysis`
  };
}

/**
 * Enhanced prediction using TensorFlow.js MobileNet (client-side)
 * This function will be called from the frontend
 * @param {string} imageData - Base64 image data or image element
 * @returns {Promise<Object>} Prediction result
 */
async function predictWithTensorFlow(imageElement) {
  // This will be implemented in the frontend using TensorFlow.js
  // The backend can provide this as a fallback or for server-side processing
  return {
    category: 'mixed',
    confidence: 0.5,
    adjective: 'mixed',
    description: 'Using default prediction'
  };
}

module.exports = {
  predictCategory,
  predictWithTensorFlow,
  objectToCategory,
  categoryAdjectives
};
