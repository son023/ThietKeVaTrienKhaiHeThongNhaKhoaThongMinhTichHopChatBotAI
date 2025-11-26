export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    // User Service
    REGISTER: '/user-service/users',
    LOGIN: '/user-service/users/login',
    GET_USER_BY_ID: '/user-service/users',
    GET_USER_BY_USERNAME: '/user-service/users/username',
    VALIDATE_CREDENTIALS: '/user-service/users/valid',

    // Appointment Service
    MEDICAL_SERVICES: '/appointment-service/medical-services'
  }
};

export const createApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
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
