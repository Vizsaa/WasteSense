# 🗑️ Waste Submission Feature Setup

## What's Been Implemented

### ✅ Backend Features
1. **Waste Submission API** - Full CRUD operations
2. **Image Upload** - Multer middleware for handling image uploads
3. **Location Management** - API for managing barangays
4. **Database Models** - WasteSubmission and Location models

### ✅ Frontend Features
1. **Waste Submission Form** - Complete form with image upload
2. **TensorFlow.js Integration** - AI-powered image recognition
3. **Auto-fill Functionality** - Automatically fills form based on AI predictions
4. **Location Selection** - Barangay/village dropdown
5. **GPS Integration** - Get current location button
6. **My Submissions Page** - View all user submissions
7. **Admin Location Management** - Add/edit/delete barangays

## Setup Instructions

### Step 1: Update Database Schema

Run this SQL in phpMyAdmin to add new columns:

1. Open: http://localhost/phpmyadmin
2. Select: `wastesense_db`
3. Click: **SQL** tab
4. Copy and paste contents of: `database/update_waste_submissions.sql`
5. Click: **Go**

**OR** run this SQL directly:

```sql
USE wastesense_db;

-- Add new columns
ALTER TABLE waste_submissions 
ADD COLUMN waste_adjective VARCHAR(50) AFTER confirmed_category,
ADD COLUMN barangay_id INT AFTER address_description,
ADD COLUMN waste_description TEXT AFTER waste_adjective;

-- Update confirmed_category enum
ALTER TABLE waste_submissions 
MODIFY COLUMN confirmed_category ENUM('biodegradable', 'non-biodegradable', 'recyclable', 'special', 'hazardous', 'mixed') DEFAULT NULL;
```

### Step 2: Restart Server

If your server is running, restart it to load new routes:

```powershell
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test the Feature

1. **Login as Resident**
   - Go to: http://localhost:3000/pages/login.html
   - Login with your resident account

2. **Submit Waste**
   - Click "Submit Waste Collection Request" or go to: http://localhost:3000/pages/submit-waste.html
   - Upload an image of waste
   - Wait for AI analysis (TensorFlow.js will load)
   - Review auto-filled form fields
   - Select barangay/village
   - Add location details
   - Submit

3. **View Submissions**
   - Go to "My Submissions" page
   - See all your submitted waste requests

4. **Admin: Manage Locations**
   - Login as admin
   - Go to "Manage Locations"
   - Add new barangays/villages

## How It Works

### Image Recognition Flow

1. **User uploads image** → Image is displayed in preview
2. **TensorFlow.js loads** → MobileNet model loads from CDN
3. **Image analysis** → Model classifies objects in image
4. **Category mapping** → Objects mapped to waste categories:
   - Biodegradable (food, organic, compost)
   - Recyclable (bottles, cans, paper, plastic)
   - Non-biodegradable (bags, wrappers, styrofoam)
   - Special (electronics, batteries)
   - Hazardous (chemicals, oil)
5. **Auto-fill form** → Category and adjective auto-selected
6. **User reviews** → User can modify predictions
7. **Submit** → Form data + image sent to server

### Waste Categories

- **Biodegradable**: Food waste, organic matter, compostable items
- **Non-biodegradable**: Plastic bags, wrappers, styrofoam
- **Recyclable**: Bottles, cans, paper, cardboard, clean plastic
- **Special**: Electronics, batteries, medical waste
- **Hazardous**: Chemicals, oil, toxic materials
- **Mixed**: Combination of different types

### Location Features

- **Barangay Selection**: Dropdown populated from database
- **GPS Coordinates**: Optional latitude/longitude
- **Address Description**: Specific location details
- **Admin Management**: Add/edit/delete barangays

## API Endpoints

### Waste Submission
- `POST /api/waste/submit` - Submit waste with image
- `GET /api/waste/my-submissions` - Get user's submissions
- `GET /api/waste/:id` - Get submission by ID
- `PUT /api/waste/:id` - Update submission
- `DELETE /api/waste/:id` - Delete submission

### Locations
- `GET /api/locations` - Get all locations (public)
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location (admin only)
- `PUT /api/locations/:id` - Update location (admin only)
- `DELETE /api/locations/:id` - Delete location (admin only)

## Troubleshooting

### Image Recognition Not Working

**Issue:** TensorFlow.js model not loading

**Solutions:**
1. Check internet connection (model loads from CDN)
2. Check browser console for errors
3. Try refreshing the page
4. The system will fallback to basic categorization

### Image Upload Fails

**Issue:** "Failed to submit waste"

**Solutions:**
1. Check file size (max 5MB)
2. Check file type (JPEG, PNG, GIF, WebP only)
3. Check `uploads/` folder exists and is writable
4. Check server logs for errors

### Barangays Not Loading

**Issue:** Dropdown shows "Loading barangays..."

**Solutions:**
1. Check database has locations
2. Run `database/complete_setup.sql` if needed
3. Add barangays via admin panel
4. Check API endpoint: http://localhost:3000/api/locations

### GPS Location Not Working

**Issue:** "Failed to get your location"

**Solutions:**
1. Allow location permissions in browser
2. Use HTTPS (geolocation requires secure context)
3. Enter coordinates manually
4. Check browser supports geolocation API

## Files Created

### Backend
- `backend/models/WasteSubmission.js` - Waste submission model
- `backend/models/Location.js` - Location model
- `backend/controllers/wasteController.js` - Waste submission controller
- `backend/controllers/locationController.js` - Location controller
- `backend/routes/wasteRoutes.js` - Waste routes
- `backend/routes/locationRoutes.js` - Location routes
- `backend/middleware/upload.js` - Multer upload configuration
- `backend/utils/imageRecognition.js` - Image recognition utilities

### Frontend
- `frontend/pages/submit-waste.html` - Waste submission form
- `frontend/pages/my-submissions.html` - User submissions page
- `frontend/pages/admin-locations.html` - Admin location management
- `frontend/js/wasteSubmission.js` - Waste submission JavaScript with TensorFlow.js

### Database
- `database/update_waste_submissions.sql` - Database schema update

## Next Steps

The waste submission feature is now fully functional! Users can:
- ✅ Upload waste images
- ✅ Get AI-powered categorization
- ✅ Review and modify predictions
- ✅ Select location/barangay
- ✅ Submit collection requests
- ✅ View submission history

**Admin can:**
- ✅ Manage barangays/locations
- ✅ View all submissions (future feature)

Enjoy your smart waste collection system! 🎉
