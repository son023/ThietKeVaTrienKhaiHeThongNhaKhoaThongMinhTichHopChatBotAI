export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    // User Service
    REGISTER: '/user-service/users',
    LOGIN: '/user-service/users/login',
    GET_USER_BY_ID: '/user-service/users',
    GET_USER_BY_USERNAME: '/user-service/users/username',
    VALIDATE_CREDENTIALS: '/user-service/users/valid',
    USERS: '/user-service/users',

    // Appointment Service
    MEDICAL_SERVICES: '/appointment-service/medical-services',
    APPOINTMENTS: '/appointment-service/appointments',

    // Doctor Service
    DOCTORS: '/doctor-service/doctors',

    // Patient Service
    PATIENTS: '/patient-service/patients'
  }
};

export const createApiUrl = (...segments: string[]) => {
  const cleanSegments = segments.filter(Boolean);
  if (cleanSegments.length === 0) {
    return API_CONFIG.BASE_URL;
  }

  // Prefer the first segment that already looks like a path (starts with "/")
  const firstPathIndex = cleanSegments.findIndex((segment) => segment.startsWith('/'));

  const pathSegments =
    firstPathIndex === -1
      ? cleanSegments
      : [
          cleanSegments[firstPathIndex],
          ...cleanSegments.slice(firstPathIndex + 1).map((segment) => segment.replace(/^\/+/, '')),
        ];

  const path = pathSegments
    .map((segment, idx) => (idx === 0 ? segment : segment.startsWith('/') ? segment : `/${segment}`))
    .join('');

  return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
