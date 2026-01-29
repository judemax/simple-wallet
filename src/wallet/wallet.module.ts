import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import {WalletService} from "./wallet.service";
import {WalletModel} from "./wallet.model";
import {RedisModule} from "../redis/redis.module";
import {WalletRepository} from "./wallet.repository";
import {CryptoService} from "../crypto/crypto.service";
import {WalletController} from "./wallet.controller";
import {CurrentUserService} from "../common/service/current.user.service";

@Module({
    controllers: [WalletController],
    imports: [
        SequelizeModule.forFeature([WalletModel]),
        RedisModule,
    ],
    providers: [
        WalletService,
        WalletRepository,
        CryptoService,
        CurrentUserService,
    ],
    exports: [WalletService],
})
export class WalletModule {}
