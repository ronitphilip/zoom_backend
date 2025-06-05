import { Role } from '../model/role.model';
import { User } from '../model/user.model';
import { UserAttributes } from '../type/user.type';
import { hashPassword, comparePasswords } from '../utils/bcrypt';

export const registerUser = async (name: string, email: string, password: string): Promise<UserAttributes> => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw Object.assign(new Error('Email already exists'), { status: 400 });

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const result = user.toJSON() as UserAttributes;
  delete result.password;

  return result;
};

export const loginUser = async (email: string, password: string): Promise<UserAttributes> => {
  const user = await User.findOne({where: { email }});
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const isMatch = await comparePasswords(password, user.password || '');
  if (!isMatch) throw Object.assign(new Error('Invalid password'), { status: 401 });

  const result = user.toJSON() as UserAttributes;
  delete result.password;

  return result;
};

export const findAllUsers = async (): Promise<UserAttributes[]> => {

  const allUsers = await User.findAll({
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role'],
      },
    ],
  })
  if (!allUsers) throw Object.assign(new Error('User not found'), { status: 404 });

  const users = allUsers.map((user) => {
    const plain = user.toJSON() as any;
    return {
      ...plain,
      role: plain.role?.role || null,
      roleId: undefined,
      createdAt: undefined,
      password: undefined
    };
  });

  return users as UserAttributes[];
}