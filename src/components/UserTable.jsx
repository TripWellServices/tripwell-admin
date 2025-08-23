import React from 'react';
import { Trash2, User, Mail, Calendar, Clock, MapPin, CheckCircle, XCircle, Shield, Crown } from 'lucide-react';
import { Button } from './ui/button.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.jsx';

const UserTable = ({ users, onDeleteUser, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTripStatus = (user) => {
    if (!user.tripId) return { label: 'No Trip', color: 'bg-gray-100 text-gray-800' };
    if (user.tripCompletedAt) return { label: 'Completed', color: 'bg-blue-100 text-blue-800' };
    if (user.tripCreatedAt) return { label: 'Planning', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-red-100 text-red-800', icon: <Crown className="h-3 w-3" /> };
      case 'dev':
        return { label: 'Dev', color: 'bg-purple-100 text-purple-800', icon: <Shield className="h-3 w-3" /> };
      default:
        return { label: 'User', color: 'bg-gray-100 text-gray-800', icon: <User className="h-3 w-3" /> };
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await onDeleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User ID
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Active
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Trip Status
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </div>
            </TableHead>
            <TableHead className="w-[100px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Profile
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const tripStatus = getTripStatus(user);
            const roleBadge = getRoleBadge(user.role);
            
            return (
              <TableRow key={user.userId}>
                <TableCell className="font-mono text-sm">
                  {user.userId}
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tripStatus.color}`}>
                      {tripStatus.label}
                    </span>
                    {user.tripId && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {user.tripId.slice(-8)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {roleBadge.icon}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.profileComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.userId)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
