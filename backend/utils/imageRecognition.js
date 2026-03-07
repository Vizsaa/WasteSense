/**
 * WasteSense Image Recognition
 * Uses TensorFlow.js + MobileNet to analyze real waste images
 * and map detected objects to waste categories.
 *
 * Falls back gracefully if model loading or analysis fails.
 */

// Try native bindings first, fall back to pure JS
let tf;
try {
  tf = require('@tensorflow/tfjs-node');
  console.log('[ImageRecognition] Using tfjs-node (native)');
} catch (e) {
  tf = require('@tensorflow/tfjs');
  console.log('[ImageRecognition] Using tfjs (pure JS — slower but compatible)');
}

const mobilenet = require('@tensorflow-models/mobilenet');
const { Jimp } = require('jimp');

// ─── Model singleton — load once, reuse ───────────────────────────────────────
let model = null;
let modelLoadPromise = null;

async function getModel() {
  if (model) return model;
  if (modelLoadPromise) return modelLoadPromise;

  console.log('[ImageRecognition] Loading MobileNet model (this may take a moment on first run)...');
  modelLoadPromise = (async () => {
    // Explicitly initialize the CPU backend for pure-JS mode
    await tf.setBackend('cpu');
    await tf.ready();
    console.log('[ImageRecognition] TF backend ready:', tf.getBackend());

    const m = await mobilenet.load({ version: 2, alpha: 1.0 });
    model = m;
    console.log('[ImageRecognition] ✅ MobileNet model loaded successfully.');
    return model;
  })().catch(err => {
    console.error('[ImageRecognition] ❌ Model load failed:', err.message);
    modelLoadPromise = null; // Allow retry
    throw err;
  });

  return modelLoadPromise;
}

