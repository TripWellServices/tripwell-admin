import React, { useState, useEffect } from 'react';
import { User, RefreshCw, Database, Brain, Mail, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config.js';

const Usertest = () => {
  const { isAdmin } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [interpretedData, setInterpretedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pythonLoading, setPythonLoading] = useState(false);
  const [pythonResponse, setPythonResponse] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Get API URLs from config
  const NODE_BACKEND_URL = getApiUrl('node');
  const PYTHON_SERVICE_URL = getApiUrl('python');

  // Adam Cole test user data
  const adamCole = {
    userId: "68afbb8f589d5d4958b151a2",
    firebaseId: "test-firebase-id",
    email: "adam.cole.0524@gmail.com",
    firstName: "Adam",
    lastName: "Cole",
    profileComplete: true,
    tripId: null,
    funnelStage: "full_app",
    createdAt: "2025-08-27T22:14:00Z",
    role: "noroleset"
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    setUserData(null);
    setInterpretedData(null);
    setPythonResponse(null);

    try {
      console.log('🔍 Searching for user:', searchEmail);
      
      const foundUser = allUsers.find(user => 
        user.email.toLowerCase() === searchEmail.toLowerCase()
      );

      if (foundUser) {
        setUserData(foundUser);
        toast.success(`Found user: ${foundUser.firstName || 'No name'} (${foundUser.email})`);
        
        // Automatically analyze with Python service
        await analyzeUserWithPython(foundUser);
      } else {
        toast.error(`User not found: ${searchEmail}`);
      }
    } catch (err) {
      console.error('❌ Error searching for user:', err);
      toast.error('Failed to search for user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUserWithPython = async (user) => {
    if (!user) {
      toast.error('No user data to analyze');
      return;
    }

    setPythonLoading(true);
    setPythonResponse(null);

    try {
      console.log('🧠 Analyzing user with Python service:', user.email);
      
      // Prepare the request for Python service
      const analysisRequest = {
        user_id: user.userId,
        firebase_id: user.firebaseId || user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileComplete: user.profileComplete,
        tripId: user.tripId,
        funnelStage: user.funnelStage,
        createdAt: user.createdAt,
        context: 'admin_test',
        hints: {
          user_type: 'existing_user',
          entry_point: 'admin_test',
          has_profile: user.profileComplete || false,
          has_trip: !!user.tripId,
          days_since_signup: user.createdAt ? 
            Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0
        }
      };

      console.log('📤 Sending to Python service:', analysisRequest);

      const response = await fetch(`${NODE_BACKEND_URL}/tripwell/admin/analyze-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Python service error:', response.status, errorText);
        toast.error(`Python service error: ${response.status} - ${errorText}`);
        throw new Error(`Python service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📥 Python service response:', result);
      
      setPythonResponse(result);
      
      if (result.success) {
        toast.success(`Python analysis complete! ${result.actions_taken?.length || 0} actions taken.`);
      } else {
        toast.error('Python analysis failed: ' + result.message);
      }
    } catch (err) {
      console.error('❌ Error analyzing with Python:', err);
      toast.error('Python analysis failed: ' + err.message);
      setPythonResponse({
        success: false,
        error: err.message,
        user_state: {
          journey_stage: 'error',
          user_state: 'error', 
          engagement_level: 'error',
          trip_status: 'error'
        }
      });
    } finally {
      setPythonLoading(false);
    }
  };

  const triggerUserUpdate = async () => {
    if (!userData) {
      toast.error('No user selected');
      return;
    }

    await analyzeUserWithPython(userData);
  };

  // Set Adam Cole as the test user on mount
  useEffect(() => {
    setUserData(adamCole);
  }, []);

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

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800',
      'abandoned': 'bg-red-100 text-red-800',
      'demo_only': 'bg-blue-100 text-blue-800',
      'new_user': 'bg-purple-100 text-purple-800',
      'profile_complete': 'bg-indigo-100 text-indigo-800',
      'trip_set_done': 'bg-orange-100 text-orange-800',
      'trip_active': 'bg-green-100 text-green-800',
      'trip_complete': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEngagementColor = (level) => {
    const colors = {
      'brand_new': 'bg-green-100 text-green-800',
      'new': 'bg-blue-100 text-blue-800',
      'recent': 'bg-yellow-100 text-yellow-800',
      'engaged': 'bg-purple-100 text-purple-800',
      'dormant': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            User State Testing Tool
          </CardTitle>
          <CardDescription>
            Test user analysis and state management with Python backend integration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Adam Cole Test User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Adam Cole - Test User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Adam Cole</strong> (adam.cole.0524@gmail.com)
              </p>
              <p className="text-xs text-gray-500">
                Funnel Stage: full_app | Profile: Complete | Trip: None
              </p>
            </div>
            <Button 
              onClick={() => analyzeUserWithPython(adamCole)} 
              disabled={pythonLoading}
              className="flex items-center gap-2"
            >
              <Brain className={`h-4 w-4 ${pythonLoading ? 'animate-pulse' : ''}`} />
              {pythonLoading ? 'Analyzing...' : 'Have Python Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Data Display */}
      {userData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Raw User Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div><strong>Name:</strong> {userData.firstName} {userData.lastName}</div>
                <div><strong>Email:</strong> {userData.email}</div>
                <div><strong>User ID:</strong> {userData.userId}</div>
                <div><strong>Firebase ID:</strong> {userData.firebaseId || 'N/A'}</div>
                <div><strong>Role:</strong> {userData.role}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Profile Complete:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${userData.profileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {userData.profileComplete ? 'Yes' : 'No'}
                  </span>
                </div>
                <div><strong>Funnel Stage:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(userData.funnelStage)}`}>
                    {userData.funnelStage || 'none'}
                  </span>
                </div>
                <div><strong>Trip ID:</strong> {userData.tripId || 'None'}</div>
                <div><strong>Created:</strong> {formatDate(userData.createdAt)}</div>
                <div><strong>Last Login:</strong> {formatDate(userData.lastLoginAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Python Analysis Section */}
      {userData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Python Analysis
              </CardTitle>
              <Button 
                onClick={triggerUserUpdate}
                disabled={pythonLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${pythonLoading ? 'animate-spin' : ''}`} />
                {pythonLoading ? 'Analyzing...' : 'Re-analyze User'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pythonLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Analyzing user with Python service...</span>
              </div>
            ) : pythonResponse ? (
              <div className="space-y-4">
                {/* Analysis Status */}
                <div className="flex items-center gap-2">
                  {pythonResponse.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${pythonResponse.success ? 'text-green-600' : 'text-red-600'}`}>
                    {pythonResponse.success ? 'Analysis Successful' : 'Analysis Failed'}
                  </span>
                </div>

                {/* User State */}
                {pythonResponse.user_state && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Journey Stage</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pythonResponse.user_state.journey_stage)}`}>
                        {pythonResponse.user_state.journey_stage}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">User State</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pythonResponse.user_state.user_state)}`}>
                        {pythonResponse.user_state.user_state}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Engagement</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${getEngagementColor(pythonResponse.user_state.engagement_level)}`}>
                        {pythonResponse.user_state.engagement_level}
                      </span>
                    </div>
                  </div>
                )}

                {/* Trip Status */}
                {pythonResponse.user_state?.trip_status && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Trip Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pythonResponse.user_state.trip_status)}`}>
                      {pythonResponse.user_state.trip_status}
                    </span>
                  </div>
                )}

                {/* Actions Taken */}
                {pythonResponse.actions_taken && pythonResponse.actions_taken.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Actions Taken</h4>
                    <div className="space-y-2">
                      {pythonResponse.actions_taken.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">
                            <strong>{action.campaign}</strong> - {action.status}
                          </span>
                          {action.reason && (
                            <span className="text-xs text-gray-600">({action.reason})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Response */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Python Response</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(pythonResponse, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Re-analyze User" to run Python analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span>Node.js Backend: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span>Python Service: {PYTHON_SERVICE_URL}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usertest;
