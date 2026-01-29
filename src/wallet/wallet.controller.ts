import {Body, Controller, Delete, Get, Param, Patch, Post} from "@nestjs/common";
import {WalletService} from "./wallet.service";
import {IWalletCreate, IWalletUpdate} from "./wallet.interfaces";

@Controller("wallets")
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get()
    list() {
        return this.walletService.listByAPI();
    }

    @Get(":name")
    findOne(@Param("name") name: string) {
        return this.walletService.findOneByAPI(name);
    }

    @Post()
    create(@Body() data: IWalletCreate) {
        return this.walletService.createByAPI(data);
    }

    @Patch(":name")
    update(@Param("name") name: string, @Body() data: IWalletUpdate) {
        return this.walletService.updateByAPI(name, data);
    }

    @Delete(":name")
    remove(@Param("name") name: string) {
        return this.walletService.removeByAPI(name);
    }
}
