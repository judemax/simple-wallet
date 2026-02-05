import {INestApplication} from "@nestjs/common";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import {ISupertestResponse} from "../interfaces";
import {getTestingApp} from "../testingApp";
import {UserService} from "../../src/user/user.service";
import {IWalletAPIResult, IWalletCreate} from "../../src/wallet/wallet.interfaces";
import {IErrorResponse} from "../../src/common/filters/interfaces";

describe("WalletController (e2e)", () => {
    let app: INestApplication;
    let request: TestAgent<supertest.Test>;
    let apiKey: string;
    const chatId: string = (Math.random() * 1000000 | 0).toString();

    beforeAll(async () => {
        app = await getTestingApp();
        const userService: UserService = app.get(UserService);
        await userService.getByChatId(chatId);
        apiKey = await userService.getAPIKey(chatId);

        request = supertest(app.getHttpServer());
    });

    afterAll(async () => {
        await app.close();
    });

    describe("POST /api/wallets", () => {
        it("Should create new wallet", async () => {
            const res: ISupertestResponse<IWalletCreate> = await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "main",
                });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe("main");
            expect(res.body.mnemonic).toBeDefined();
        });

        it("Should add exists wallet", async () => {
            const mnemonic: string = "away rescue blouse confirm poverty melody letter noodle sibling print kidney acid";

            const res: ISupertestResponse<IWalletCreate> = await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "savings",
                    mnemonic,
                });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe("savings");
            expect(res.body.mnemonic).toBeUndefined();
        });

        it("Should return key_is_empty error", async () => {
            const res: ISupertestResponse<IErrorResponse> = await request
                .post("/api/wallets")
                .send({
                    name: "main",
                });

            expect(res.status).toBe(400);
            expect(res.body.code).toBe("key_is_empty");
        });

        it("Should return invalid_key error", async () => {
            const res: ISupertestResponse<IErrorResponse> = await request
                .post("/api/wallets")
                .set("x-key", "wrong API key")
                .send({
                    name: "main",
                });

            expect(res.status).toBe(400);
            expect(res.body.code).toBe("invalid_key");
        });

        it("Should return wallet_with_name_already_exists error", async () => {
            await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "exists",
                });

            const res: ISupertestResponse<IErrorResponse> = await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "exists",
                });

            expect(res.status).toBe(400);
            expect(res.body.code).toBe("wallet_with_name_already_exists");
        });

        it("Should return incorrect_mnemonic error", async () => {
            const res: ISupertestResponse<IErrorResponse> = await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "incorrect_mnemonic",
                    mnemonic: "one two",
                });

            expect(res.status).toBe(400);
            expect(res.body.code).toBe("incorrect_mnemonic");
        });

        it("Should return name_not_filled error", async () => {
            const res: ISupertestResponse<IErrorResponse> = await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    mnemonic: "one two",
                });

            expect(res.status).toBe(400);
            expect(res.body.code).toBe("name_not_filled");
        });
    });

    describe("GET /api/wallets", () => {
        it("Should return existing wallets", async () => {
            await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "main_in_list",
                });

            const res: ISupertestResponse<ReadonlyArray<IWalletAPIResult>> = await request
                .get("/api/wallets")
                .set("x-key", apiKey)
                .send();

            expect(res.body.length).toBeGreaterThan(0);

            const wallet: IWalletAPIResult | undefined = res.body.find(w => w.name === "main_in_list");

            expect(wallet).toBeDefined();
            expect(wallet?.name).toBe("main_in_list");
        });
    });

    describe("GET /api/wallets/:name", () => {
        it("Should return wallet", async () => {
            await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "wallet_by_get",
                });

            const res: ISupertestResponse<IWalletAPIResult> = await request
                .get("/api/wallets/wallet_by_get")
                .set("x-key", apiKey)
                .send();

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                name: "wallet_by_get",
            });
        });
    });

    describe("PATCH /api/wallets/:name", () => {
        it("Should change wallet's name", async () => {
            await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "wallet_to_patch",
                });

            const res: ISupertestResponse<IWalletAPIResult> = await request
                .patch("/api/wallets/wallet_to_patch")
                .set("x-key", apiKey)
                .send({
                    name: "patched_wallet",
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                name: "patched_wallet",
            });

            const notFoundOld: ISupertestResponse<IErrorResponse> = await request
                .get("/api/wallets/wallet_to_patch")
                .set("x-key", apiKey)
                .send();

            expect(notFoundOld.status).toBe(400);
            expect(notFoundOld.body.code).toBe("wallet_not_exists");

            const foundNew: ISupertestResponse<IWalletAPIResult> = await request
                .get("/api/wallets/patched_wallet")
                .set("x-key", apiKey)
                .send();

            expect(foundNew.status).toBe(200);
            expect(foundNew.body).toEqual({
                name: "patched_wallet",
            });
        });
    });

    describe("DELETE /api/wallets/:name", () => {
        it("Should remove wallet", async () => {
            await request
                .post("/api/wallets")
                .set("x-key", apiKey)
                .send({
                    name: "wallet_to_remove",
                });

            const res: ISupertestResponse<any> = await request
                .delete("/api/wallets/wallet_to_remove")
                .set("x-key", apiKey)
                .send();

            expect(res.status).toBe(200);

            const notFoundAfterRemove: ISupertestResponse<IErrorResponse> = await request
                .get("/api/wallets/wallet_to_patch")
                .set("x-key", apiKey)
                .send();

            expect(notFoundAfterRemove.status).toBe(400);
            expect(notFoundAfterRemove.body.code).toBe("wallet_not_exists");
        });
    });
});
