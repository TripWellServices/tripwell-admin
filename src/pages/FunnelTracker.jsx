import React, { useState, useEffect } from 'react';
import { Users, Eye, BarChart3, UserPlus, TrendingUp, RefreshCw, Filter, ArrowRight, UserCheck, Settings, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const FunnelTracker = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [funnelStats, setFunnelStats] = useState({});
  const [selectedFunnelStage, setSelectedFunnelStage] = useState('all');
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const loadUsersFromCache = () => {
    setLoading(true);
    try {
      const hydratedUsers = localStorage.getItem('hydratedUsers');
      if (hydratedUsers) {
        const userData = JSON.parse(hydratedUsers);
        // Filter to only funnel users (not full_app)
        const funnelUsers = userData.filter(user => 
          user.funnelStage && user.funnelStage !== 'full_app' && user.funnelStage !== 'none'
        );
        setUsers(funnelUsers);
        calculateFunnelStats(funnelUsers);
        toast.success(`Loaded ${funnelUsers.length} funnel users from cache`);
      } else {
        toast.error('No users found in cache. Please hydrate users first.');
      }
    } catch (err) {
      toast.error('Failed to load users from cache: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFunnelStats = (userData) => {
    const stats = {
      total: userData.length,
      itinerary_demo: 0,
      spots_demo: 0,
      updates_only: 0,
      conversionRates: {}
    };

    // Count users by funnel stage
    userData.forEach(user => {
      const stage = user.funnelStage;
      if (stats.hasOwnProperty(stage)) {
        stats[stage]++;
      }
    });

    // Calculate conversion rates (what % of funnel users are in each stage)
    if (stats.total > 0) {
      stats.conversionRates = {
        itinerary_demo: ((stats.itinerary_demo / stats.total) * 100).toFixed(1),
        spots_demo: ((stats.spots_demo / stats.total) * 100).toFixed(1),
        updates_only: ((stats.updates_only / stats.total) * 100).toFixed(1)
      };
    }

    setFunnelStats(stats);
  };

  const getFunnelStageColor = (stage) => {
    const colors = {
      itinerary_demo: 'bg-blue-100 text-blue-800',
      spots_demo: 'bg-purple-100 text-purple-800',
      updates_only: 'bg-yellow-100 text-yellow-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getFunnelStageIcon = (stage) => {
    switch (stage) {
      case 'itinerary_demo': return <Eye className="h-4 w-4" />;
      case 'spots_demo': return <BarChart3 className="h-4 w-4" />;
      case 'updates_only': return <UserPlus className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getFunnelStageLabel = (stage) => {
    const labels = {
      itinerary_demo: 'Demo Itinerary',
      spots_demo: 'Demo Best Things',
      updates_only: 'Newsletter Signup'
    };
    return labels[stage] || stage;
  };

  const getDaysSinceCreation = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getConversionPotential = (user) => {
    const daysSinceCreation = getDaysSinceCreation(user.createdAt);
    if (daysSinceCreation === 'Unknown') return 'Unknown';
    
    if (daysSinceCreation <= 1) return 'High';
    if (daysSinceCreation <= 3) return 'Medium';
    if (daysSinceCreation <= 7) return 'Low';
    return 'Very Low';
  };

  const getConversionPotentialColor = (potential) => {
    const colors = {
      'High': 'text-green-600 bg-green-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'Low': 'text-orange-600 bg-orange-100',
      'Very Low': 'text-red-600 bg-red-100',
      'Unknown': 'text-gray-600 bg-gray-100'
    };
    return colors[potential] || 'text-gray-600 bg-gray-100';
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select users and an action');
      return;
    }

    try {
      const promises = selectedUsers.map(userId => 
        fetch('https://gofastbackend.onrender.com/tripwell/user/updateFunnelStage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseId: userId,
            funnelStage: bulkAction
          })
        })
      );

      await Promise.all(promises);
      toast.success(`Updated ${selectedUsers.length} users to ${bulkAction}`);
      setSelectedUsers([]);
      setBulkAction('');
      loadUsersFromCache(); // Refresh data
    } catch (error) {
      toast.error('Failed to update users');
    }
  };

  const handleIndividualAction = async (firebaseId, newStage) => {
    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/user/updateFunnelStage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseId,
          funnelStage: newStage
        })
      });

      if (response.ok) {
        toast.success(`User moved to ${newStage}`);
        loadUsersFromCache(); // Refresh data
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  useEffect(() => {
    loadUsersFromCache();
  }, []);

  const filteredUsers = selectedFunnelStage === 'all' 
    ? users 
    : users.filter(user => user.funnelStage === selectedFunnelStage);

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funnel Tracker</h1>
            <p className="text-gray-600 mt-2">Track users in the conversion funnel before they become full app users</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showAdminControls ? "default" : "outline"}
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin Controls
            </Button>
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
      </div>

      {/* Admin Controls */}
      {showAdminControls && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Admin Controls
            </CardTitle>
            <CardDescription>Manage funnel stages and user progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Bulk Actions:</span>
                <select 
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="">Select Action</option>
                  <option value="full_app">Move to Full App</option>
                  <option value="updates_only">Move to Newsletter</option>
                  <option value="none">Remove from Funnel</option>
                </select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedUsers.length === 0}
                  size="sm"
                >
                  Apply to {selectedUsers.length} Users
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quick Actions:</span>
                <Button 
                  onClick={() => {
                    const demoUsers = users.filter(u => u.funnelStage === 'itinerary_demo' || u.funnelStage === 'spots_demo');
                    setSelectedUsers(demoUsers.map(u => u.userId));
                    setBulkAction('full_app');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Select All Demo Users
                </Button>
                <Button 
                  onClick={() => setSelectedUsers([])}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Itinerary</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{funnelStats.itinerary_demo || 0}</div>
            <p className="text-xs text-muted-foreground">
              {funnelStats.conversionRates?.itinerary_demo || 0}% of funnel users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Best Things</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{funnelStats.spots_demo || 0}</div>
            <p className="text-xs text-muted-foreground">
              {funnelStats.conversionRates?.spots_demo || 0}% of funnel users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Signup</CardTitle>
            <UserPlus className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{funnelStats.updates_only || 0}</div>
            <p className="text-xs text-muted-foreground">
              {funnelStats.conversionRates?.updates_only || 0}% of funnel users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Stage Filter */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filter by Funnel Stage</CardTitle>
              <CardDescription>Focus on specific funnel stages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFunnelStage === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFunnelStage('all')}
            >
              All Funnel Users ({users.length})
            </Button>
            {Object.entries(funnelStats).filter(([key]) => key !== 'total' && key !== 'conversionRates').map(([stage, count]) => (
              <Button
                key={stage}
                variant={selectedFunnelStage === stage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFunnelStage(stage)}
                className="flex items-center gap-2"
              >
                {getFunnelStageIcon(stage)}
                {getFunnelStageLabel(stage)} ({count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funnel Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Users</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} users {selectedFunnelStage !== 'all' ? `in ${getFunnelStageLabel(selectedFunnelStage)}` : 'in funnel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading funnel users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No funnel users found {selectedFunnelStage !== 'all' ? `in ${getFunnelStageLabel(selectedFunnelStage)}` : ''}.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const daysSinceCreation = getDaysSinceCreation(user.createdAt);
                const conversionPotential = getConversionPotential(user);
                const isSelected = selectedUsers.includes(user.userId);
                
                return (
                  <div key={user.userId} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-center gap-4">
                      {showAdminControls && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUserSelection(user.userId)}
                          className="h-4 w-4"
                        />
                      )}
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getFunnelStageColor(user.funnelStage)}`}>
                        {getFunnelStageIcon(user.funnelStage)}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          Created {daysSinceCreation === 'Unknown' ? 'Unknown' : `${daysSinceCreation} days ago`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFunnelStageColor(user.funnelStage)}`}>
                        {getFunnelStageLabel(user.funnelStage)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConversionPotentialColor(conversionPotential)}`}>
                          {conversionPotential} Potential
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>

                      {/* Individual Admin Actions */}
                      {showAdminControls && (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => handleIndividualAction(user.userId, 'full_app')}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Full App
                          </Button>
                          <Button
                            onClick={() => handleIndividualAction(user.userId, 'updates_only')}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Newsletter
                          </Button>
                        </div>
                      )}
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

export default FunnelTracker;
