import config from '../config/env.js';

// API utility functions
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = endpoint.startsWith('/predict') || endpoint.startsWith('/model-info') 
    ? config.FLASK_API_URL 
    : config.DJANGO_API_URL;
  
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API endpoints
export const API_ENDPOINTS = {
  // Django endpoints
  DJANGO: {
    ADMIN_ORDERS: '/api/admin/orders/',
    USER_ANALYSIS_SUMMARY: (email) => `/api/user/analysis-summary/${email}`,
    USER_RECOMMENDED_PRODUCTS: (email) => `/api/user/recommended-products/${email}`,
    BLOGS: '/api/blogs/',
    USER_ACTIVITY: (email) => `/api/user/activity/${email}`,
    USER_CONSULTATIONS: (email) => `/api/user/consultations/${email}`,
    RATE_SERVICE: '/api/rate-service/',
    CONSULTATION_PAYMENT: '/api/consultation-payment/',
    CART: (userEmail) => `/api/cart/?user_email=${encodeURIComponent(userEmail)}`,
    CART_ITEM: (itemId) => `/api/cart/${itemId}/`,
    PROFILE_IMAGE: (email) => `/api/get-profile-image/?email=${encodeURIComponent(email)}`,
    ANALYZE_LIST: (userEmail) => `/api/analyze/list/?user_email=${encodeURIComponent(userEmail)}`,
    ANALYZE_DELETE: (id) => `/api/analyze/${id}/`,
    CHANGE_PASSWORD: '/api/change-password/',
    UPLOAD_PROFILE_IMAGE: '/api/upload-profile-image/',
    ADMIN_ANALYZE_LIST: '/api/admin/analyze/list/',
  },
  
  // Flask endpoints
  FLASK: {
    PREDICT: '/predict',
    MODEL_INFO: '/model-info',
  }
};

export default { apiCall, API_ENDPOINTS };
