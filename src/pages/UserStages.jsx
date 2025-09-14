import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flag, Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const UserStages = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadUserStages = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading user stages for:', userId);
      
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}/stages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to load user stages: ${response.status}`);
      }

      const userData = await response.json();
      console.log('📊 User stages loaded:', userData);
      
      setUser(userData);
      toast.success('User stages loaded successfully');
    } catch (err) {
      console.error('❌ Error loading user stages:', err);
      toast.error('Failed to load user stages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (stage, value) => {
    setUpdating(true);
    try {
      console.log('🔄 Updating user stage:', stage, 'to:', value);
      
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}/stages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, value })
      });

      if (!response.ok) {
        throw new Error(`Failed to update stage: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(`Stage ${stage} updated to ${value}`);
    } catch (err) {
      console.error('❌ Error updating stage:', err);
      toast.error('Failed to update stage: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFlagToggle = async (flag, value) => {
    setUpdating(true);
    try {
      console.log('🔄 Toggling user flag:', flag, 'to:', value);
      
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}/flags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, value })
      });

      if (!response.ok) {
        throw new Error(`Failed to update flag: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(`Flag ${flag} updated to ${value}`);
    } catch (err) {
      console.error('❌ Error updating flag:', err);
      toast.error('Failed to update flag: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetStage = async (stage) => {
    if (!window.confirm(`Are you sure you want to reset the ${stage} stage? This will clear all related data.`)) {
      return;
    }

    setUpdating(true);
    try {
      console.log('🔄 Resetting user stage:', stage);
      
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/users/${userId}/stages/${stage}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to reset stage: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(`Stage ${stage} reset successfully`);
    } catch (err) {
      console.error('❌ Error resetting stage:', err);
      toast.error('Failed to reset stage: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'new_user': return <User className="h-4 w-4" />;
      case 'profile_complete': return <CheckCircle className="h-4 w-4" />;
      case 'trip_set_done': return <Calendar className="h-4 w-4" />;
      case 'itinerary_complete': return <CheckCircle className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'new_user': return 'bg-blue-100 text-blue-800';
      case 'profile_complete': return 'bg-green-100 text-green-800';
      case 'trip_set_done': return 'bg-yellow-100 text-yellow-800';
      case 'itinerary_complete': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFlagIcon = (value) => {
    return value ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />;
  };

  useEffect(() => {
    if (userId) {
      loadUserStages();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading user stages...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-8 text-muted-foreground">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-2xl font-bold">User Journey Stages</h1>
          <p className="text-muted-foreground">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'} ({user.email})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journey Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Journey Stages
            </CardTitle>
            <CardDescription>
              User's progression through the TripWell journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'new_user', label: 'New User', description: 'User has signed up but not completed profile' },
              { key: 'profile_complete', label: 'Profile Complete', description: 'User has completed their profile setup' },
              { key: 'trip_set_done', label: 'Trip Set Done', description: 'User has created a trip' },
              { key: 'itinerary_complete', label: 'Itinerary Complete', description: 'User has completed their itinerary' }
            ].map((stage) => (
              <div key={stage.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStageIcon(stage.key)}
                  <div>
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-sm text-gray-600">{stage.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage.key)}`}>
                    {user.journeyStage === stage.key ? 'Current' : 'Not Current'}
                  </span>
                  {user.journeyStage === stage.key ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetStage(stage.key)}
                      disabled={updating}
                    >
                      Reset
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStageUpdate('journeyStage', stage.key)}
                      disabled={updating}
                    >
                      Set Current
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              User Flags
            </CardTitle>
            <CardDescription>
              Boolean flags that control user behavior and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'profileComplete', label: 'Profile Complete', description: 'User has completed their profile' },
              { key: 'tripCreated', label: 'Trip Created', description: 'User has created a trip' },
              { key: 'itineraryComplete', label: 'Itinerary Complete', description: 'User has completed their itinerary' },
              { key: 'emailVerified', label: 'Email Verified', description: 'User has verified their email' },
              { key: 'onboardingComplete', label: 'Onboarding Complete', description: 'User has completed onboarding' }
            ].map((flag) => (
              <div key={flag.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFlagIcon(user[flag.key])}
                  <div>
                    <div className="font-medium">{flag.label}</div>
                    <div className="text-sm text-gray-600">{flag.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user[flag.key] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user[flag.key] ? 'True' : 'False'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagToggle(flag.key, !user[flag.key])}
                    disabled={updating}
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              User State
            </CardTitle>
            <CardDescription>
              Current user state and engagement level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current State</label>
                <p className="mt-1 text-sm text-gray-900">{user.userState || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Engagement Score</label>
                <p className="mt-1 text-sm text-gray-900">{user.engagementScore || 'Not calculated'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Days Since Signup</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.createdAt ? 
                    Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 
                    'Unknown'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Activity</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.lastActivityAt ? 
                    new Date(user.lastActivityAt).toLocaleString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State Options</label>
              <div className="flex flex-wrap gap-2">
                {['active', 'inactive', 'abandoned', 'demo'].map((state) => (
                  <Button
                    key={state}
                    variant={user.userState === state ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStageUpdate('userState', state)}
                    disabled={updating}
                  >
                    {state}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Marketing Flags
            </CardTitle>
            <CardDescription>
              Marketing and communication preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Last Marketing Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.lastMarketingEmail?.sentAt ? 
                    new Date(user.lastMarketingEmail.sentAt).toLocaleString() : 
                    'Never sent'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Campaign</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.lastMarketingEmail?.campaign || 'None'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Opt-in</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.emailOptIn ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Marketing Opt-in</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.marketingOptIn ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Marketing Actions</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFlagToggle('emailOptIn', !user.emailOptIn)}
                  disabled={updating}
                >
                  Toggle Email Opt-in
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFlagToggle('marketingOptIn', !user.marketingOptIn)}
                  disabled={updating}
                >
                  Toggle Marketing Opt-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-4">
        <Button variant="outline" onClick={loadUserStages}>
          <Clock className="h-4 w-4 mr-2" />
          Refresh Stages
        </Button>
      </div>
    </div>
  );
};

export default UserStages;
