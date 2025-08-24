import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const HydrateAllUsers = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if users are already hydrated on component mount
  useEffect(() => {
    const hydratedUsers = localStorage.getItem('hydratedUsers');
    if (hydratedUsers) {
      const users = JSON.parse(hydratedUsers);
      setIsHydrated(true);
      setUserCount(users.length);
    }
  }, []);

  const handleHydrateUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      
      // Save to localStorage
      localStorage.setItem('hydratedUsers', JSON.stringify(users));
      localStorage.setItem('lastHydrated', new Date().toISOString());
      
      setIsHydrated(true);
      setUserCount(users.length);
      
      toast.success(`✅ Hydrated ${users.length} TripWell users`);
    } catch (err) {
      toast.error('Failed to hydrate users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHydration = () => {
    localStorage.removeItem('hydratedUsers');
    localStorage.removeItem('lastHydrated');
    setIsHydrated(false);
    setUserCount(0);
    toast.success('Cleared user hydration');
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(`✅ Test successful: ${result.userCount} users found`);
      console.log('Test result:', result);
    } catch (err) {
      toast.error('Test failed: ' + err.message);
      console.error('Test error:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Hydrate All Users
          </CardTitle>
          <CardDescription>
            Load all TripWell users from backend and cache them locally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Status Display */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              {isHydrated ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Users className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">
                {isHydrated ? 'Users Hydrated' : 'Users Not Hydrated'}
              </div>
              <div className="text-sm text-gray-500">
                {isHydrated 
                  ? `${userCount} users cached locally`
                  : 'No users cached yet'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleHydrateUsers}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Hydrating...' : 'Hydrate All Users'}
            </Button>
            
            <Button
              onClick={handleTestConnection}
              variant="outline"
              size="sm"
            >
              Test Connection
            </Button>
            
            {isHydrated && (
              <Button
                onClick={handleClearHydration}
                variant="outline"
                size="sm"
              >
                Clear Cache
              </Button>
            )}
          </div>

          {/* Last Hydrated Info */}
          {isHydrated && (
            <div className="text-sm text-gray-500">
              Last hydrated: {new Date(localStorage.getItem('lastHydrated')).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HydrateAllUsers;
