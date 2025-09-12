import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuth } from '../types/userAuth.type';
import { Request } from 'express';

export const AuthUser = createParamDecorator<UserAuth>(
  (data: unknown, ctx: ExecutionContext): UserAuth => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
