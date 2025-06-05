import { Router } from 'express';
import { fetchAllUsers, login, register } from '../controller/user.controller';
import { authenticate } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/all-users', authenticate, fetchAllUsers);

export default authRouter;