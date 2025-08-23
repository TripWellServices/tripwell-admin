import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import UserTable from '../components/UserTable.jsx';
import { useAdminApi } from '../hooks/useAdminApi.js';
import toast, { Toaster } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { fetchUsers, deleteUser, loading, error } = useAdminApi();

  const loadUsers = async () => {
    try {
      const userData = await fetchUsers();
      setUsers(userData);
      toast.success('Users loaded successfully');
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      // Remove the user from the local state
      setUsers(users.filter(user => user.userId !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user: ' + err.message);
    }
  };

  useEffect(() => {
    loadUsers();
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
                User Management
              </CardTitle>
              <CardDescription>
                Manage TripWell users and their data
              </CardDescription>
            </div>
            <Button 
              onClick={loadUsers} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
              Error: {error}
            </div>
          )}
          
          <UserTable 
            users={users} 
            onDeleteUser={handleDeleteUser}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