// ─── Waste category mapping ────────────────────────────────────────────────────
// Maps MobileNet ImageNet labels → WasteSense categories
const labelToCategoryMap = {
  // Biodegradable — food items
  'banana': 'biodegradable',
  'apple': 'biodegradable',
  'orange': 'biodegradable',
  'lemon': 'biodegradable',
  'strawberry': 'biodegradable',
  'pineapple': 'biodegradable',
  'fig': 'biodegradable',
  'pomegranate': 'biodegradable',
  'jackfruit': 'biodegradable',
  'custard apple': 'biodegradable',
  'granny smith': 'biodegradable',
  'broccoli': 'biodegradable',
  'cauliflower': 'biodegradable',
  'cabbage': 'biodegradable',
  'head cabbage': 'biodegradable',
  'zucchini': 'biodegradable',
  'cucumber': 'biodegradable',
  'acorn squash': 'biodegradable',
  'butternut squash': 'biodegradable',
  'spaghetti squash': 'biodegradable',
  'bell pepper': 'biodegradable',
  'mushroom': 'biodegradable',
  'agaric': 'biodegradable',
  'corn': 'biodegradable',
  'ear': 'biodegradable',
  'artichoke': 'biodegradable',
  'cardoon': 'biodegradable',
  'food': 'biodegradable',
  'vegetable': 'biodegradable',
  'fruit': 'biodegradable',
  'leaf': 'biodegradable',
  'plant': 'biodegradable',
  'compost': 'biodegradable',
  'organic': 'biodegradable',
  'meat loaf': 'biodegradable',
  'meat': 'biodegradable',
  'hotdog': 'biodegradable',
  'hot dog': 'biodegradable',
  'hamburger': 'biodegradable',
  'cheeseburger': 'biodegradable',
  'pizza': 'biodegradable',
  'burrito': 'biodegradable',
  'bagel': 'biodegradable',
  'pretzel': 'biodegradable',
  'dough': 'biodegradable',
  'bread': 'biodegradable',
  'French loaf': 'biodegradable',
  'egg': 'biodegradable',
  'hay': 'biodegradable',
  'straw': 'biodegradable',
  'potpie': 'biodegradable',
  'trifle': 'biodegradable',
  'ice cream': 'biodegradable',
  'chocolate sauce': 'biodegradable',
  'guacamole': 'biodegradable',

  // Recyclable — containers and paper products
  'water bottle': 'recyclable',
  'plastic bottle': 'recyclable',
  'bottle': 'recyclable',
  'pop bottle': 'recyclable',
  'soda bottle': 'recyclable',
  'beer bottle': 'recyclable',
  'wine bottle': 'recyclable',
  'whiskey jug': 'recyclable',
  'beer glass': 'recyclable',
  'goblet': 'recyclable',
  'can': 'recyclable',
  'tin can': 'recyclable',
  'beer can': 'recyclable',
  'soda can': 'recyclable',
  'cardboard': 'recyclable',
  'carton': 'recyclable',
  'paper towel': 'recyclable',
  'newspaper': 'recyclable',
  'magazine': 'recyclable',
  'book jacket': 'recyclable',
  'comic book': 'recyclable',
  'crossword puzzle': 'recyclable',
  'envelope': 'recyclable',
  'packet': 'recyclable',
  'metal': 'recyclable',
  'aluminum': 'recyclable',
  'steel drum': 'recyclable',
  'glass': 'recyclable',
  'jar': 'recyclable',
  'pitcher': 'recyclable',
  'jug': 'recyclable',
  'bucket': 'recyclable',
  'pail': 'recyclable',
  'box': 'recyclable',
  'crate': 'recyclable',
  'paper': 'recyclable',
  'plastic': 'recyclable',
  'vase': 'recyclable',
  'rain barrel': 'recyclable',
  'water jug': 'recyclable',
  'coffee mug': 'recyclable',
  'cup': 'recyclable',
  'measuring cup': 'recyclable',
  'mixing bowl': 'recyclable',

  // Non-biodegradable — soft plastics and packaging
  'plastic bag': 'non-biodegradable',
  'shopping bag': 'non-biodegradable',
  'garbage bag': 'non-biodegradable',
  'trash': 'non-biodegradable',
  'garbage': 'non-biodegradable',
  'refuse': 'non-biodegradable',
  'wrapper': 'non-biodegradable',
  'packaging': 'non-biodegradable',
  'bubble': 'non-biodegradable',
  'styrofoam': 'non-biodegradable',
  'foam': 'non-biodegradable',
  'diaper': 'non-biodegradable',
  'bib': 'non-biodegradable',
  'Band Aid': 'non-biodegradable',
  'rubber eraser': 'non-biodegradable',
  'rubber': 'non-biodegradable',
  'nylon': 'non-biodegradable',
  'shower cap': 'non-biodegradable',
  'mask': 'non-biodegradable',
  'muzzle': 'non-biodegradable',
  'jersey': 'non-biodegradable',
  'sock': 'non-biodegradable',
  'stocking': 'non-biodegradable',
  'running shoe': 'non-biodegradable',
  'sandal': 'non-biodegradable',
  'clog': 'non-biodegradable',
  'shoe': 'non-biodegradable',
  'sunglass': 'non-biodegradable',
  'tennis ball': 'non-biodegradable',
  'ping-pong ball': 'non-biodegradable',
  'soccer ball': 'non-biodegradable',
  'basketball': 'non-biodegradable',
  'volleyball': 'non-biodegradable',
  'rugby ball': 'non-biodegradable',
  'balloon': 'non-biodegradable',

  // Special waste — electronics and medical
  'laptop': 'special',
  'notebook': 'special',
  'computer': 'special',
  'desktop computer': 'special',
  'keyboard': 'special',
  'space bar': 'special',
  'mouse': 'special',
  'monitor': 'special',
  'screen': 'special',
  'television': 'special',
  'tv': 'special',
  'phone': 'special',
  'cellular telephone': 'special',
  'cell phone': 'special',
  'dial telephone': 'special',
  'iPod': 'special',
  'camera': 'special',
  'Polaroid camera': 'special',
  'reflex camera': 'special',
  'projector': 'special',
  'battery': 'special',
  'power supply': 'special',
  'hard disc': 'special',
  'modem': 'special',
  'remote control': 'special',
  'printer': 'special',
  'electronic': 'special',
  'printed circuit board': 'special',
  'joystick': 'special',
  'switch': 'special',
  'electric fan': 'special',
  'vacuum': 'special',
  'iron': 'special',
  'washer': 'special',
  'refrigerator': 'special',
  'microwave': 'special',
  'toaster': 'special',
  'waffle iron': 'special',
  'espresso maker': 'special',
  'table lamp': 'special',
  'lampshade': 'special',
  'sewing machine': 'special',
  'CRT screen': 'special',
  'loudspeaker': 'special',
  'speaker': 'special',
  'headphone': 'special',
  'medicine chest': 'special',
  'pill bottle': 'special',
  'syringe': 'special',
  'stethoscope': 'special',

  // Hazardous
  'oil': 'hazardous',
  'paint can': 'hazardous',
  'paintbrush': 'hazardous',
  'chemical': 'hazardous',
  'lighter': 'hazardous',
  'matchstick': 'hazardous',
  'fire screen': 'hazardous',
  'fire extinguisher': 'hazardous',
  'gas pump': 'hazardous',
  'candle': 'hazardous',
  'torch': 'hazardous',
  'chainsaw': 'hazardous',
  'cleaver': 'hazardous',
  'hatchet': 'hazardous',
  'nail': 'hazardous',
  'screw': 'hazardous',
  'chain': 'hazardous',
  'barbell': 'hazardous',
  'combination lock': 'hazardous',
  'padlock': 'hazardous',
  'safe': 'hazardous',
};

// Category adjectives for display
const categoryAdjectives = {
  'biodegradable': ['organic', 'wet', 'compostable', 'food waste'],
  'non-biodegradable': ['dry', 'synthetic', 'plastic', 'single-use'],
  'recyclable': ['clean', 'dry', 'reusable', 'sorted'],
  'special': ['electronic', 'medical', 'e-waste'],
  'hazardous': ['toxic', 'chemical', 'dangerous', 'flammable'],
  'mixed': ['mixed', 'unsorted', 'general'],
};

