import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import {UserModel} from "./user.model";
import {RedisModule} from "../redis/redis.module";
import {UserService} from "./user.service";
import {UserRepository} from "./user.repository";
import {CryptoService} from "../crypto/crypto.service";

@Module({
    imports: [
        SequelizeModule.forFeature([UserModel]),
        RedisModule,
    ],
    providers: [
        UserService,
        UserRepository,
        CryptoService,
    ],
    exports: [UserService],
})
export class UserModule {}
