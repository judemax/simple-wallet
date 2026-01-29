import {Module} from "@nestjs/common";
import {UserModule} from "../user/user.module";
import {WalletModule} from "../wallet/wallet.module";
import {APP_GUARD} from "@nestjs/core";
import {ApiGuard} from "./api.guard";

@Module({
    imports: [UserModule, WalletModule],
    providers: [{
        provide: APP_GUARD,
        useClass: ApiGuard,
    }],
})
export class ApiModule {}
