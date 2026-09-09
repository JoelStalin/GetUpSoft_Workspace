import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  password_hash: string | null;
}

interface SessionData {
  user_id: string;
  created_at: string;
  last_activity: string;
}

@Injectable()
export class AuthService {
  private readonly usersById = new Map<string, UserProfile>();
  private readonly userIdByEmail = new Map<string, string>();
  private readonly sessions = new Map<string, SessionData>();

  loginOrRegister(email: string, name?: string) {
    let user = this.getUserByEmail(email);
    if (!user) {
      if (!name) {
        throw new UnauthorizedException('Name required for new users');
      }
      user = this.createUser(email, name);
    }

    this.updateLastLogin(user.user_id);
    const session_id = this.createSession(user.user_id);
    return {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      session_id,
      message: `Welcome${user.created_at === user.last_login ? '' : ' back'} ${user.name}!`,
    };
  }

  loginWithPassword(email: string, password: string) {
    const user = this.getUserByEmail(email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!this.verifyPassword(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.updateLastLogin(user.user_id);
    const session_id = this.createSession(user.user_id);
    return {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      session_id,
      message: `Welcome back ${user.name}!`,
    };
  }

  logout(sessionId?: string) {
    if (sessionId) this.invalidateSession(sessionId);
    return { message: 'Logged out successfully' };
  }

  me(sessionId?: string) {
    const userId = this.validateSession(sessionId);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = this.usersById.get(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      last_login: user.last_login,
      is_active: user.is_active,
    };
  }

  verifySession(sessionId?: string) {
    const userId = this.validateSession(sessionId);
    return { valid: Boolean(userId), user_id: userId ?? null };
  }

  getSessionUserId(sessionId?: string) {
    return this.validateSession(sessionId);
  }

  private createUser(email: string, name: string) {
    const user_id = randomUUID();
    const now = new Date().toISOString();
    const user: UserProfile = {
      user_id,
      email: email.toLowerCase(),
      name,
      created_at: now,
      last_login: now,
      is_active: true,
      password_hash: null,
    };
    this.usersById.set(user_id, user);
    this.userIdByEmail.set(user.email, user_id);
    return user;
  }

  private getUserByEmail(email: string) {
    const id = this.userIdByEmail.get(email.toLowerCase());
    return id ? this.usersById.get(id) ?? null : null;
  }

  private updateLastLogin(userId: string) {
    const user = this.usersById.get(userId);
    if (!user) return;
    user.last_login = new Date().toISOString();
    this.usersById.set(userId, user);
  }

  private createSession(userId: string) {
    const sessionId = randomUUID();
    const now = new Date().toISOString();
    this.sessions.set(sessionId, {
      user_id: userId,
      created_at: now,
      last_activity: now,
    });
    return sessionId;
  }

  private invalidateSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  private validateSession(sessionId?: string) {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.last_activity = new Date().toISOString();
    this.sessions.set(sessionId, session);
    return session.user_id;
  }

  private verifyPassword(password: string, passwordHash: string) {
    const digest = createHash('sha256').update(password).digest('hex');
    return digest === passwordHash;
  }
}
