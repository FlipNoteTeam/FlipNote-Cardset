import 'express';
import { UserAuth } from './userAuth.type';

declare module 'express' {
  export interface Request {
    user?: UserAuth;
  }
}
