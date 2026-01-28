import {Injectable} from "@nestjs/common";
import crypto from "crypto";
import * as bip39 from "bip39";

@Injectable()
export class CryptoService {
    generateSalt(size: number = 32): string {
        return crypto.randomBytes(size).toString("base64url");
    }

    hashData(data: string, salt: string): string {
        return crypto
            .pbkdf2Sync(data, salt, 100000, 32, "sha512")
            .toString("base64url");
    }

    encrypt<D>(data: D, mainSalt: string, salt: string): string {
        const iv: Buffer = crypto.randomBytes(18);
        const key: Buffer = crypto.scryptSync(salt, mainSalt, 32);
        const cipher: crypto.Cipheriv = crypto.createCipheriv("aes-256-cbc", key, iv.subarray(0, 16));
        return iv.toString("base64url")
            + cipher.update(JSON.stringify(data, (_, v) =>
                typeof v === "bigint" ? v.toString() : v,
            ), "utf8", "base64url")
            + cipher.final("base64url");
    };

    decrypt<D>(encrypted: string, mainSalt: string, salt: string): D {
        const iv: Buffer = Buffer.from(encrypted.slice(0, 24), "base64url");
        const key: Buffer = crypto.scryptSync(salt, mainSalt, 32);
        const decipher: crypto.Decipheriv = crypto.createDecipheriv("aes-256-cbc", key, iv.subarray(0, 16));
        return JSON.parse(
            decipher.update(encrypted.slice(24), "base64url", "utf8")
            + decipher.final("utf8"),
        );
    }

    generateMnemonic(): string {
        return bip39.generateMnemonic();
    }

    fullyCorrectMnemonic(mnemonic: string): boolean {
        return bip39.validateMnemonic(mnemonic);
    }

    correctMnemonic(mnemonic: string): boolean {
        return mnemonic.trim().split(/\s+/).length >= 12;
    }
}
