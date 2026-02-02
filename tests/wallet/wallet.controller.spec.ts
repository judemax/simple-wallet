import {WalletController} from "../../src/wallet/wallet.controller";
import {WalletService} from "../../src/wallet/wallet.service";
import {IUserItem} from "../../src/user/user.interfaces";
import {
    IWalletAPIExtendedResult,
    IWalletAPIResult,
    IWalletCreate,
    IWalletUpdate,
} from "../../src/wallet/wallet.interfaces";
import {assertion} from "../../src/utils/assertion";

describe("WalletController", () => {
    let controller: WalletController;
    let service: jest.Mocked<WalletService>;

    const mockUser: IUserItem = {
        chatId: "123",
        userSalt: "userSalt",
        apiKeyHash: "ffddee",
    };

    beforeEach(() => {
        service = {
            createByAPI: jest.fn(),
            findOneByAPI: jest.fn(),
            listByAPI: jest.fn(),
            updateByAPI: jest.fn(),
            removeByAPI: jest.fn(),
        } as any;

        controller = new WalletController(service);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("list()", () => {
        it("Should call listByAPI and return result", async () => {
            const wallets: ReadonlyArray<IWalletAPIResult> = [
                {name: "main"},
                {name: "savings"},
                {name: "cold"},
            ];

            service.listByAPI.mockResolvedValue(wallets);

            const result: ReadonlyArray<IWalletAPIResult> = await controller.list(mockUser);

            expect(service.listByAPI).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(wallets);
        });
    });

    describe("findOne()", () => {
        it("Should call findOneByAPI and return result", async () => {
            const wallet: IWalletAPIResult = {name: "main"};

            service.findOneByAPI.mockResolvedValue(wallet);

            const result: IWalletAPIResult = await controller.findOne(mockUser, "MAIN");

            expect(service.findOneByAPI).toHaveBeenCalledWith(mockUser, "MAIN");
            expect(result).toEqual(wallet);
        });
    });

    describe("create()", () => {
        it("Should call createByAPI and return result", async () => {
            const wallet: IWalletAPIResult = {name: "main"};

            const data: IWalletCreate = {
                name: "MAIN",
                mnemonic: " one two ",
            };

            service.createByAPI.mockResolvedValue(wallet);

            const result: IWalletAPIResult = await controller.create(mockUser, data);

            expect(service.createByAPI).toHaveBeenCalledWith(mockUser, data);
            expect(result).toEqual(wallet);
        });

        it("Should call createByAPI without mnemonic and return result", async () => {
            const wallet: IWalletAPIExtendedResult = {
                name: "main",
                mnemonic: " one two ",
            };

            const data: IWalletCreate = {
                name: "MAIN",
            };

            service.createByAPI.mockResolvedValue(wallet);

            function assertIsExtended(
                result: IWalletAPIResult | IWalletAPIExtendedResult,
            ): asserts result is IWalletAPIExtendedResult {
                assertion("mnemonic" in result, "result_not_extended", "Result is not extended");
            }

            const result: IWalletAPIExtendedResult | IWalletAPIResult = await controller.create(mockUser, data);

            assertIsExtended(result);

            expect(service.createByAPI).toHaveBeenCalledWith(mockUser, data);
            expect(result).toEqual(wallet);
        });
    });

    describe("update()", () => {
        it("Should call updateByAPI and return result", async () => {
            const wallet: IWalletAPIResult = {name: "cold"};
            const data: IWalletUpdate = {name: "cold"};

            service.updateByAPI.mockResolvedValue(wallet);

            const result: IWalletAPIResult = await controller.update(
                mockUser,
                "MAIN",
                data,
            );

            expect(service.updateByAPI).toHaveBeenCalledWith(mockUser, "MAIN", data);
            expect(result).toEqual(wallet);
        });
    });

    describe("remove()", () => {
        it("Should call removeByAPI", async () => {
            service.removeByAPI.mockResolvedValue(undefined);

            await controller.remove(mockUser, "MAIN");

            expect(service.removeByAPI).toHaveBeenCalledWith(mockUser, "MAIN");
        });
    });
});
