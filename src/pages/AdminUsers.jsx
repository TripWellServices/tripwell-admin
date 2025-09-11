import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Trash2, Edit, Mail, Calendar, Shield, MessageSquare, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsersFromAdmin = async () => {
    setLoading(true);
    
    console.log('🔄 Loading users from admin endpoint...');
    
    try {
      console.log('🔄 Calling URL:', 'https://gofastbackend.onrender.com/tripwell/admin/users');
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/users', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log('📊 Received user data:', userData.length, 'users');
      console.log('📊 User IDs:', userData.map(u => u.userId));
      
      setUsers(userData);
      toast.success(`Loaded ${userData.length} users from server`);
    } catch (err) {
      console.error('❌ Error loading users:', err);
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    console.log('🗑️ Attempting to delete user:', user);
    
    // Store the user to delete in state
    setUserToDelete(user);
    
    if (!window.confirm(`Are you sure you want to delete ${user.firstName || user.email}?`)) {
      setUserToDelete(null);
      return;
    }

    try {
      console.log('🗑️ Sending DELETE request for user:', user.userId);
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${user.userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      console.log('🗑️ Response status:', response.status);
      
      if (response.ok) {
        // Only remove from local state on successful deletion
        setUsers(prevUsers => prevUsers.filter(u => u.userId !== user.userId));
        // Also remove from selected users to clean up bulk delete state
        setSelectedUsers(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(user.userId);
          return newSelected;
        });
        toast.success(`User ${user.firstName || user.email} deleted successfully`);
        console.log('🗑️ User removed from frontend state and selection');
      } else if (response.status === 404) {
        // User already deleted from database, remove from UI
        setUsers(prevUsers => prevUsers.filter(u => u.userId !== user.userId));
        // Also remove from selected users to clean up bulk delete state
        setSelectedUsers(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(user.userId);
          return newSelected;
        });
        toast.success('User already deleted from database');
        console.log('🗑️ User was already deleted from database and selection');
      } else {
        const errorText = await response.text();
        console.error('🗑️ Delete failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('🗑️ Delete error:', err);
      toast.error('Failed to delete user: ' + err.message);
    } finally {
      setUserToDelete(null);
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
        headers: { 
          'Content-Type': 'application/json'
        }
      })
    );

    try {
      const results = await Promise.allSettled(deletePromises);
      
      // Count successful deletions and 404s (already deleted)
      let successful = 0;
      let alreadyDeleted = 0;
      let failed = 0;
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.ok) {
            successful++;
          } else if (result.value.status === 404) {
            alreadyDeleted++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      });

      // Remove deleted users from local state
      setUsers(users.filter(user => !selectedUsers.has(user.userId)));
      setSelectedUsers(new Set());
      setSelectAll(false);

      if (failed > 0) {
        toast.error(`Deleted ${successful} users, ${alreadyDeleted} already deleted, ${failed} failed`);
      } else if (alreadyDeleted > 0) {
        toast.success(`Deleted ${successful} users, ${alreadyDeleted} already deleted`);
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
    // ✅ Use Python-interpreted user state instead of custom logic
    const pythonUserState = user.userState || 'active';
    const hasTrip = !!user.tripId;
    
    // Map Python user states to admin display
    switch (pythonUserState) {
      case 'active':
        return { 
          label: 'Active', 
          color: 'bg-green-100 text-green-800', 
          safeToDelete: false,
          reason: 'Active user - do not delete'
        };
      
      case 'demo':
        return { 
          label: 'Demo User', 
          color: 'bg-blue-100 text-blue-800', 
          safeToDelete: false,
          reason: 'Demo user - give them time to convert'
        };
      
      case 'inactive':
        return { 
          label: 'Inactive', 
          color: 'bg-orange-100 text-orange-800', 
          safeToDelete: true,
          reason: 'Inactive user - safe to delete after 30 days'
        };
      
      case 'abandoned':
        return { 
          label: 'Abandoned', 
          color: 'bg-red-100 text-red-800', 
          safeToDelete: true,
          reason: 'Abandoned account - safe to delete'
        };
      
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800', 
          safeToDelete: false,
          reason: 'Unknown state - do not delete'
        };
    }
  };

  useEffect(() => {
    loadUsersFromAdmin();
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
                onClick={loadUsersFromAdmin} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Users
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
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                          disabled={userToDelete?.userId === user.userId}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {userToDelete?.userId === user.userId ? 'Deleting...' : 'Delete'}
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
