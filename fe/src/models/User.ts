export interface UserDTO {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  roles: string[];
  primaryRole: string;
}

export interface CreateUserRequest {
  // username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  imageUrl?: string;
  isActive?: boolean;
  roleNames?: string[];
}

export interface LoginRequest {
  phone: string;
  password: string;
}


export interface AuthResponse {
  user: UserDTO;
  token?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
}

// Role definitions
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR', 
  PATIENT = 'PATIENT',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN'
}

// Form data types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginFormData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}
