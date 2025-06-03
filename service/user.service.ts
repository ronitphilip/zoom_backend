import bcrypt from 'bcrypt';
import { User } from '../model/user.model';

export const registerUser = async (name: string, email: string, password: string) => {
    try {
        if (!name || !email || !password) {
            throw Object.assign(new Error('Missing required fields'), { status: 400 });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw Object.assign(new Error('Email already exists'), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        return user;
    } catch (err) {
        throw err;
    }
};

export const loginUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw Object.assign(new Error('Email and password are required'), { status: 400 });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
    }

    if (!user.password) {
        throw Object.assign(new Error('User password not set'), { status: 500 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    return user;
};