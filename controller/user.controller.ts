import { Request, Response } from 'express';
import { loginUser, registerUser } from '../service/user.service';

interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw Object.assign(new Error('Missing required fields'), { status: 400 });
        }

        const user = await registerUser(name, email, password);
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (err) {
        throw err;
    }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw Object.assign(new Error('Missing required fields'), { status: 400 });
        }

        const user = await loginUser(email, password);
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        throw err; // Let errorHandler middleware handle the error
    }
};