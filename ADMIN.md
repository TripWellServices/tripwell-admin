# TripWell Admin Dashboard

## 🎯 **What This Is**
A React-based admin dashboard for managing TripWell users, trips, and data. Built for internal team use to monitor user behavior, manage accounts, and handle administrative tasks.

## 🚀 **How to Use It**

### **1. Access the Admin Dashboard**
- **URL**: `http://localhost:3001` (development) or your deployed URL
- **Login**: Simple username/password (no Firebase complexity for admin)
- **Credentials**: Set via environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD`

### **2. Main Navigation**
After login, you'll see two main options:

#### **Admin Users** 
- **Purpose**: Main user management hub
- **Features**:
  - View all users with journey stages
  - Delete users (with cascade deletion)
  - Click "Modify" to open FullUser details
  - Message users with templates
  - Bulk operations (select all, bulk delete)

#### **Funnel Tracker**
- **Purpose**: Monitor demo users and pre-onboarding conversion
- **Features**:
  - Track demo user engagement
  - Monitor conversion rates
  - Identify conversion opportunities

## 🛠️ **Backend Routes**

### **Admin Authentication Routes**
```
GET  /tripwell/admin/ping          - Test route (no auth)
GET  /tripwell/admin/test          - Test TripWellUser model access
```

### **User Management Routes**
```
GET  /tripwell/admin/users         - Fetch all users for admin dashboard
GET  /tripwell/admin/hydrate       - Get all users (admin version of hydrate)
DELETE /tripwell/admin/users/:id   - Delete user with cascade deletion
PUT  /tripwell/admin/users/:id    - Update user data
```

### **User Journey & State Routes**
```
POST /tripwell/admin/user/:userId/reset-journey - Reset user journey stage
PUT  /tripwell/admin/fixProfileComplete         - Fix profileComplete flag
```

### **Route Files**
- **`adminUserModifyRoute.js`** - Main admin routes (users, deletion, journey reset)
- **`adminUserFetchRoute.js`** - User fetching and hydration
- **`cascadeDeletionService.js`** - Handles cascade deletion of user data

## 📁 **Frontend Structure**

### **Pages**
- **`AdminHome.jsx`** - Login page
- **`AdminDashboardChoices.jsx`** - Main navigation hub
- **`AdminUsers.jsx`** - User management (delete, modify, message)
- **`FullUser.jsx`** - Detailed user view (opened from AdminUsers)
- **`FunnelTracker.jsx`** - Demo user analytics
- **`UserJourney.jsx`** - Full app user analytics (accessible via direct route)

### **Key Features**

#### **AdminUsers.jsx**
- ✅ User list with journey stages
- ✅ Delete users (with proper cascade)
- ✅ "Modify" button opens FullUser component
- ✅ Message users with templates
- ✅ Bulk operations

#### **FullUser.jsx**
- ✅ Complete user data display
- ✅ Duplicate trip detection and cleanup
- ✅ Journey stage reset tools
- ✅ Trip management
- ✅ User state management

#### **FunnelTracker.jsx**
- ✅ Demo user analytics
- ✅ Conversion tracking
- ✅ Pre-onboarding insights

## 🔧 **Environment Setup**

### **Backend Environment Variables**
```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tripwell2025
MONGO_URI=your_mongodb_connection_string
```

### **Frontend Environment**
```bash
# No special environment variables needed
# Uses hardcoded backend URL: https://gofastbackend.onrender.com
```

## 🗑️ **Cascade Deletion**

When you delete a user, the system automatically deletes:
- ✅ User record
- ✅ All user trips
- ✅ All JoinCode entries
- ✅ All associated trip data
- ✅ All user selections
- ✅ All itinerary data

**This is handled by `cascadeDeletionService.js`**

## 📊 **User Status Categories**

The admin dashboard shows these user states:
- **Active User** - Has active trip (do not delete)
- **New User** - Account <15 days old with profile (give them time)
- **Incomplete Profile** - Missing profile data (safe to delete after 30 days)
- **Abandoned Account** - No activity for 30+ days (safe to delete)
- **Inactive** - Low engagement (safe to delete after 60 days)

## 🚨 **Important Notes**

1. **Cascade Deletion**: Deleting a user removes ALL their data permanently
2. **User States**: Based on Python analysis, not custom logic
3. **Journey Stages**: Track user progression through the app
4. **Demo Users**: Use FunnelTracker to monitor conversion potential
5. **Full App Users**: Use AdminUsers for management and UserJourney for analytics

## 🔍 **Troubleshooting**

### **Common Issues**
1. **"loadUsersFromAdmin is not defined"** - Fixed in UserJourney.jsx
2. **Cascade deletion not working** - Check database connection to GoFastFamily
3. **User states not showing** - Ensure Python analysis is running
4. **Authentication issues** - Check ADMIN_USERNAME/ADMIN_PASSWORD

### **Debug Routes**
- `GET /tripwell/admin/ping` - Test if admin routes are working
- `GET /tripwell/admin/test` - Test database connection
- Check browser console for detailed error logs

## 📝 **Development Notes**

- **Database**: All operations use `GoFastFamily` database
- **Authentication**: Simple username/password (no Firebase for admin)
- **Caching**: Uses localStorage for performance
- **Real-time**: Refresh data as needed (no auto-refresh)

---

**Last Updated**: September 2025  
**Maintainer**: TripWell Development Team
