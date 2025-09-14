import React, { useState, useEffect } from 'react';
import { Users, MapPin, BarChart3, Database, RefreshCw, CheckCircle, LogOut, MessageSquare, TrendingUp, Brain, Trash2, Bomb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboardChoices = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [hydrating, setHydrating] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const handleHydrateUsers = async () => {
    setHydrating(true);
    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/users', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
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
      setHydrating(false);
    }
  };

  const checkHydrationStatus = () => {
    const hydratedUsers = localStorage.getItem('hydratedUsers');
    if (hydratedUsers) {
      const users = JSON.parse(hydratedUsers);
      setIsHydrated(true);
      setUserCount(users.length);
    }
  };

  const handleCleanupOrphanedData = async () => {
    setCleaning(true);
    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/cleanup-orphaned-data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Cleanup complete! Deleted ${result.details.totalDeleted} orphaned records`);
        console.log('Cleanup details:', result.details);
      } else {
        throw new Error(result.error || 'Cleanup failed');
      }
    } catch (err) {
      toast.error('Failed to cleanup orphaned data: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };


  const handleLogout = () => {
    logout();
    localStorage.removeItem('hydratedUsers');
    localStorage.removeItem('lastHydrated');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Check hydration status on mount
  useEffect(() => {
    checkHydrationStatus();
  }, []);

  const navigationCards = [
    {
      title: 'User Admin',
      description: 'Manage users, view profiles, and handle user data',
      icon: <Users className="h-8 w-8" />,
      route: '/user-admin',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      title: 'Message Center',
      description: 'Send targeted messages to users with templates',
      icon: <MessageSquare className="h-8 w-8" />,
      route: '/message-center',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      title: 'User Journey',
      description: 'Track full app users through their TripWell experience',
      icon: <BarChart3 className="h-8 w-8" />,
      route: '/user-journey',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      title: 'Funnel Tracker',
      description: 'Monitor demo users and conversion potential',
      icon: <TrendingUp className="h-8 w-8" />,
      route: '/funnel-tracker',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Trip Dashboard',
      description: 'Monitor active trips, planning status, and trip analytics',
      icon: <MapPin className="h-8 w-8" />,
      route: '/trip-dashboard',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    },
    {
      title: 'User State Testing',
      description: 'Test Python user analysis and state management',
      icon: <Brain className="h-8 w-8" />,
      route: '/usertest',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TripWell Admin Portal</h1>
          <p className="text-gray-600 mt-2">Choose your admin dashboard</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Hydration Status */}
      <div className="mb-6">
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">User Data Status</CardTitle>
                  <CardDescription>
                    {isHydrated 
                      ? `${userCount} users cached locally` 
                      : 'No users cached yet'
                    }
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isHydrated && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Hydrated</span>
                  </div>
                )}
                <Button
                  onClick={handleHydrateUsers}
                  disabled={hydrating}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${hydrating ? 'animate-spin' : ''}`} />
                  {hydrating ? 'Hydrating...' : 'Refresh Users'}
                </Button>
                <Button
                  onClick={handleCleanupOrphanedData}
                  disabled={cleaning}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className={`h-4 w-4 mr-2 ${cleaning ? 'animate-pulse' : ''}`} />
                  {cleaning ? 'Cleaning...' : 'Cleanup DB'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((card) => (
          <Card 
            key={card.title}
            className={`cursor-pointer transition-all duration-200 ${card.color}`}
            onClick={() => navigate(card.route)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  {card.icon}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.route);
                }}
              >
                Open Dashboard
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardChoices;
