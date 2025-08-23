import { useState, useCallback } from 'react';
import { auth } from '../firebase.js';

const API_BASE_URL = '/tripwell/admin'; // This will be proxied to http://localhost:5000/tripwell/admin

export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(async () => {
    // Simple admin auth - get credentials from localStorage
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      throw new Error('Not logged in as admin');
    }
    
    // In production, these would come from environment variables
    const username = 'admin';
    const password = 'tripwell2025';
    
    return {
      'Content-Type': 'application/json',
      'username': username,
      'password': password
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the data to match our expected structure
      const transformedUsers = data.map(user => ({
        userId: user.userId || user._id,
        email: user.email,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        tripId: user.tripId,
        tripCreatedAt: user.tripCreatedAt,
        tripCompletedAt: user.tripCompletedAt,
        role: user.role || 'user',
        profileComplete: user.profileComplete || false
      }));
      
      return transformedUsers;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  return {
    fetchUsers,
    deleteUser,
    loading,
    error
  };
};
