import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuth } from '../types/userAuth.type';

export const AuthUser = createParamDecorator<UserAuth>(
  (data: unknown, ctx: ExecutionContext): UserAuth => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
