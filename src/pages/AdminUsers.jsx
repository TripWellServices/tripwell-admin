import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Trash2, Edit, Mail, Calendar, Shield, MessageSquare, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

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

  const handleMessageUser = (user) => {
    const templates = {
      deletionWarning: `Hi ${user.firstName || 'there'},

We noticed you haven't completed your TripWell profile yet. Your account will be automatically deleted in the next few days if you don't complete your profile.

Complete your profile here: [TripWell Profile Link]

Best regards,
TripWell Team`,
      
      tripUpcoming: `Hi ${user.firstName || 'there'},

Great news! Your trip is coming up soon. Make sure you've completed all your pre-trip preparations.

Check your trip details here: [Trip Link]

Have a fantastic trip!
TripWell Team`
    };

    const template = window.prompt(
      'Choose a message template:\n\n' +
      '1. Deletion Warning\n' +
      '2. Trip Upcoming\n\n' +
      'Or type your custom message:',
      templates.deletionWarning
    );

    if (template) {
      // TODO: Implement actual messaging backend
      console.log('Message to send:', template);
      console.log('To user:', user.email);
      toast.success(`Message prepared for ${user.email}`);
    }
  };

  // Checkbox handlers
  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      const allUserIds = users.map(user => user.userId);
      setSelectedUsers(new Set(allUserIds));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast.error('No users selected for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const deletePromises = Array.from(selectedUsers).map(userId =>
      fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    try {
      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      // Remove deleted users from local state
      setUsers(users.filter(user => !selectedUsers.has(user.userId)));
      setSelectedUsers(new Set());
      setSelectAll(false);

      if (failed > 0) {
        toast.error(`Deleted ${successful} users, ${failed} failed`);
      } else {
        toast.success(`Successfully deleted ${successful} users`);
      }
    } catch (err) {
      toast.error('Bulk delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceCreation = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTripStatus = (user) => {
    if (!user.tripId) return { label: 'No Trip', color: 'bg-gray-100 text-gray-800', safeToDelete: true };
    if (user.tripCompletedAt) return { label: 'Trip Complete', color: 'bg-blue-100 text-blue-800', safeToDelete: false };
    return { label: 'Active Trip', color: 'bg-green-100 text-green-800', safeToDelete: false };
  };

  const getUserStatus = (user) => {
    const tripStatus = getTripStatus(user);
    const daysSinceCreation = getDaysSinceCreation(user.createdAt);
    
    // Determine if user is safe to delete
    const isNewAccount = daysSinceCreation <= 15; // New if created within 15 days
    const hasProfile = user.profileComplete;
    const hasTrip = !!user.tripId;
    
    if (hasTrip && !tripStatus.safeToDelete) {
      return { 
        label: 'Active User', 
        color: 'bg-green-100 text-green-800', 
        safeToDelete: false,
        reason: 'Has active trip'
      };
    }
    
    if (hasTrip) {
      return { 
        label: 'Active User', 
        color: 'bg-green-100 text-green-800', 
        safeToDelete: false,
        reason: 'Has trip - do not delete'
      };
    }
    
    if (hasProfile && isNewAccount) {
      return { 
        label: 'New User', 
        color: 'bg-blue-100 text-blue-800', 
        safeToDelete: false,
        reason: 'New account with profile - give them time'
      };
    }
    
    if (!hasProfile && isNewAccount) {
      return { 
        label: 'Incomplete Profile', 
        color: 'bg-yellow-100 text-yellow-800', 
        safeToDelete: false,
        reason: 'New account - give them time to complete profile'
      };
    }
    
    if (!hasProfile && !isNewAccount) {
      return { 
        label: 'Abandoned Account', 
        color: 'bg-red-100 text-red-800', 
        safeToDelete: true,
        reason: 'Account >15 days old with no profile - safe to delete'
      };
    }
    
    return { 
      label: 'Inactive User', 
      color: 'bg-orange-100 text-orange-800', 
      safeToDelete: true,
      reason: 'Account >15 days old with profile but no trip'
    };
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
            <div className="flex items-center gap-2">
              {selectedUsers.size > 0 && (
                <Button 
                  onClick={handleBulkDelete}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedUsers.size})
                </Button>
              )}
              <Button 
                onClick={() => {
                  const allUserIds = users.map(user => user.userId);
                  setSelectedUsers(new Set(allUserIds));
                  setSelectAll(true);
                }}
                disabled={loading || users.length === 0}
                variant="outline"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Select All
              </Button>
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
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
                >
                  {selectAll ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                {selectedUsers.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedUsers.size} of {users.length} selected
                  </span>
                )}
              </div>

              {users.map((user) => {
                const userStatus = getUserStatus(user);
                const tripStatus = getTripStatus(user);
                const daysSinceCreation = getDaysSinceCreation(user.createdAt);
                const isSelected = selectedUsers.has(user.userId);
                const isSafeToDelete = userStatus.safeToDelete;
                
                                 return (
                   <div key={user.userId} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                     isSelected ? 'ring-2 ring-blue-500' : ''
                   }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                                                 {/* Checkbox */}
                         <button
                           onClick={() => handleSelectUser(user.userId)}
                           className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
                           title="Select for deletion"
                         >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        
                                                 <div className="flex-shrink-0">
                           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                             <Mail className="h-5 w-5 text-gray-600" />
                           </div>
                         </div>
                                                 <div className="flex-1">
                           <div className="font-medium text-gray-900">
                             {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'}
                           </div>
                           <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created: {formatDate(user.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Role: {user.role}
                              </span>
                                                             <span className="flex items-center gap-1">
                                 <Calendar className="h-3 w-3" />
                                 {daysSinceCreation === 'Unknown' ? 'Created: Unknown' : `Created ${daysSinceCreation} days ago`}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${userStatus.color}`}>
                                {userStatus.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tripStatus.color}`}>
                                {tripStatus.label}
                              </span>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                                         <div className="flex gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleMessageUser(user)}
                       >
                         <MessageSquare className="h-4 w-4 mr-1" />
                         Message
                       </Button>
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
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
