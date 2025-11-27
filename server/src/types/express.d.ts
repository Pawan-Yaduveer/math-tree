import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      username: string;
      role: IUser['role'];
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
