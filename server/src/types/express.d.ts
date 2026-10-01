import { AuthUser } from './index';

declare global {
  namespace Express {
    // Extend passport's Express.User
    interface User extends AuthUser {}

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
