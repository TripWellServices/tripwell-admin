# Admin Dashboard Operations Guide

## 🚨 **ADMIN DASHBOARD CURRENT STATUS**

The admin dashboard is currently being rebuilt with proper user management tools. Here's what's working and what needs to be fixed:

## 📊 **CURRENT ADMIN PAGES**

### **1. AdminUsers.jsx** - Main User Management
- **Status**: ✅ Basic functionality working
- **Issues**: 
  - ❌ "Modify" button doesn't open FullUser component
  - ❌ "Journey Stages" button doesn't work
  - ❌ No duplicate trip cleanup tools

### **2. FullUser.jsx** - Complete User View
- **Status**: 🔄 Being built
- **Features**:
  - ✅ Full user data display
  - ✅ Duplicate trip detection
  - ✅ Trip cleanup tools
  - ✅ Journey stage reset tools

### **3. UserStages.jsx** - Journey Management
- **Status**: 🔄 Placeholder component
- **Purpose**: Manage user journey stages and flags

## 🛠️ **BACKEND ENDPOINTS**

### **New Admin User Management Routes** (`/tripwell/admin/`)

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

### **4. User Delete Methods**
**Status**: ✅ Working - Delete endpoint properly cascades and removes all user data
**What "Active" means**: 
- **Active User** = Has active trip (do not delete)
- **New User** = Account <15 days old with profile (give them time)
- **Incomplete Profile** = New account (give them time to complete profile)
- **Abandoned Account** = Account >15 days old with no profile (safe to delete)
- **Inactive User** = Account >15 days old with profile but no trip

## 🎯 **USER JOURNEY STAGES**

Based on `ADMIN_DASHBOARD_FUNNEL_TRACKING.md`:

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
