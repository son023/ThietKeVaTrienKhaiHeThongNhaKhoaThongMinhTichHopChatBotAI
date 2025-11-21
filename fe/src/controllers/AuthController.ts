import { 
  LoginRequest, 
  CreateUserRequest, 
  AuthResponse, 
  UserDTO, 
  ApiError,
  RegisterFormData,
  LoginFormData,
  UserRole
} from '../models';
import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';

class AuthController {

  async register(formData: RegisterFormData): Promise<AuthResponse> {
    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      const createUserRequest: CreateUserRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        isActive: true,
        roleNames: formData.role ? [formData.role] : [UserRole.PATIENT]
      };

      const url = createApiUrl('user', API_CONFIG.ENDPOINTS.REGISTER);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(createUserRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const userData: UserDTO = await response.json();
      
      return {
        user: userData,
        message: 'Đăng ký thành công'
      };

    } catch (error) {
      console.error('Register error:', error);
      throw error instanceof Error ? error : new Error('Lỗi đăng ký không xác định');
    }
  }

  async login(formData: LoginFormData): Promise<AuthResponse> {
    try {
      const loginRequest: LoginRequest = {
        username: formData.username,
        password: formData.password
      };

      const url = createApiUrl('auth', API_CONFIG.ENDPOINTS.LOGIN);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(loginRequest)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }
        if (response.status === 403) {
          throw new Error('Tài khoản đã bị vô hiệu hóa');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const userData: UserDTO = await response.json();
      
      // Lưu thông tin user vào localStorage (có thể thay bằng session/cookie)
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      return {
        user: userData,
        message: 'Đăng nhập thành công'
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Lỗi đăng nhập không xác định');
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('rememberMe');
    } catch (error) {
      console.error('Logout error:', error);
      throw error instanceof Error ? error : new Error('Lỗi đăng xuất');
    }
  }

  getCurrentUser(): UserDTO | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) return null;
      
      return JSON.parse(userStr) as UserDTO;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.roles.includes(role) || user.primaryRole === role;
  }

  getPrimaryRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? (user.primaryRole as UserRole) : null;
  }

  async validateCredentials(username: string, password: string): Promise<UserDTO> {
    try {
      const url = createApiUrl('user', API_CONFIG.ENDPOINTS.VALIDATE_CREDENTIALS);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Validate credentials error:', error);
      throw error instanceof Error ? error : new Error('Lỗi xác thực');
    }
  }
}

export const authController = new AuthController();
export default AuthController;
