import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {AssertionUtils} from "../utils/assertion.utils";
import {UserService} from "../user/user.service";
import {IUserItem} from "../user/user.interfaces";
import {AuthenticatedRequest} from "../common/types/authenticated.request";

@Injectable()
export class ApiGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== "http") {
            return false;
        }
        const req: AuthenticatedRequest = context.switchToHttp().getRequest();
        const apiKey: string = typeof req.headers["x-key"] === "string" ? req.headers["x-key"] : "";
        AssertionUtils.isAPIKeyNotEmpty(apiKey);

        const user: IUserItem | null = await this.userService.getByAPIKey(apiKey);
        AssertionUtils.isValidAPIKey(user);

        req.user = user;

        return true;
    }
}
