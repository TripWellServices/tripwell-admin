import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Trash2, Edit, Mail, Calendar, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AdminUsers = () => {
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setUsers(users.filter(user => user.userId !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user: ' + err.message);
    }
  };

  const handleModifyUser = (userId) => {
    toast.info('Modify user functionality coming soon!');
    // TODO: Implement user modification
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadUsersFromCache();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                TripWell Users
              </CardTitle>
              <CardDescription>
                Manage user accounts, view profiles, and handle user data
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading TripWell users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No TripWell users found.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(user.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Role: {user.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.profileComplete 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModifyUser(user.userId)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modify
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.userId)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
