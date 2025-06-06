import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptionResult } from '../types/user.type';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8');
const IV_LENGTH: number = 16;

export const encryptRole = (role: string): EncryptionResult => {

  if (ENCRYPTION_KEY.length !== 32) throw Object.assign(new Error('ENCRYPTION_KEY must be exactly 32 bytes (256 bits) for AES-256-CBC'), { status: 409 });

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(role, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
};

export const decryptRole = (encryptedData: string, iv: string): string => {
  try {
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt role: Invalid data or key');
  }
};