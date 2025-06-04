import { Request, Response } from 'express';
import { fetchAllUsers, fetchUserByIdAndUpdate, loginUser, registerUser } from '../service/user.service';
import { RegisterRequestBody, LoginRequestBody, UserAttributes, AddRoleRequestBody } from '../type/user.type';
import { generateToken } from '../utils/jwt';

// register
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    console.log('register');
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw Object.assign(new Error('Missing required fields'), { status: 400 });
        }

        const user = await registerUser(name, email, password);

        const token = generateToken({ id: user.id, email: user.email, name: user.name });
        res.status(201).json({ token });
    } catch (err) {
        throw err;
    }
};

// login
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    console.log('login');
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw Object.assign(new Error('Missing required fields'), { status: 400 });
        }

        const user = await loginUser(email, password);

        const token = generateToken({ id: user.id, email: user.email, name: user.name });
        res.status(200).json({ token });
    } catch (err) {
        throw err;
    }
};

// fetch all users
export const allUsers = async (req: Request, res: Response<UserAttributes[]>) => {
    console.log('allUsers');
    try {
        const users = await fetchAllUsers();

        res.status(200).json(users);
    } catch (err) {
        throw err;
    }
}

// add role to a user
export const addRole = async (req: Request<{}, {}, AddRoleRequestBody>, res: Response) => {
    console.log('addRole');

    try {
        const { userId, roleId } = req.body;
        
        const roleAssigned = await fetchUserByIdAndUpdate(userId, roleId);
        res.status(200).json(roleAssigned);
    } catch (err) {
        throw err;
    }
}