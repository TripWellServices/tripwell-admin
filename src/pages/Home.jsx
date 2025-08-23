import React from 'react';
import { Users, MapPin, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TripWell Admin</h1>
        <p className="text-gray-600 mt-2">Choose your admin dashboard</p>
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

export default Home;
