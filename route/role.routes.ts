import { Router } from 'express';
import { addPermission, createRole, assignPermissionsToRole } from '../controller/role.controller';
import { authenticate } from '../middleware/auth';

const roleRouter = Router();

roleRouter.post('/create-role',authenticate, createRole);
roleRouter.post('/create-permission',authenticate, addPermission);
roleRouter.post('/assign-permission',authenticate, assignPermissionsToRole);

export default roleRouter;