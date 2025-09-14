# Admin Dashboard Operations Guide

## 📚 **REFERENCE DOCUMENTS**
- **Backend Journey Stages**: `gofastbackend/JOURNEY_STAGE_MAPPING.md` - Complete journey stage system
- **Legacy Funnel Tracking**: `gofastbackend/ADMIN_DASHBOARD_FUNNEL_TRACKING.md` - Deprecated but contains user status definitions

## 🚨 **ADMIN DASHBOARD CURRENT STATUS**

The admin dashboard is currently being rebuilt with proper user management tools. Here's what's working and what needs to be fixed:

## 📊 **CURRENT ADMIN PAGES**

### **1. AdminUsers.jsx** - Main User Management Hub
- **Status**: ✅ Core functionality working
- **Features**:
  - ✅ User list with journey stages
  - ✅ Delete users (with proper cascade)
  - ✅ "Modify" button opens FullUser component
  - ✅ Message users with templates
- **Purpose**: Central hub for all user management operations

### **2. FullUser.jsx** - Complete User Edit Capability
- **Status**: ✅ Fully functional
- **Access**: Click "Modify" button in AdminUsers.jsx
- **Features**:
  - ✅ Full user data display
  - ✅ Duplicate trip detection and cleanup
  - ✅ Journey stage reset tools
  - ✅ Trip management
  - ✅ User state management
- **Purpose**: Complete user editing and management from AdminUsers central

### **3. UserStages.jsx** - Journey Management
- **Status**: 🔄 Placeholder component
- **Purpose**: Bulk journey stage management (future feature)

## 🛠️ **BACKEND ENDPOINTS**

### **⚠️ IMPORTANT: adminUserModifyRoute is the SOURCE OF TRUTH for all user deletion operations!**

**All user deletion should go through `/tripwell/admin/users/:id` which uses the unified cascade deletion service.**

### **🔄 Unified Cascade Deletion Service**
**Location**: `gofastbackend/services/TripWell/cascadeDeletionService.js`
**Purpose**: Single source of truth for all cascade deletion operations
**Functions**:
- `cascadeDelete(userId, tripId, session)` - Unified deletion (userId OR tripId)
- `deleteTripCascade(tripId, session)` - Delete trip and all associated data
- `deleteUserTripsCascade(userId, session)` - Delete all user's trips and data
- `deleteOrphanedDataCascade(session)` - Clean up orphaned data

**What gets deleted in cascade**:
- ✅ JoinCode registry entries
- ✅ TripBase records  
- ✅ TripIntent records
- ✅ TripItinerary records
- ✅ TripDay records
- ✅ AnchorLogic records
- ✅ TripReflection records

### **Existing Admin Routes** (`/tripwell/admin/`)

#### **DELETE `/users/:id`** - Delete User (SOURCE OF TRUTH)
**Location**: `adminUserModifyRoute.js`
**Uses**: Unified cascade deletion service
**What it does**: Deletes user and all associated data

#### **GET `/users`** - Get All Users
**Location**: `adminUserFetchRoute.js`
**Returns**: List of all users with journey stages

#### **PUT `/users/:id`** - Update User
**Location**: `adminUserModifyRoute.js`
**Purpose**: Update user fields

### **FullUser Component Endpoints** (for admin dashboard)

#### **GET `/user/:userId`** - Get Full User Data
```javascript
// Returns complete user data with trips and join codes
{
  user: { /* full user object */ },
  trips: [ /* all user trips */ ],
  joinCodes: [ /* all user join codes */ ],
  summary: {
    totalTrips: 2,
    activeTrips: 1,
    completedTrips: 0,
    joinCodesCreated: 1
  }
}
```

#### **POST `/user/:userId/cleanup-duplicates`** - Clean Up Duplicate Trips
```javascript
// Request body
{
  "keepTripId": "68c6d3f91715e31fd66a4f3a"
}

// Response
{
  "message": "Duplicate trips cleaned up successfully",
  "tripsRemoved": 1,
  "tripsKept": 1,
  "keptTrip": { /* trip details */ },
  "removedTrips": [ /* removed trip details */ ]
}
```

#### **POST `/user/:userId/reset-journey`** - Reset User Journey
```javascript
// Request body
{
  "journeyStage": "trip_set_done",
  "userState": "active"
}
```

#### **DELETE `/trip/:tripId`** - Delete Specific Trip
```javascript
// Deletes trip and cleans up related data
// Updates users who had this trip
```

## 🎯 **USER EDIT FLOW**

