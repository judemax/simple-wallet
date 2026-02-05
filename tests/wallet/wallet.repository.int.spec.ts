import {Sequelize} from "sequelize-typescript";
import {WalletRepository} from "../../src/wallet/wallet.repository";
import {WalletModel} from "../../src/wallet/wallet.model";
import crypto from "crypto";
import {IWalletEncryptedItem, IWalletItem} from "../../src/wallet/wallet.interfaces";

describe("WalletRepository (integration)", () => {
    let sequelize: Sequelize;
    let repo: WalletRepository;

    function rndHash(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    beforeAll(async () => {
        sequelize = new Sequelize("sqlite://:memory:");
        sequelize.addModels([WalletModel]);
        await sequelize.sync({force: true});

        repo = new WalletRepository(WalletModel, sequelize);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe("listByChatId", () => {
        it("Should return all wallets by chatId", async () => {
            await WalletModel.bulkCreate([
                {chatId: "1", name: "main", walletSalt: "", mnemonicHash: rndHash(), encrypted: ""},
                {chatId: "1", name: "savings", walletSalt: "", mnemonicHash: rndHash(), encrypted: ""},
                {chatId: "2", name: "other", walletSalt: "", mnemonicHash: rndHash(), encrypted: ""},
            ] as any);

            const result: ReadonlyArray<string> = await repo.listByChatId("1");

            expect(result).toEqual(["main", "savings"]);
        });
    });

    describe("nameAlreadyExists", () => {
        it("Should return true for exists name and false for non-exists", async () => {
            await WalletModel.create({
                chatId: "3",
                name: "exists",
                walletSalt: "",
                mnemonicHash: rndHash(),
                encrypted: "",
            });

            const existsResult: boolean = await repo.nameAlreadyExists("3", "exists");
            const nonExistsResult: boolean = await repo.nameAlreadyExists("3", "nonexists");

            expect(existsResult).toBe(true);
            expect(nonExistsResult).toBe(false);
        });

        it("Should return false for exists name but other chatId", async () => {
            await WalletModel.create({
                chatId: "5",
                name: "exists",
                walletSalt: "",
                mnemonicHash: rndHash(),
                encrypted: "",
            });

            const result: boolean = await repo.nameAlreadyExists("4", "exists");

            expect(result).toBe(false);
        });
    });

    describe("mnemonicAlreadyExists", () => {
        it("Should return true for exists hash and false for non-exists globally", async () => {
            const mnemonicHash: string = rndHash();

            await WalletModel.create({
                chatId: "6",
                name: "exists",
                walletSalt: "",
                mnemonicHash,
                encrypted: "",
            });

            const existsResult: boolean = await repo.mnemonicAlreadyExists(mnemonicHash);
            const nonExistsResult: boolean = await repo.mnemonicAlreadyExists(rndHash());

            expect(existsResult).toBe(true);
            expect(nonExistsResult).toBe(false);
        });
    });

    describe("add", () => {
        it("Should create new wallet and return its item", async () => {
            const mnemonicHash: string = rndHash();

            const result: IWalletItem = await repo.add({
                chatId: "7",
                mnemonicHash,
                encrypted: "",
                walletSalt: "",
                name: "main",
            });

            expect(result).toEqual({
                chatId: "7",
                mnemonicHash,
                walletSalt: "",
                name: "main",
            });
        });

        it("Should throw error while add wallet with the same hash", async () => {
            const mnemonicHash: string = rndHash();

            await repo.add({
                chatId: "8",
                mnemonicHash,
                encrypted: "",
                walletSalt: "",
                name: "main",
            });

            await expect(repo.add({
                chatId: "9",
                mnemonicHash,
                encrypted: "",
                walletSalt: "",
                name: "main",
            })).rejects.toThrow();
        });
    });

    describe("remove", () => {
        it("Should remove wallet even twice", async () => {
            await WalletModel.create({
                chatId: "10",
                name: "main",
                walletSalt: "",
                mnemonicHash: rndHash(),
                encrypted: "",
            });

            const itemBeforeRemove: WalletModel | null = await WalletModel.findOne({
                where: {chatId: "10", name: "main"},
            });

            expect(itemBeforeRemove).not.toBeNull();

            await repo.remove("10", "main");

            const itemAfterRemove: WalletModel | null = await WalletModel.findOne({
                where: {chatId: "10", name: "main"},
            });

            expect(itemAfterRemove).toBeNull();

            await expect(repo.remove("10", "main")).resolves.not.toThrow();
        });
    });

    describe("get", () => {
        it("Should return wallet item", async () => {
            const walletSalt: string = rndHash();
            const mnemonicHash: string = rndHash();

            await WalletModel.create({
                chatId: "11",
                name: "main",
                walletSalt,
                mnemonicHash,
                encrypted: "",
            });

            const result: IWalletItem | null = await repo.get("11", "main");

            expect(result).toEqual({
                chatId: "11",
                name: "main",
                walletSalt,
                mnemonicHash,
            });
        });

        it("Should return null if not found", async () => {
            const result: IWalletItem | null = await repo.get("11", "savings");

            expect(result).toBeNull();
        });
    });

    describe("getEncrypted", () => {
        it("Should return wallet encrypted item", async () => {
            const walletSalt: string = rndHash();
            const mnemonicHash: string = rndHash();
            const encrypted: string = rndHash();

            await WalletModel.create({
                chatId: "12",
                name: "main",
                walletSalt,
                mnemonicHash,
                encrypted,
            });

            const result: IWalletEncryptedItem | null = await repo.getEncrypted("12", "main");

            expect(result).toEqual({
                walletSalt,
                encrypted,
            });
        });

        it("Should return null if not found", async () => {
            const result: IWalletEncryptedItem | null = await repo.getEncrypted("12", "savings");

            expect(result).toBeNull();
        });
    });

    describe("listByAPI", () => {
        it("Should return list", async () => {
            const mh1: string = rndHash();
            const mh2: string = rndHash();

            await WalletModel.bulkCreate([
                {chatId: "13", name: "main", walletSalt: "", mnemonicHash: mh1, encrypted: ""},
                {chatId: "13", name: "savings", walletSalt: "", mnemonicHash: mh2, encrypted: ""},
                {chatId: "14", name: "other", walletSalt: "", mnemonicHash: rndHash(), encrypted: ""},
            ] as any);

            const result: ReadonlyArray<IWalletItem> = await repo.listByAPI("13");

            expect(result).toEqual([{
                chatId: "13",
                name: "main",
                walletSalt: "",
                mnemonicHash: mh1,
            }, {
                chatId: "13",
                name: "savings",
                walletSalt: "",
                mnemonicHash: mh2,
            }]);
        });
    });

    describe("update", () => {
        it("Should update name and return item", async () => {
            const walletSalt: string = rndHash();
            const mnemonicHash: string = rndHash();

            await WalletModel.create({
                chatId: "14",
                name: "main",
                walletSalt,
                mnemonicHash,
                encrypted: "",
            });

            const result: IWalletItem | null = await repo.update("14", "main", {
                name: "savings",
            });

            expect(result).toEqual({
                chatId: "14",
                name: "savings",
                walletSalt,
                mnemonicHash,
            });
        });

        it("Should return null", async () => {
            const result: IWalletItem | null = await repo.update("14", "nonexists", {
                name: "exists",
            });

            expect(result).toBeNull();
        });
    });
});
