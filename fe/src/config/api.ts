export const API_CONFIG = {
  AUTH_SERVICE_BASE_URL: 'http://localhost:8080',
  USER_SERVICE_BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    // Auth Service
    LOGIN: '/auth/login',
    
    // User Service  
    REGISTER: '/user-service/users',
    GET_USER_BY_ID: '/user-service/users',
    GET_USER_BY_USERNAME: '/user-service/users/username',
    VALIDATE_CREDENTIALS: '/user-service/users/valid',
  }
};

export const createApiUrl = (service: 'auth' | 'user', endpoint: string) => {
  const baseUrl = service === 'auth' 
    ? API_CONFIG.AUTH_SERVICE_BASE_URL 
    : API_CONFIG.USER_SERVICE_BASE_URL;
  return `${baseUrl}${endpoint}`;
};

export const getApiHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
