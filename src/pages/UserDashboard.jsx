import React, { useState, useEffect } from 'react';
import { Users, Mail, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsersFromCache = () => {
    setLoading(true);
    try {
      const hydratedUsers = localStorage.getItem('hydratedUsers');
      if (hydratedUsers) {
        const userData = JSON.parse(hydratedUsers);
        setUsers(userData);
        toast.success(`Loaded ${userData.length} users from cache`);
      } else {
        toast.error('No users found in cache. Please hydrate users first.');
      }
    } catch (err) {
      toast.error('Failed to load users from cache: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersFromCache();
  }, []);

  const getTripStatus = (user) => {
    if (!user.tripId) return { label: 'No Trip', color: 'bg-gray-100 text-gray-800' };
    if (user.tripCompletedAt) return { label: 'Completed', color: 'bg-blue-100 text-blue-800' };
    if (user.tripCreatedAt) return { label: 'Planning', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const handleTripClick = (tripId) => {
    // For now, just show the trip ID - in future this could open trip details
    toast.success(`Trip ID: ${tripId}`);
    // Future: window.open(`/trip/${tripId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                User Outlook
              </CardTitle>
              <CardDescription>
                Quick overview of all users and their trip status
              </CardDescription>
            </div>
            <Button 
              onClick={loadUsersFromCache} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Cache
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          
          <div className="space-y-4">
            {users.map((user) => {
              const tripStatus = getTripStatus(user);
              
              return (
                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Name & Email */}
                    <div className="flex-1">
                      <div className="font-medium">{user.email.split('@')[0]}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                    
                    {/* Trip Status */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tripStatus.color}`}>
                        {tripStatus.label}
                      </span>
                    </div>
                    
                    {/* Trip ID (clickable) */}
                    {user.tripId && (
                      <button
                        onClick={() => handleTripClick(user.tripId)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span className="font-mono">{user.tripId.slice(-8)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {users.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
