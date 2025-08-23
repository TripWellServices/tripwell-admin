# TripWell Admin Dashboard

A React-based admin dashboard for managing TripWell users and data.

## Features

- 🔐 Firebase Authentication with admin role protection
- 👥 User management with view and delete capabilities
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 📱 Responsive design
- 🔄 Real-time data updates
- 🚀 Built with Vite for fast development

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Firebase Auth
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 3. Set Up Admin Users

In your Firebase project:

1. Go to Authentication > Users
2. Create a user account for admin access
3. Set custom claims for the user with `role: "admin"`

You can set custom claims using Firebase Admin SDK:

```javascript
admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

### 4. Backend API Setup

The admin dashboard expects these endpoints on your TripWell backend:

- `GET /admin/users` - Fetch all users
- `DELETE /admin/users/:id` - Delete a user

The API calls are proxied to `http://localhost:5000` via Vite's proxy configuration.

### 5. Start Development Server

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── UserTable.jsx # User data table
│   └── ProtectedRoute.jsx # Auth protection
├── context/
│   └── AuthContext.jsx # Firebase auth state
├── hooks/
│   └── useAdminApi.js # API calls
├── pages/
│   ├── AdminUsers.jsx # Main admin page
│   └── Login.jsx      # Login page
├── lib/
│   └── utils.js       # Utility functions
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── firebase.js        # Firebase config
```

## API Endpoints

### GET /admin/users
Returns an array of user objects:

```json
[
  {
    "userId": "string",
    "email": "string",
    "createdAt": "ISO date string",
    "lastActiveAt": "ISO date string",
    "tripId": "string (optional)"
  }
]
```

### DELETE /admin/users/:id
Deletes a user by ID. Returns 200 on success.

## Authentication Flow

1. User visits `/admin`
2. If not authenticated, redirected to `/login`
3. After login, checks for `role: "admin"` in Firebase custom claims
4. If admin role found, access granted to admin dashboard
5. If not admin, shows access denied message

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.jsx`
4. Add API hooks in `src/hooks/` if needed

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Ensure your backend API is accessible from the deployed domain

## Security Notes

- Admin routes are protected by Firebase authentication
- Only users with `role: "admin"` custom claim can access
- API calls include Firebase ID tokens for backend verification
- Consider implementing rate limiting on backend endpoints

## Troubleshooting

### Common Issues

1. **Firebase config errors**: Ensure all Firebase config values are correct
2. **Admin access denied**: Check that user has `role: "admin"` custom claim
3. **API connection errors**: Verify backend is running on `localhost:5000`
4. **CORS issues**: Ensure backend allows requests from `localhost:3001`

### Getting Help

- Check the browser console for error messages
- Verify Firebase configuration in the browser
- Test API endpoints directly with tools like Postman
