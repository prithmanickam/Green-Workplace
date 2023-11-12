export let baseURL;

if (process.env.NODE_ENV === 'development') {
  // Development environment
  baseURL = 'http://localhost:5000/api';
} else {
  // Production environment
  baseURL = 'https://green-workplace-transport-mode-detector.onrender.com/api';
}

