export interface addPermissionRequestBody {
    name: string;
}

export interface createRoleRequestBody {
    role: string;
}

export interface permissionsToRoleRequestBody {
    roleId: number;
    permissionIds: number[];
}

export interface ResponseBody {
    success: boolean;
}