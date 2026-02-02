import {WalletService} from "../../src/wallet/wallet.service";
import {WalletRepository} from "../../src/wallet/wallet.repository";
import {CryptoService} from "../../src/crypto/crypto.service";
import {RedisClientType} from "redis";
import {REDIS} from "../../src/redis/redis.module";
import {Test, TestingModule} from "@nestjs/testing";
import {
    IExtendedWalletItem,
    IWalletAPIExtendedResult,
    IWalletAPIResult,
    IWalletItem,
} from "../../src/wallet/wallet.interfaces";
import {assertion} from "../../src/utils/assertion";

describe("WalletService", () => {
    let service: WalletService;
    let repo: jest.Mocked<WalletRepository>;
    let crypto: jest.Mocked<CryptoService>;
    let redis: jest.Mocked<RedisClientType>;

    const originalEnv: any = process.env;

    beforeEach(async () => {
        process.env = {...originalEnv};

        repo = {
            add: jest.fn(),
            get: jest.fn(),
            list: jest.fn(),
            listByChatId: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            nameAlreadyExists: jest.fn(),
            mnemonicAlreadyExists: jest.fn(),
        } as any;

        crypto = {
            generateMnemonic: jest.fn(),
            generateSalt: jest.fn(),
            encrypt: jest.fn(),
            hashData: jest.fn(),
            correctMnemonic: jest.fn(),
            fullyCorrectMnemonic: jest.fn(),
        } as any;

        redis = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WalletService,
                {provide: WalletRepository, useValue: repo},
                {provide: CryptoService, useValue: crypto},
                {provide: REDIS, useValue: redis},
            ],
        }).compile();

        service = module.get(WalletService);

        process.env.APP_SALT = "salt";

        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe("create()", () => {
        it("Should generate mnemonic and return it", async () => {
            crypto.generateMnemonic.mockReturnValue("one two three four five six seven eight nine ten eleven twelve");
            crypto.generateSalt.mockReturnValue("walletSalt");
            crypto.hashData.mockReturnValue("hashData");
            crypto.encrypt.mockReturnValue("encrypted");
            crypto.correctMnemonic.mockReturnValue(true);

            repo.nameAlreadyExists.mockResolvedValue(false);
            repo.mnemonicAlreadyExists.mockResolvedValue(false);

            repo.add.mockResolvedValue({
                chatId: "1",
                name: "main",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IExtendedWalletItem = await service.create("1", "Main");

            expect(result.mnemonic).toBe(
                "one two three four five six seven eight nine ten eleven twelve",
            );
            expect(repo.add).toHaveBeenCalled();
        });
    });

    describe("add()", () => {
        it("Should normalize name and mnemonic, save wallet and cache it", async () => {
            crypto.generateSalt.mockReturnValue("walletSalt");
            crypto.hashData.mockReturnValue("hashData");
            crypto.encrypt.mockReturnValue("encrypted");
            crypto.correctMnemonic.mockReturnValue(true);

            repo.nameAlreadyExists.mockResolvedValue(false);
            repo.mnemonicAlreadyExists.mockResolvedValue(false);

            repo.add.mockResolvedValue({
                chatId: "1",
                name: "main11",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletItem = await service.add(
                "1",
                "  ONE    TWO   ",
                "   MAIN11   ",
            );

            expect(repo.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "main11",
                    mnemonicHash: "hashData",
                }),
            );

            expect(redis.set).toHaveBeenCalled();
            expect(result.name).toBe("main11");
        });
    });

    describe("findOneByAPI()", () => {
        it("Should return cached wallet if exists", async () => {
            redis.get.mockResolvedValue(JSON.stringify({
                chatId: "1",
                name: "main",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            }));

            const result: IWalletAPIResult = await service.findOneByAPI(
                {chatId: "1"} as any,
                "main",
            );

            expect(repo.get).not.toHaveBeenCalled();
            expect(result.name).toBe("main");
        });

        it("Should fetch from repo if cache empty", async () => {
            redis.get.mockResolvedValue(null);

            repo.get.mockResolvedValue({
                chatId: "1",
                name: "main",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletAPIResult = await service.findOneByAPI(
                {chatId: "1"} as any,
                "main",
            );

            expect(repo.get).toHaveBeenCalled();
            expect(result.name).toBe("main");
        });
    });

    describe("remove()", () => {
        it("Should remove wallet from repo and redis", async () => {
            repo.remove.mockResolvedValue(undefined);
            redis.del.mockResolvedValue(1);

            await service.remove("1", "MAIN");

            expect(repo.remove).toHaveBeenCalledWith("1", "main");
            expect(redis.del).toHaveBeenCalledWith("wallet:1:main");
        });
    });

    describe("fullyCorrectMnemonic()", () => {
        it("Should return, that mnemonic is fully correct", () => {
            crypto.fullyCorrectMnemonic.mockReturnValue(true);

            const result: boolean = service.fullyCorrectMnemonic("one two");

            expect(result).toBe(true);
        });

        it("Should return, that mnemonic is not fully correct", () => {
            crypto.fullyCorrectMnemonic.mockReturnValue(false);

            const result: boolean = service.fullyCorrectMnemonic("one two");

            expect(result).toBe(false);
        });
    });

    describe("correctMnemonic()", () => {
        it("Should return, that mnemonic is correct", () => {
            crypto.correctMnemonic.mockReturnValue(true);

            const result: boolean = service.correctMnemonic("one two");

            expect(result).toBe(true);
        });

        it("Should return, that mnemonic is not correct", () => {
            crypto.correctMnemonic.mockReturnValue(false);

            const result: boolean = service.correctMnemonic("one two");

            expect(result).toBe(false);
        });
    });

    describe("list()", () => {
        it("Should return the list of wallets", async () => {
            const wallets: ReadonlyArray<string> = [
                "main",
                "savings",
                "cold",
            ];

            repo.listByChatId.mockResolvedValue(wallets);

            const result: ReadonlyArray<string> = await service.list("111");

            expect(repo.listByChatId).toHaveBeenCalledTimes(1);
            expect(repo.listByChatId).toHaveBeenCalledWith("111");
            expect(result).toEqual(wallets);
        });
    });

    describe("createByAPI()", () => {
        it("Should create wallet by API", async () => {
            crypto.generateMnemonic.mockReturnValue("one two three four five six seven eight nine ten eleven twelve");
            crypto.generateSalt.mockReturnValue("walletSalt");
            crypto.hashData.mockReturnValue("hashData");
            crypto.encrypt.mockReturnValue("encrypted");
            crypto.correctMnemonic.mockReturnValue(true);

            repo.nameAlreadyExists.mockResolvedValue(false);
            repo.mnemonicAlreadyExists.mockResolvedValue(false);

            repo.add.mockResolvedValue({
                chatId: "1",
                name: "main",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletAPIResult | IWalletAPIExtendedResult = await service.createByAPI({
                chatId: "1",
            } as any, {
                name: "main",
            });

            function assertIsExtended(
                result: IWalletAPIResult | IWalletAPIExtendedResult,
            ): asserts result is IWalletAPIExtendedResult {
                assertion("mnemonic" in result, "result_not_extended", "Result is not extended");
            }

            assertIsExtended(result);

            expect(result.mnemonic).toBe(
                "one two three four five six seven eight nine ten eleven twelve",
            );
            expect(result.name).toBe("main");
            expect(repo.add).toHaveBeenCalled();
        });

        it("Should add wallet by API", async () => {
            crypto.generateSalt.mockReturnValue("walletSalt");
            crypto.hashData.mockReturnValue("hashData");
            crypto.encrypt.mockReturnValue("encrypted");
            crypto.correctMnemonic.mockReturnValue(true);

            repo.nameAlreadyExists.mockResolvedValue(false);
            repo.mnemonicAlreadyExists.mockResolvedValue(false);

            repo.add.mockResolvedValue({
                chatId: "1",
                name: "main11",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletAPIResult = await service.createByAPI({
                chatId: "1",
            } as any, {
                mnemonic: "  ONE    TWO   ",
                name: "   MAIN11   ",
            });

            expect(repo.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "main11",
                    mnemonicHash: "hashData",
                }),
            );

            expect(redis.set).toHaveBeenCalled();
            expect(result.name).toBe("main11");
            expect("mnemonic" in result).toBe(false);
        });
    });

    describe("listByAPI()", () => {
        it("Should return the list of wallets", async () => {
            const wallets: ReadonlyArray<string> = [
                "main",
                "savings",
                "cold",
            ];

            repo.list.mockResolvedValue(wallets.map(w => ({
                chatId: "1",
                name: w,
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            })));

            const result: ReadonlyArray<IWalletAPIResult> = await service.listByAPI({
                chatId: "1",
            } as any);

            expect(repo.list).toHaveBeenCalledTimes(1);
            expect(repo.list).toHaveBeenCalledWith("1");
            expect(result).toEqual(wallets.map(w => ({name: w})));
        });
    });

    describe("removeByAPI()", () => {
        it("Should remove wallet from repo and redis", async () => {
            repo.remove.mockResolvedValue(undefined);
            redis.del.mockResolvedValue(1);

            await service.removeByAPI({
                chatId: "1",
            } as any, "MAIN");

            expect(repo.remove).toHaveBeenCalledWith("1", "main");
            expect(redis.del).toHaveBeenCalledWith("wallet:1:main");
        });
    });

    describe("updateByAPI()", () => {
        it("Should change wallet's name", async () => {
            repo.update.mockResolvedValue({
                chatId: "1",
                name: "cold",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletAPIResult = await service.updateByAPI({
                chatId: "1",
            } as any, "MAIN", {name: "COLD"});

            expect(result).toEqual({name: "cold"});
        });
    });

    describe("APP_SALT not defined", () => {
        beforeEach(() => {
            delete process.env.APP_SALT;
        });

        it("Should add wallet without defined APP_SALT", async () => {
            crypto.generateSalt.mockReturnValue("walletSalt");
            crypto.hashData.mockReturnValue("hashData");
            crypto.encrypt.mockReturnValue("encrypted");
            crypto.correctMnemonic.mockReturnValue(true);

            repo.nameAlreadyExists.mockResolvedValue(false);
            repo.mnemonicAlreadyExists.mockResolvedValue(false);

            repo.add.mockResolvedValue({
                chatId: "1",
                name: "main11",
                walletSalt: "walletSalt",
                mnemonicHash: "hashData",
            });

            const result: IWalletItem = await service.add(
                "1",
                "  ONE    TWO   ",
                "   MAIN11   ",
            );

            expect(repo.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "main11",
                    mnemonicHash: "hashData",
                }),
            );

            expect(redis.set).toHaveBeenCalled();
            expect(result.name).toBe("main11");
        });
    });
});
