import {Inject, Injectable, Scope} from "@nestjs/common";
import {REQUEST} from "@nestjs/core";
import {AuthenticatedRequest} from "../types/authenticated.request";
import {IUserItem} from "../../user/user.interfaces";

@Injectable({scope: Scope.REQUEST})
export class CurrentUserService {
    constructor(
        @Inject(REQUEST)
        private readonly req: AuthenticatedRequest,
    ) {}

    get user(): IUserItem | null {
        return this.req.user || null;
    }
}
