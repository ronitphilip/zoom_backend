import { Router } from 'express';
import { login, register, allUsers, addRole } from '../controller/user.controller';
import { authenticate } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/all-users',authenticate, allUsers);
authRouter.post('/add-role',authenticate, addRole);

export default authRouter;