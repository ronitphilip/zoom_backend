import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { addPermissions, assignRole, createRole, fetchRole } from '../controllers/role.controller';

const roleRouter = Router();

roleRouter.post('/create-role', authenticate, createRole);
roleRouter.patch('/add-permissions', authenticate, addPermissions);
roleRouter.patch('/add-role', authenticate, assignRole);
roleRouter.get('/fetch-role', authenticate, fetchRole);

export default roleRouter;