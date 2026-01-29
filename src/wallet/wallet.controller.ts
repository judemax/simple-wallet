import {Body, Controller, Delete, Get, Param, Patch, Post} from "@nestjs/common";
import {WalletService} from "./wallet.service";
import {IWalletCreate, IWalletUpdate} from "./wallet.interfaces";
import {CurrentUser} from "../common/decorators/current.user.decorator";
import {IUserItem} from "../user/user.interfaces";

@Controller("wallets")
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get()
    list(@CurrentUser() user: IUserItem) {
        return this.walletService.listByAPI(user);
    }

    @Get(":name")
    findOne(@CurrentUser() user: IUserItem, @Param("name") name: string) {
        return this.walletService.findOneByAPI(user, name);
    }

    @Post()
    create(@CurrentUser() user: IUserItem, @Body() data: IWalletCreate) {
        return this.walletService.createByAPI(user, data);
    }

    @Patch(":name")
    update(@CurrentUser() user: IUserItem, @Param("name") name: string, @Body() data: IWalletUpdate) {
        return this.walletService.updateByAPI(user, name, data);
    }

    @Delete(":name")
    remove(@CurrentUser() user: IUserItem, @Param("name") name: string) {
        return this.walletService.removeByAPI(user, name);
    }
}
