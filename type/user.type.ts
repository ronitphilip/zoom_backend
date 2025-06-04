export interface RoleAttributes {
  role: string;
}

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: RoleAttributes | string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface AddRoleRequestBody {
  userId : number;
  roleId : number;
}
