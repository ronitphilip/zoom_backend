import { Role } from '../model/role.model';
import { User } from '../model/user.model';
import { UserAttributes } from '../type/user.type';
import { hashPassword, comparePasswords } from '../utils/bcrypt';

export const registerUser = async (name: string, email: string, password: string): Promise<UserAttributes> => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw Object.assign(new Error('Email already exists'), { status: 400 });

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });
  return user.toJSON() as UserAttributes;
};

export const loginUser = async (email: string, password: string): Promise<UserAttributes> => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const isMatch = await comparePasswords(password, user.password || '');
  if (!isMatch) throw Object.assign(new Error('Invalid password'), { status: 401 });

  return user.toJSON() as UserAttributes;
};

export const fetchAllUsers = async (): Promise<UserAttributes[]> => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email'],
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role'],
      },
    ],
  });

  if (!users || users.length === 0) {
    throw Object.assign(new Error('No users found'), { status: 404 });
  }

  return users.map(user => {
    const userData = user.toJSON() as UserAttributes & { role?: { role: string } };
    return {
      ...userData,
      role: userData.role && typeof userData.role === 'object' ? userData.role.role : userData.role || null,
    } as UserAttributes;
  });
};

export const fetchUserByIdAndUpdate = async (userId: number, roleId: number): Promise<UserAttributes> => {
  const user = await User.findByPk(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const role = await Role.findByPk(roleId);
  if (!role) throw Object.assign(new Error('Role not found'), { status: 404 });

  await user.setRole(role);

  const updatedUser = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email'],
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role'],
      },
    ],
  });

  if (!updatedUser) throw Object.assign(new Error('Updated user not found'), { status: 404 });

  const userJson = updatedUser.toJSON() as any;

  return {
    id: userJson.id,
    name: userJson.name,
    email: userJson.email,
    role: userJson.role?.role || null,
  };
};

