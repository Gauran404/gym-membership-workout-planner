import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach Authorization Bearer token to all outgoing requests
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration or unauthorized calls
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request, clearing local credentials.');
      // If unauthorized, clear invalid token so user is guided back to clean login
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
    }
    return Promise.reject(error);
  }
);

export default API;