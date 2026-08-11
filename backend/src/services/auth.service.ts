import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { User, JWTPayload } from '../types';

export class AuthService {
  static async login(usernameOrEmail: string, passwordPlain: string): Promise<{ token: string; user: Partial<User> }> {
    const sql = `
      SELECT id, username, email, password_hash, name, role
      FROM users
      WHERE username = ? OR email = ?
    `;
    const [rows]: any = await db.query(sql, [usernameOrEmail, usernameOrEmail]);

    if (!rows || rows.length === 0) {
      throw new Error('Invalid username/email or password');
    }

    const user: User = rows[0];

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash || '');
    if (!isPasswordValid) {
      throw new Error('Invalid username/email or password');
    }

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('SERVER CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
    }

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  static async getUserById(id: number): Promise<Partial<User> | null> {
    const [rows]: any = await db.query(
      'SELECT id, username, email, name, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!rows || rows.length === 0) return null;
    return rows[0];
  }
}
