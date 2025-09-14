import React, { useState, useEffect } from 'react';
import { X, Trash2, RefreshCw, AlertTriangle, CheckCircle, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';

const FullUser = ({ userId, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [selectedTripToKeep, setSelectedTripToKeep] = useState('');

  useEffect(() => {
    if (userId) {
      loadFullUserData();
    }
  }, [userId]);

  const loadFullUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/user/${userId}`);
      if (!response.ok) throw new Error('Failed to load user data');
      
      const data = await response.json();
      setUserData(data);
      
      // Auto-select the most recent trip if there are duplicates
      if (data.trips.length > 1) {
        const mostRecent = data.trips[0]; // Already sorted by createdAt desc
        setSelectedTripToKeep(mostRecent._id);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!selectedTripToKeep) {
      toast.error('Please select a trip to keep');
      return;
    }

    setCleaningUp(true);
    try {
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/user/${userId}/cleanup-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepTripId: selectedTripToKeep })
      });

      if (!response.ok) throw new Error('Failed to cleanup duplicates');
      
      const result = await response.json();
      toast.success(`Cleaned up ${result.tripsRemoved} duplicate trips`);
      
      // Reload user data
      await loadFullUserData();
      
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      toast.error('Failed to cleanup duplicate trips');
    } finally {
      setCleaningUp(false);
    }
  };

  const handleResetJourney = async (journeyStage, userState) => {
    try {
      const response = await fetch(`https://gofastbackend.onrender.com/tripwell/admin/user/${userId}/reset-journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journeyStage, userState })
      });

      if (!response.ok) throw new Error('Failed to reset journey');
      
      const result = await response.json();
      toast.success('User journey reset successfully');
      
      // Reload user data
      await loadFullUserData();
      
    } catch (error) {
      console.error('Error resetting journey:', error);
      toast.error('Failed to reset user journey');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading user data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">Failed to load user data</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  const { user, trips, joinCodes, summary } = userData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Full User Management</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">User Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Firebase ID:</strong> {user.firebaseId}</div>
              <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
              <div><strong>Profile Complete:</strong> {user.profileComplete ? '✅' : '❌'}</div>
              <div><strong>Funnel Stage:</strong> {user.funnelStage || 'none'}</div>
              <div><strong>Journey Stage:</strong> {user.journeyStage || 'unknown'}</div>
              <div><strong>User State:</strong> {user.userState || 'unknown'}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Trip Summary</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Total Trips:</strong> {summary.totalTrips}</div>
              <div><strong>Active Trips:</strong> {summary.activeTrips}</div>
              <div><strong>Completed Trips:</strong> {summary.completedTrips}</div>
              <div><strong>Join Codes:</strong> {summary.joinCodesCreated}</div>
            </div>
          </div>
        </div>

        {/* Duplicate Trips Warning */}
        {trips.length > 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Duplicate Trips Detected</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              This user has {trips.length} trips. This likely happened due to frontend flow issues. 
              Select which trip to keep and clean up the duplicates.
            </p>
            
            <div className="space-y-3">
              {trips.map((trip, index) => (
                <div key={trip._id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                  <input
                    type="radio"
                    id={`trip-${trip._id}`}
                    name="keepTrip"
                    value={trip._id}
                    checked={selectedTripToKeep === trip._id}
                    onChange={(e) => setSelectedTripToKeep(e.target.value)}
                    className="text-blue-600"
                  />
                  <label htmlFor={`trip-${trip._id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{trip.tripName}</div>
                    <div className="text-sm text-gray-600">
                      {trip.city} • {new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            <Button
              onClick={handleCleanupDuplicates}
              disabled={!selectedTripToKeep || cleaningUp}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700"
            >
              {cleaningUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning Up...
                </>
              ) : (
                'Clean Up Duplicates'
              )}
            </Button>
          </div>
        )}

        {/* All Trips */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">All Trips</h3>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{trip.tripName}</h4>
                      {trip._id.toString() === user.tripId?.toString() && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{trip.city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{trip.partyCount} people</span>
                      </div>
                      <div>
                        Status: {trip.tripComplete ? '✅ Complete' : '🔄 Active'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Management */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Journey Management</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetJourney('new_user', 'demo_only')}
            >
              Reset to New User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetJourney('profile_complete', 'active')}
            >
              Reset to Profile Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetJourney('trip_set_done', 'active')}
            >
              Reset to Trip Set Done
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetJourney('itinerary_complete', 'active')}
            >
              Reset to Itinerary Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullUser;