import { NextFunction, Request, Response } from 'express';
import { findAllUsers, loginUser, registerUser } from '../service/user.service';
import { RegisterRequestBody, LoginRequestBody, UserResponseBody, UserAttributes } from '../type/user.type';
import { generateToken } from '../utils/jwt';

// register
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response<UserResponseBody>, next: NextFunction) => {
    console.log('register');
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(Object.assign(new Error('Missing required fields'), { status: 400 }));
        }

        const user = await registerUser(name, email, password);

        res.status(201).json({ success:true, data: user });
    } catch (err) {
        next(err);
    }
};

// login
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response<UserResponseBody>, next: NextFunction) => {
    console.log('login');
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(Object.assign(new Error('Missing required fields'), { status: 400 }));
        }

        const user = await loginUser(email, password);

        const token = generateToken({ id: user.id, email: user.email, name: user.name, roleId: user?.roleId });
        res.status(200).json({ success:true, token: token });
    } catch (err) {
        next(err);
    }
};

// fetch all users
export const fetchAllUsers = async (req: Request, res: Response<UserAttributes[]>, next: NextFunction) => {
    console.log('fetchAllUsers');
    
    try {
        const allUsers = await findAllUsers();

        res.status(200).json(allUsers);
    } catch (err) {
        next(err)
    }
}
