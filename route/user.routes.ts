import { Router } from 'express';
import { fetchAllUsers, login, register } from '../controller/user.controller';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/all-users', fetchAllUsers);

export default authRouter;