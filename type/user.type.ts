import { RoleAttributes } from "./role.type";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: RoleAttributes | string;
  password?: string;
  createdAt?: Date;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface UserResponseBody {
  token?: string;
  data?: UserAttributes;
  success: boolean
}
