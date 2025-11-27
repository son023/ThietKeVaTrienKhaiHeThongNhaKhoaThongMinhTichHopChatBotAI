import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';
import { UserDTO } from '../models';

class UserController {
  private baseUrl = API_CONFIG.ENDPOINTS.USERS;

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (error) {
        // ignore parse error
      }
      throw new Error(msg);
    }
    return res.json();
  }

  async getAll(): Promise<UserDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<UserDTO[]>(res);
  }

  async getById(id: string): Promise<UserDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<UserDTO>(res);
  }

  async getByIds(ids: string[]): Promise<Record<string, UserDTO>> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const entries = await Promise.all(
      uniqueIds.map(async (userId) => {
        try {
          const user = await this.getById(userId);
          return [userId, user] as const;
        } catch (error) {
          console.error('Failed to fetch user', userId, error);
          return null;
        }
      })
    );

    return entries.reduce((acc, entry) => {
      if (!entry) return acc;
      const [userId, user] = entry;
      acc[userId] = user;
      return acc;
    }, {} as Record<string, UserDTO>);
  }
}

export const userController = new UserController();
export default UserController;
