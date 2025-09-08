// API Configuration
export const API_CONFIG = {
  // Node.js Backend
  NODE_BACKEND_URL: 'https://gofastbackend.onrender.com',
  
  // Python Service
  PYTHON_SERVICE_URL: 'https://tripwell-ai.onrender.com',
  
  // Local development URLs (if needed)
  LOCAL_NODE_BACKEND: 'http://localhost:3000',
  LOCAL_PYTHON_SERVICE: 'http://localhost:5000'
};

// Helper function to get the current environment
export const getApiUrl = (service) => {
  const isDevelopment = import.meta.env.DEV;
  
  switch (service) {
    case 'node':
      return isDevelopment ? API_CONFIG.LOCAL_NODE_BACKEND : API_CONFIG.NODE_BACKEND_URL;
    case 'python':
      return isDevelopment ? API_CONFIG.LOCAL_PYTHON_SERVICE : API_CONFIG.PYTHON_SERVICE_URL;
    default:
      return API_CONFIG.NODE_BACKEND_URL;
  }
};
