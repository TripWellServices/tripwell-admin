import React, { useState, useEffect } from 'react';
import { Users, MapPin, TrendingUp, UserCheck, UserX, Calendar, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const UserJourney = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsersFromCache = () => {
    setLoading(true);
    try {
      const hydratedUsers = localStorage.getItem('hydratedUsers');
      if (hydratedUsers) {
        const userData = JSON.parse(hydratedUsers);
        // Filter to only full app users (full_app or none/legacy)
        const fullAppUsers = userData.filter(user => 
          !user.funnelStage || user.funnelStage === 'full_app' || user.funnelStage === 'none'
        );
        setUsers(fullAppUsers);
        toast.success(`Loaded ${fullAppUsers.length} full app users from cache`);
      } else {
        toast.error('No users found in cache. Please hydrate users first.');
      }
    } catch (err) {
      toast.error('Failed to load users from cache: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysSinceCreation = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMetrics = () => {
    if (!users.length) return null;

    const totalUsers = users.length;
    const newUsers = users.filter(user => {
      const days = getDaysSinceCreation(user.createdAt);
      return days <= 15 && days !== 'Unknown';
    }).length;
    
    const profileComplete = users.filter(user => user.profileComplete).length;
    const hasTrip = users.filter(user => user.tripId).length;
    const activeUsers = users.filter(user => {
      const userStatus = getUserStatus(user);
      return userStatus.label === 'Active User';
    }).length;
    
    const abandonedUsers = users.filter(user => {
      const userStatus = getUserStatus(user);
      return userStatus.label === 'Abandoned Account';
    }).length;

    return {
      totalUsers,
      newUsers,
      profileComplete,
      hasTrip,
      activeUsers,
      abandonedUsers,
      profileConversion: totalUsers > 0 ? Math.round((profileComplete / totalUsers) * 100) : 0,
      tripConversion: totalUsers > 0 ? Math.round((hasTrip / totalUsers) * 100) : 0,
      activeConversion: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    };
  };

  const getUserStatus = (user) => {
    const daysSinceCreation = getDaysSinceCreation(user.createdAt);
    const isNewAccount = daysSinceCreation <= 15;
    const hasProfile = user.profileComplete;
    const hasTrip = !!user.tripId;
    
    if (hasTrip) {
      return { 
        label: 'Active User', 
        color: 'bg-green-100 text-green-800',
        icon: <UserCheck className="h-4 w-4" />
      };
    }
    
    if (hasProfile && isNewAccount) {
      return { 
        label: 'New User', 
        color: 'bg-blue-100 text-blue-800',
        icon: <Calendar className="h-4 w-4" />
      };
    }
    
    if (!hasProfile && isNewAccount) {
      return { 
        label: 'Incomplete Profile', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Shield className="h-4 w-4" />
      };
    }
    
    if (!hasProfile && !isNewAccount) {
      return { 
        label: 'Abandoned Account', 
        color: 'bg-red-100 text-red-800',
        icon: <UserX className="h-4 w-4" />
      };
    }
    
    return { 
      label: 'Inactive User', 
      color: 'bg-orange-100 text-orange-800',
      icon: <UserX className="h-4 w-4" />
    };
  };

  useEffect(() => {
    loadUsersFromCache();
  }, []);

  const metrics = calculateMetrics();

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Journey</h1>
            <p className="text-gray-600 mt-2">Track full app users through their TripWell experience</p>
          </div>
          <Button 
            onClick={loadUsersFromCache} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Full app users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.hasTrip || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.tripConversion || 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.profileComplete || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.profileConversion || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.newUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 15 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Journey Funnel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                User Journey Funnel
              </CardTitle>
              <CardDescription>
                Visual representation of user progression through TripWell
              </CardDescription>
            </div>
            <Button 
              onClick={loadUsersFromCache} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading user data...</span>
            </div>
          ) : !metrics ? (
            <div className="text-center p-8 text-muted-foreground">
              No user data available. Please hydrate users first.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Journey Stages */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stage 1: Signup */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{metrics.totalUsers}</h3>
                  <p className="text-sm text-gray-600">Total Signups</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Stage 2: Profile Complete */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{metrics.profileComplete}</h3>
                  <p className="text-sm text-gray-600">Profile Complete</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics.profileConversion}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.profileConversion}%</p>
                </div>

                {/* Stage 3: Has Trip */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{metrics.hasTrip}</h3>
                  <p className="text-sm text-gray-600">Has Trip</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${metrics.tripConversion}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.tripConversion}%</p>
                </div>

                {/* Stage 4: Active Users */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{metrics.activeUsers}</h3>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${metrics.activeConversion}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.activeConversion}%</p>
                </div>
              </div>

              {/* User Status Breakdown */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">User Status Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {users.reduce((acc, user) => {
                    const status = getUserStatus(user);
                    const existing = acc.find(item => item.label === status.label);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ ...status, count: 1 });
                    }
                    return acc;
                  }, []).map((status, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <div className="font-medium">{status.count}</div>
                        <div className="text-sm text-gray-600">{status.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full App Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Full App Users</CardTitle>
          <CardDescription>
            Showing {users.length} users in the full app experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No full app users found.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const daysSinceCreation = getDaysSinceCreation(user.createdAt);
                const userStatus = getUserStatus(user);
                
                return (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userStatus.color}`}>
                        {userStatus.icon}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          Created {daysSinceCreation === 'Unknown' ? 'Unknown' : `${daysSinceCreation} days ago`}
                          {user.profileComplete && ' • Profile Complete'}
                          {user.tripId && ' • Has Trip'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${userStatus.color}`}>
                        {userStatus.label}
                      </span>
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

export default UserJourney;
