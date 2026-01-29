import {IUserItem} from "../../user/user.interfaces";
import {FastifyRequest} from "fastify";

export interface AuthenticatedRequest extends FastifyRequest {
    user: IUserItem;
}
