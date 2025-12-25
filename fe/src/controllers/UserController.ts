import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { UserDTO } from "../models";

export interface UpdateUserRequestDTO {
  email?: string;
  fullName?: string;
  phone?: string;
  imageUrl?: string;
  isActive?: boolean;
  roleNames?: string[];
}

class UserController {
  private baseUrl = API_CONFIG.ENDPOINTS.USERS;

  private normalizeUser(raw: RawUser): UserDTO {
    const roles =
      Array.isArray(raw.roles) || !raw.roles
        ? (raw.roles as string[] | undefined)
        : Array.from(raw.roles as Set<string>);

    return {
      id: raw.id || (raw as any).userId || "",
      username: raw.username || "",
      email: raw.email || "",
      fullName: raw.fullName || (raw as any).fullname || "",
      phone: raw.phone,
      isActive: raw.isActive ?? false,
      imageUrl: raw.imageUrl,
      createdAt: raw.createdAt || (raw as any).createAt || "",
      roles: roles || [],
      primaryRole: raw.primaryRole || (raw as any).primary_role || "",
    };
  }

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
      headers: getApiHeaders(),
    });
    const users = await this.handleResponse<RawUser[]>(res);
    return users.map((u) => this.normalizeUser(u));
  }

  async getById(id: string): Promise<UserDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "GET",
      headers: getApiHeaders(true),
    });
    const user = await this.handleResponse<RawUser>(res);
    return this.normalizeUser(user);
  }

  async getByIds(ids: string[]): Promise<Record<string, UserDTO>> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const entries = await Promise.all(
      uniqueIds.map(async (userId) => {
        try {
          const user = await this.getById(userId);
          return [userId, user] as const;
        } catch (error) {
          console.error("Failed to fetch user", userId, error);
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

  async update(id: string, data: UpdateUserRequestDTO): Promise<UserDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "PUT",
      headers: getApiHeaders(true),
      body: JSON.stringify(data),
    });
    const user = await this.handleResponse<RawUser>(res);
    return this.normalizeUser(user);
  }
}

type RawUser = Partial<UserDTO> & {
  fullname?: string;
  createAt?: string;
  roles?: Set<string> | string[];
  primary_role?: string;
  userId?: string;
};

export const userController = new UserController();
export default UserController;
