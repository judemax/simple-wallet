import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {AuthenticatedRequest} from "../types/authenticated.request";

export const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const req: AuthenticatedRequest = ctx .switchToHttp() .getRequest();
        return req.user || null;
    },
);
