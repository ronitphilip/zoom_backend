import { Request, Response } from 'express';
import { Role } from '../model/role.model';
import { Permission } from '../model/permission.model';
import { addPermissionRequestBody, createRoleRequestBody, permissionsToRoleRequestBody, ResponseBody } from '../type/role.type';

// add new permission
export const addPermission = async (req: Request<{}, {}, addPermissionRequestBody>, res: Response<ResponseBody>) => {
    console.log('addPermission');

    try {
        const { name } = req.body;
        if (!name) throw Object.assign(new Error('Permission name is required'), { status: 400 });

        const newPermission = await Permission.create({ name });
        res.status(201).json({success : true});
    } catch (err) {
        throw err;
    }
}

// create new role for user
export const createRole = async (req: Request<{}, {}, createRoleRequestBody>, res: Response<ResponseBody>) => {
    console.log('createRole');
    try {
        const { role } = req.body;
        if (!role) throw Object.assign(new Error('Role is required'), { status: 400 });

        const newRole = await Role.create({ role });
        res.status(201).json({success : true});
    } catch (err) {
        throw err;
    }
};

// assign permissions to a role
export const assignPermissionsToRole = async (req: Request<{}, {}, permissionsToRoleRequestBody>, res: Response<ResponseBody>) => {
    try {
        const { roleId, permissionIds } = req.body;

        if (!roleId || !Array.isArray(permissionIds)) {
            throw Object.assign(new Error('roleId and permissionIds (array) are required'), { status: 400 });
        }

        const role = await Role.findByPk(roleId);
        if (!role) throw Object.assign(new Error('Role not found'), { status: 404 });

        const permissions = await Permission.findAll({
            where: { id: permissionIds }
        });

        if (permissions.length !== permissionIds.length) {
            throw Object.assign(new Error('Some permissions not found'), { status: 400 });
        }

        await role.setPermissions(permissions);
        const updatedRoleWithPermissions = await Role.findByPk(roleId, {
            include: ['permissions']
        });

        res.status(200).json({success : true});
    } catch (err) {
        throw err;
    }
};

