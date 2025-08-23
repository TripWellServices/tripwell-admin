import React, { useState } from 'react';
import { Users, MapPin, BarChart3, Shield, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AdminHome = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://gofastbackend.onrender.com/tripwell/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        toast.success('Welcome to TripWell Admin!');
        localStorage.setItem('adminLoggedIn', 'true');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    setUsername('');
    setPassword('');
    toast.success('Logged out successfully');
  };

  // Check if already logged in
  React.useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn) {
      setIsLoggedIn(true);
    }
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
      title: 'User Dashboard',
      description: 'Quick overview of all users and their trip status',
      icon: <BarChart3 className="h-8 w-8" />,
      route: '/user-dashboard',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      title: 'Trip Dashboard',
      description: 'Monitor active trips, planning status, and trip analytics',
      icon: <MapPin className="h-8 w-8" />,
      route: '/trip-dashboard',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Toaster position="top-right" />
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to TripWell Admin Portal</CardTitle>
            <CardDescription className="text-base">
              This portal serves as a way to build the best customer experience possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TripWell Admin Portal</h1>
          <p className="text-gray-600 mt-2">Choose your admin dashboard</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
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

export default AdminHome;
