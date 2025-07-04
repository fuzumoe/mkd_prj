// Environment configuration
const config = {
  // API URLs
  DJANGO_API_URL: import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000',
  FLASK_API_URL: import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000',

  // Stripe
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RIU9F2M1FZ2eECH7eq4MW90KrgiaVk6WyruRTuiD1svrAW3wPtKECnTagjhPQ6NbQvJF2gvgW5mFXuQbqwMoKRd00c7ohPdU6',

  // App Settings
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Aurora Organics',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};

export default config;
