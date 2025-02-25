import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export const User = createParamDecorator(
  (data: keyof RequestWithUser['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