// ─── Core category prediction from labels ─────────────────────────────────────
function predictCategory(labels) {
  if (!labels || labels.length === 0) {
    return {
      category: 'mixed', confidence: 0.3, adjective: 'mixed',
      description: 'Unable to determine waste type from image',
      rawLabels: []
    };
  }

  // Normalize: accept both [{label, confidence}] and plain string arrays
  const normalizedLabels = labels.map(l => {
    if (typeof l === 'string') return { label: l, confidence: 0.5 };
    return { label: l.label || l.className || '', confidence: l.confidence || l.probability || 0.5 };
  });

  const categoryScores = {};
  const categoryWeights = {};
  for (const cat of ['biodegradable', 'non-biodegradable', 'recyclable', 'special', 'hazardous']) {
    categoryScores[cat] = 0;
    categoryWeights[cat] = 0;
  }

  for (const { label, confidence } of normalizedLabels) {
    const lowerLabel = label.toLowerCase();
    for (const [keyword, category] of Object.entries(labelToCategoryMap)) {
      if (lowerLabel.includes(keyword) || keyword.includes(lowerLabel)) {
        categoryScores[category]++;
        categoryWeights[category] += confidence;
        break;
      }
    }
  }

  // Find best category by weighted score
  let bestCategory = 'mixed';
  let bestWeight = 0;

  for (const [category, weight] of Object.entries(categoryWeights)) {
    if (weight > bestWeight) {
      bestWeight = weight;
      bestCategory = category;
    }
  }

  // Calculate final confidence
  const totalWeight = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
  const confidence = totalWeight > 0
    ? Math.min((bestWeight / totalWeight) * 1.2, 0.97)
    : 0.3;

  const adjectives = categoryAdjectives[bestCategory] || ['mixed'];

  return {
    category: bestCategory,
    confidence: parseFloat(confidence.toFixed(2)),
    adjective: adjectives[0],
    description: `Detected as ${bestCategory} waste (${Math.round(confidence * 100)}% confidence)`,
    rawLabels: normalizedLabels.map(l => l.label).slice(0, 5),
  };
}

// ─── Main function: analyze image file from disk ───────────────────────────────
/**
 * Analyze a waste image file and return a category prediction.
 * @param {string} imagePath - Absolute path to the saved image file
 * @returns {Promise<Object>} { category, confidence, adjective, description, rawLabels }
 */
async function analyzeImage(imagePath) {
  try {
    console.log(`[ImageRecognition] Analyzing: ${imagePath}`);

    // Load and preprocess the image with Jimp
    const image = await Jimp.read(imagePath);

    // Resize to 224x224 (MobileNet input size)
    image.resize({ w: 224, h: 224 });

    // Get raw pixel data as a buffer (RGBA)
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const numPixels = width * height;

    // Convert RGBA bitmap to float32 RGB array [0, 255]
    // IMPORTANT: MobileNet's infer() normalizes internally via (pixel * normalizationConstant + inputMin)
    // Do NOT pre-divide by 255 — that causes double-normalization (everything maps to near-zero)
    // Do NOT use Int32Array — the TF.js CPU backend mishandles int32 in mul operations
    const rgbValues = new Float32Array(numPixels * 3);
    for (let i = 0; i < numPixels; i++) {
      const offset = i * 4; // RGBA
      rgbValues[i * 3] = image.bitmap.data[offset];       // R [0-255]
      rgbValues[i * 3 + 1] = image.bitmap.data[offset + 1]; // G [0-255]
      rgbValues[i * 3 + 2] = image.bitmap.data[offset + 2]; // B [0-255]
    }

    // Create tensor [224, 224, 3] — float32 with [0,255] range
    const tfImage = tf.tensor3d(rgbValues, [224, 224, 3]);

    // Load model (cached after first load)
    const net = await getModel();

    // Run classification — get top 10 predictions
    const predictions = await net.classify(tfImage, 10);

    // Clean up tensor to avoid memory leaks
    tfImage.dispose();

    // predictions = [{ className: 'banana', probability: 0.94 }, ...]
    const formattedLabels = predictions.map(p => ({
      label: p.className,
      confidence: p.probability
    }));

    console.log('[ImageRecognition] Top predictions:', formattedLabels.slice(0, 3).map(l => `${l.label} (${Math.round(l.confidence * 100)}%)`));

    // Map to waste category
    const result = predictCategory(formattedLabels);

    console.log(`[ImageRecognition] Result: ${result.category} (${Math.round(result.confidence * 100)}%)`);

    return result;

  } catch (error) {
    console.error('[ImageRecognition] Analysis failed:', error.message);
    // Return a safe fallback — never crash the submission flow
    return {
      category: 'mixed',
      confidence: 0.3,
      adjective: 'mixed',
      description: 'Image analysis unavailable — please select category manually',
      rawLabels: [],
      error: error.message
    };
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  analyzeImage,
  predictCategory,
  labelToCategoryMap,
  categoryAdjectives,
  getModel
};