### **How to Edit Users:**
1. **Go to AdminUsers.jsx** - Main user management hub
2. **Click "Modify" button** - Opens FullUser component modal
3. **Use FullUser tools** - Complete user editing and management
4. **Close modal** - Returns to AdminUsers list

### **FullUser Edit Capabilities:**
- ✅ View complete user data (profile, trips, join codes)
- ✅ Clean up duplicate trips (select which to keep)
- ✅ Reset journey stages (new_user, profile_complete, trip_set_done, etc.)
- ✅ Reset user states (demo_only, active, abandoned, inactive)
- ✅ Delete individual trips
- ✅ View trip summaries and analytics

## 🚨 **CURRENT ISSUES TO FIX**

### **1. AdminUsers Modify Button** ✅ FIXED
**Problem**: Clicking "Modify" shows toast "Modify user functionality coming soon!"
**Status**: ✅ Fixed - now opens FullUser component

### **2. Journey Stages Button**
**Problem**: Button doesn't do anything
**Fix**: Make it open UserStages component or integrate with FullUser

### **3. Home Page Routing**
**Problem**: Users with existing trips are being sent to trip setup, creating duplicates
**Fix**: Check if user has trips and route them directly to their trip

### **4. User Delete Methods** ✅ SOURCE OF TRUTH
**Status**: ✅ Working - Uses unified cascade deletion service
**Endpoint**: `DELETE /tripwell/admin/users/:id`
**What it does**: 
- ✅ Deletes all user's trips and associated data (cascade deletion)
- ✅ Deletes JoinCode registry entries
- ✅ Deletes TripBase records
- ✅ Deletes all related data (TripIntent, TripItinerary, etc.)
- ✅ Deletes the user record
**What "Active" means**: 
- **Active User** = Has active trip (do not delete)
- **New User** = Account <15 days old with profile (give them time)
- **Incomplete Profile** = New account (give them time to complete profile)
- **Abandoned Account** = Account >15 days old with no profile (safe to delete)
- **Inactive User** = Account >15 days old with profile but no trip

## 🎯 **USER JOURNEY STAGES**

**Refer to `JOURNEY_STAGE_MAPPING.md` in backend for complete journey stage system details.**

Based on `ADMIN_DASHBOARD_FUNNEL_TRACKING.md` (deprecated) and `JOURNEY_STAGE_MAPPING.md` (current):

### **Python-Managed Journey Stages**
- **new_user** - Pre profile complete
- **profile_complete** - Profile done, no trip yet
- **trip_set_done** - Trip created, itinerary not complete
- **itinerary_complete** - Itinerary done, trip not started
- **trip_active** - Trip is happening now
- **trip_complete** - Trip finished

### **User States**
- **demo_only** - User only uses demos, no profile/trip
- **active** - User has profile and/or trip, engaged
- **abandoned** - User signed up but never completed profile (>15 days)
- **inactive** - User completed profile but no trip activity

## 🔧 **ADMIN TOOLS NEEDED**

### **Duplicate Trip Cleanup**
1. Detect users with multiple trips
2. Show all trips with creation dates
3. Let admin select which trip to keep
4. Delete duplicates and clean up join codes
5. Update user to point to kept trip

### **Journey Stage Management**
1. View current journey stage and user state
2. Reset to any stage (new_user, profile_complete, trip_set_done, etc.)
3. Bulk operations for multiple users

### **User Data Management**
1. View complete user hydration
2. Edit user fields
3. Delete users with proper cascade
4. Message users with templates

## 📋 **TODO LIST**

- [ ] Fix AdminUsers modify button to open FullUser
- [ ] Fix journey stages button functionality
- [ ] Complete FullUser component with all tools
- [ ] Fix home page routing for users with existing trips
- [ ] Test duplicate trip cleanup flow
- [ ] Add bulk operations for user management
- [ ] Add user messaging templates
- [ ] Add analytics and reporting

## 🚀 **QUICK FIXES NEEDED**

1. **AdminUsers.jsx**: Add state for selectedUser and open FullUser modal
2. **FullUser.jsx**: Complete the component with all management tools
3. **Home.jsx**: Check user trip status before routing to trip setup
4. **Backend**: Deploy the new admin user management routes

## 📞 **SUPPORT**

When users get stuck in the trip setup flow:
1. Use FullUser component to see all their trips
2. Clean up duplicates using the cleanup tool
3. Reset their journey stage to appropriate level
4. Test the flow to ensure it works

**The admin dashboard is the key to managing these user flow issues!**
